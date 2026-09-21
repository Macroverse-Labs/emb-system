"""TC worker register — the Add-a-worker wizard, withdrawals and the register CSV.

Every query in this module filters on `contractor.company.id`. A trade contractor sees
their own workers and nothing else, so the company filter is not an optimisation to be
dropped later — it is the only thing separating one contractor's register from another's
on a shared project.
"""

import csv
import io
import json
from collections.abc import Iterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.contractor import WorkerDraft
from app.models.gc.enforcement import Block
from app.models.gc.workforce import Worker
from app.routers.tc.deps import Contractor, require_tc
from app.schemas.gc.common import ActionResult
from app.schemas.tc.workers import DraftIn, DraftOut, WithdrawIn, WorkerIn
from app.services.gc.audit import record_audit
from app.tasks.reports import WORKER_COLUMNS

router = APIRouter(prefix="/tc", tags=["tc"])


async def _load_worker(db: AsyncSession, tc: Contractor, worker_id: str) -> Worker:
    """Fetch one of this contractor's own workers, or 404.

    Another company's worker is reported as missing rather than forbidden: a 403 would
    confirm the id exists.
    """
    worker = await db.scalar(
        select(Worker).where(
            Worker.id == worker_id,
            Worker.company_id == tc.company.id,
            Worker.project_id == tc.project.id,
        )
    )
    if worker is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return worker


async def _load_draft(db: AsyncSession, tc: Contractor, draft_id: str) -> WorkerDraft:
    """Fetch one of this contractor's own drafts, or 404."""
    draft = await db.scalar(
        select(WorkerDraft).where(
            WorkerDraft.id == draft_id,
            WorkerDraft.company_id == tc.company.id,
            WorkerDraft.project_id == tc.project.id,
        )
    )
    if draft is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")
    return draft


def _out(draft: WorkerDraft) -> DraftOut:
    try:
        fields = json.loads(draft.payload)
    except ValueError:
        fields = {}
    return DraftOut(id=draft.id, step=draft.step, fields=fields if isinstance(fields, dict) else {})


async def _next_ref(db: AsyncSession, project_id: str, code: str) -> str:
    """Mint the next worker reference for the project, in the design's `EMB-04122` shape."""
    refs = (
        (await db.execute(select(Worker.worker_ref).where(Worker.project_id == project_id)))
        .scalars()
        .all()
    )
    tails = [r.rsplit("-", 1)[-1] for r in refs]
    highest = max((int(t) for t in tails if t.isdigit()), default=4000)
    return f"{code[:3].upper()}-{highest + 1:05d}"


@router.get("/workers/drafts", response_model=list[DraftOut])
async def list_drafts(
    tc: Contractor = Depends(require_tc("Add workers")),
    db: AsyncSession = Depends(get_db),
) -> list[DraftOut]:
    """List this company's part-filled wizards so any of them can be resumed."""
    drafts = (
        (
            await db.execute(
                select(WorkerDraft)
                .where(
                    WorkerDraft.company_id == tc.company.id,
                    WorkerDraft.project_id == tc.project.id,
                )
                .order_by(WorkerDraft.updated_at.desc())
            )
        )
        .scalars()
        .all()
    )
    return [_out(d) for d in drafts]


@router.post("/workers/drafts", response_model=DraftOut, status_code=status.HTTP_201_CREATED)
async def create_draft(
    payload: DraftIn,
    tc: Contractor = Depends(require_tc("Add workers")),
    db: AsyncSession = Depends(get_db),
) -> DraftOut:
    """Open a draft on the first step of the wizard."""
    draft = WorkerDraft(
        project_id=tc.project.id,
        company_id=tc.company.id,
        created_by=tc.user.id,
        step=payload.step,
        payload=json.dumps(payload.fields),
    )
    db.add(draft)
    # Only the draft's creation is audited, not each autosave: the wizard saves "as you
    # type", and an audit row per keystroke would bury the decisions the audit is for.
    await record_audit(
        db,
        project_id=tc.project.id,
        actor=tc.user,
        action="Worker draft started",
        obj=f"{tc.company.name} · step {payload.step}",
        after="Draft saved",
    )
    await db.commit()
    return _out(draft)


@router.put("/workers/drafts/{draft_id}", response_model=DraftOut)
async def save_draft(
    draft_id: str,
    payload: DraftIn,
    tc: Contractor = Depends(require_tc("Add workers")),
    db: AsyncSession = Depends(get_db),
) -> DraftOut:
    """Save the wizard's current step. 404s on another company's draft."""
    draft = await _load_draft(db, tc, draft_id)
    draft.step = payload.step
    draft.payload = json.dumps(payload.fields)
    await db.commit()
    return _out(draft)


@router.get("/workers/export")
async def export_register(
    tc: Contractor = Depends(require_tc("Run reports")),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Stream this company's register as CSV — the same columns as the GC's export."""
    workers = (
        (
            await db.execute(
                select(Worker)
                .where(
                    Worker.company_id == tc.company.id,
                    Worker.project_id == tc.project.id,
                )
                .order_by(Worker.name)
            )
        )
        .scalars()
        .all()
    )
    await record_audit(
        db,
        project_id=tc.project.id,
        actor=tc.user,
        action="Worker export downloaded",
        obj=f"{len(workers)} worker records · {tc.company.name}",
        after="Downloaded",
    )
    await db.commit()

    def rows() -> Iterator[str]:
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(WORKER_COLUMNS)
        for worker in workers:
            writer.writerow(
                [
                    worker.worker_ref,
                    worker.name,
                    tc.company.name,
                    worker.job_role,
                    worker.status,
                    worker.zones_permitted,
                ]
            )
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)
        if not workers:
            yield buf.getvalue()

    filename = f"{tc.company.name.replace(' ', '-').lower()}-register.csv"
    return StreamingResponse(
        rows(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/workers", response_model=ActionResult, status_code=status.HTTP_201_CREATED)
async def add_worker(
    payload: WorkerIn,
    tc: Contractor = Depends(require_tc("Add workers")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Submit the finished wizard. The worker lands pending until the GC validates them."""
    worker = Worker(
        project_id=tc.project.id,
        company_id=tc.company.id,
        name=payload.name,
        worker_ref=await _next_ref(db, tc.project.id, tc.project.code),
        status="pending",
        job_role=payload.job_role,
        nationality=payload.nationality,
        date_of_birth=payload.date_of_birth,
        sex=payload.sex,
        telephone=payload.telephone,
        address_local=payload.address_local,
        address_home=payload.address_home,
        next_of_kin=payload.next_of_kin,
        direct_employer=payload.direct_employer or tc.company.name,
    )
    db.add(worker)
    if payload.draft_id:
        await db.delete(await _load_draft(db, tc, payload.draft_id))
    await record_audit(
        db,
        project_id=tc.project.id,
        actor=tc.user,
        action="Worker submitted",
        obj=f"{worker.name} · {tc.company.name}",
        before="Draft",
        after="Pending GC validation",
    )
    await db.commit()
    return ActionResult(
        message="Worker submitted — the GC validates the documents, then you can book an induction"
    )


@router.post("/workers/{worker_id}/withdraw", response_model=ActionResult)
async def withdraw_worker(
    worker_id: str,
    payload: WithdrawIn,
    tc: Contractor = Depends(require_tc("Add workers")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Withdraw one of your own workers' access.

    There is deliberately no lift endpoint on the TC side: a contractor can pull access
    but only the GC can put it back, so reinstatement lives on `/gc/workers/blocks/{id}/lift`
    and nowhere here. Adding a TC lift would let a contractor undo an enforcement action.
    """
    worker = await _load_worker(db, tc, worker_id)
    if worker.status == "blocked":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"{worker.name} is already blocked"
        )
    worker.status = "blocked"
    db.add(
        Block(
            project_id=tc.project.id,
            worker_id=worker.id,
            worker_name=worker.name,
            company_name=tc.company.name,
            kind="Contractor",
            reason=payload.reason,
            when_label="Just now",
            route_back="GC administrator",
            colour="#B3261E",
        )
    )
    await record_audit(
        db,
        project_id=tc.project.id,
        actor=tc.user,
        action="Access withdrawn by contractor",
        obj=f"{worker.name} · {tc.company.name}",
        before="Cleared",
        after=f"Withdrawn — {payload.reason}",
    )
    await db.commit()
    return ActionResult(
        message=(
            f"Access withdrawal recorded for {worker.name} — "
            "the GC is notified, and only the GC can reinstate them"
        )
    )
