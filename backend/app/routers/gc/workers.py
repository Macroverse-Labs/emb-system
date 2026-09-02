"""Worker register actions — blocks, training, bulk edits, violations."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.enforcement import Block, Violation
from app.models.gc.org import Company, Project
from app.models.gc.workforce import TrainingRecord, Worker
from app.models.user import User
from app.routers.gc.bootstrap import site_now
from app.routers.gc.deps import get_project, require
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit
from app.tasks.reports import export_workers_csv

router = APIRouter(prefix="/gc/workers", tags=["gc"])


class BlockPayload(BaseModel):
    """Why access is being withdrawn, and what would earn it back."""

    reason: str
    route_back: str = "GC administrator"


class TrainingPayload(BaseModel):
    """A course the worker now holds, and when it lapses."""

    course: str
    expiry: str


class BulkZonesPayload(BaseModel):
    """The zones to grant to every selected worker."""

    worker_ids: list[str]
    zones: str


class BulkBlockPayload(BaseModel):
    """Why every selected worker is being blocked."""

    worker_ids: list[str]
    reason: str


class BulkExportPayload(BaseModel):
    """The workers whose records go into the CSV."""

    worker_ids: list[str]


class LiftPayload(BaseModel):
    """Why a block is being lifted. Recorded against the lifter's name."""

    reason: str


class ViolationPayload(BaseModel):
    """A breach as the recorder describes it on the Violations screen."""

    worker_name: str
    company_name: str
    description: str
    level: str


async def _load(db: AsyncSession, project_id: str, worker_id: str) -> Worker:
    worker = (
        await db.execute(
            select(Worker).where(Worker.id == worker_id, Worker.project_id == project_id)
        )
    ).scalar_one_or_none()
    if worker is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return worker


async def _load_many(db: AsyncSession, project_id: str, worker_ids: list[str]) -> list[Worker]:
    workers = list(
        (
            await db.execute(
                select(Worker).where(Worker.id.in_(worker_ids), Worker.project_id == project_id)
            )
        )
        .scalars()
        .all()
    )
    missing = set(worker_ids) - {w.id for w in workers}
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workers not found: {', '.join(sorted(missing))}",
        )
    return workers


async def _company_name(db: AsyncSession, worker: Worker) -> str:
    company = await db.get(Company, worker.company_id)
    return company.name if company else ""


async def _block_worker(
    db: AsyncSession,
    *,
    project: Project,
    user: User,
    worker: Worker,
    reason: str,
    route_back: str,
) -> str:
    """Block one worker at every gate, with its audit row. Returns the company name."""
    company_name = await _company_name(db, worker)
    before = worker.status
    worker.status = "blocked"
    db.add(
        Block(
            project_id=project.id,
            worker_id=worker.id,
            worker_name=worker.name,
            company_name=company_name,
            kind="Manual",
            reason=reason,
            when_label="Just now",
            route_back=route_back,
            colour="#B3261E",
        )
    )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Worker blocked",
        obj=f"{worker.name} · {company_name}",
        before=before,
        after=f"Blocked — {reason}",
    )
    return company_name


@router.post("/{worker_id}/block", response_model=ActionResult)
async def block_worker(
    worker_id: str,
    payload: BlockPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Block & reinstate")),
) -> ActionResult:
    """Withdraw a worker's access at every gate and tell their contractor."""
    worker = await _load(db, project.id, worker_id)
    if worker.status == "blocked":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"{worker.name} is already blocked"
        )
    company_name = await _block_worker(
        db,
        project=project,
        user=user,
        worker=worker,
        reason=payload.reason,
        route_back=payload.route_back,
    )
    await db.commit()
    return ActionResult(message=f"{worker.name} blocked at every gate · {company_name} notified")


@router.post("/{worker_id}/training", response_model=ActionResult)
async def add_training(
    worker_id: str,
    payload: TrainingPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Validate documents")),
) -> ActionResult:
    """Record a course the worker holds, which may open zones to them."""
    worker = await _load(db, project.id, worker_id)
    db.add(
        TrainingRecord(
            project_id=project.id,
            worker_id=worker.id,
            course=payload.course,
            status="valid",
            expiry=payload.expiry,
        )
    )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Training record added",
        obj=f"{worker.name} · {payload.course}",
        before="None",
        after=f"Valid until {payload.expiry}",
    )
    await db.commit()
    return ActionResult(message="Training record added — zone eligibility recalculated")


@router.post("/bulk/zones", response_model=ActionResult)
async def bulk_zones(
    payload: BulkZonesPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Create zones")),
) -> ActionResult:
    """Grant the same zones to every selected worker."""
    workers = await _load_many(db, project.id, payload.worker_ids)
    for worker in workers:
        before = worker.zones_permitted
        worker.zones_permitted = payload.zones
        await record_audit(
            db,
            project_id=project.id,
            actor=user,
            action="Zones assigned",
            obj=worker.name,
            before=before,
            after=payload.zones,
        )
    await db.commit()
    return ActionResult(
        message=f"Zone assignment applied to {len(workers)} workers — logged against your account"
    )


@router.post("/bulk/block", response_model=ActionResult)
async def bulk_block(
    payload: BulkBlockPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Block & reinstate")),
) -> ActionResult:
    """Withdraw access from every selected worker at once."""
    workers = await _load_many(db, project.id, payload.worker_ids)
    for worker in workers:
        await _block_worker(
            db,
            project=project,
            user=user,
            worker=worker,
            reason=payload.reason,
            route_back="GC administrator",
        )
    await db.commit()
    return ActionResult(
        message=f"{len(workers)} workers blocked at every gate — contractors notified"
    )


@router.post("/bulk/export", response_model=ActionResult)
async def bulk_export(
    payload: BulkExportPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Run reports")),
) -> ActionResult:
    """Queue a CSV of the selected worker records."""
    workers = await _load_many(db, project.id, payload.worker_ids)
    rows = [
        {
            "worker_ref": worker.worker_ref,
            "name": worker.name,
            "company": await _company_name(db, worker),
            "job_role": worker.job_role,
            "status": worker.status,
            "zones_permitted": worker.zones_permitted,
        }
        for worker in workers
    ]
    export_workers_csv.delay(rows)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Worker export queued",
        obj=f"{len(rows)} worker records",
        after="Queued",
    )
    await db.commit()
    return ActionResult(message=f"CSV of {len(rows)} worker records queued — emailed when ready")


@router.post("/blocks/{block_id}/lift", response_model=ActionResult)
async def lift_block(
    block_id: str,
    payload: LiftPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Block & reinstate")),
) -> ActionResult:
    """Reinstate a blocked person, recording who lifted it and why."""
    block = (
        await db.execute(select(Block).where(Block.id == block_id, Block.project_id == project.id))
    ).scalar_one_or_none()
    if block is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Block not found")
    if block.lifted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Already lifted by {block.lifted_by}"
        )

    block.lifted = True
    block.lifted_by = user.full_name or user.email
    block.lifted_reason = payload.reason
    if block.worker_id:
        worker = await db.get(Worker, block.worker_id)
        if worker is not None:
            worker.status = "cleared"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Block lifted",
        obj=f"{block.worker_name} · {block.company_name}",
        before=f"Blocked — {block.reason}",
        after=f"Reinstated — {payload.reason}",
    )
    await db.commit()
    return ActionResult(
        message=f"{block.worker_name} reinstated — reason and your name recorded in the audit"
    )


@router.post("/violations", response_model=ActionResult)
async def record_violation(
    payload: ViolationPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Record violations")),
) -> ActionResult:
    """Record a breach against a worker and move them up the three-strike ladder."""
    db.add(
        Violation(
            project_id=project.id,
            occurred_label=f"Today {site_now():%H:%M}",
            worker_name=payload.worker_name,
            company_name=payload.company_name,
            description=payload.description,
            recorded_by=user.full_name or user.email,
            level=payload.level,
            colour="#7A5900" if payload.level == "Verbal warning" else "#B3261E",
        )
    )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Violation recorded",
        obj=f"{payload.worker_name} · {payload.company_name}",
        after=f"{payload.level} — {payload.description}",
    )
    await db.commit()
    return ActionResult(
        message="Violation recorded — worker and contractor notified, strike count updated"
    )
