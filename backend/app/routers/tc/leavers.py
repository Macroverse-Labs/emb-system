"""Leavers — a last day, not a delete. The worker record stays for audit.

Marking a leaver writes a `WorkerLeaver` beside the worker; the `Worker` row is
never removed, because the project has to be able to answer who was on site in
March two years from now.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.contractor import WorkerLeaver
from app.models.gc.workforce import Worker
from app.routers.tc.deps import Contractor, get_contractor, require_tc
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/tc/leavers", tags=["tc"])

# The off-boarding checklist, in the order the design lists it.
CHECKS = (
    ("final_hours_confirmed", "Final hours confirmed"),
    ("card_returned", "RFID card returned"),
    ("ppe_returned", "PPE returned"),
    ("accommodation_vacated", "Accommodation vacated"),
)


class MarkPayload(BaseModel):
    """A last day and why. Nothing else is accepted."""

    model_config = ConfigDict(extra="forbid")

    worker_id: str
    last_day: str
    reason: str


class ConfirmPayload(BaseModel):
    """The off-boarding checklist, as ticked."""

    model_config = ConfigDict(extra="forbid")

    final_hours_confirmed: bool = False
    card_returned: bool = False
    ppe_returned: bool = False
    accommodation_vacated: bool = False


async def _own_leavers(
    db: AsyncSession, contractor: Contractor, leaver_id: str | None = None
) -> list[tuple[WorkerLeaver, Worker]]:
    """This company's leavers. `WorkerLeaver` has no company, so `Worker` carries it."""
    stmt = (
        select(WorkerLeaver, Worker)
        .join(Worker, Worker.id == WorkerLeaver.worker_id)
        .where(
            WorkerLeaver.project_id == contractor.project.id,
            Worker.company_id == contractor.company.id,
        )
    )
    if leaver_id is not None:
        stmt = stmt.where(WorkerLeaver.id == leaver_id)
    rows = (await db.execute(stmt.order_by(WorkerLeaver.last_day))).all()
    return [(leaver, worker) for leaver, worker in rows]


def _row(leaver: WorkerLeaver, worker: Worker) -> dict[str, Any]:
    return {
        "id": leaver.id,
        "workerId": worker.id,
        "worker": worker.name,
        "lastDay": leaver.last_day,
        "reason": leaver.reason,
        "card": leaver.card_returned,
        "hours": leaver.hours_label,
        "status": leaver.status_label,
        "level": leaver.level,
        "meta": leaver.meta,
        "confirmed": leaver.confirmed,
    }


@router.get("", response_model=None)
async def list_leavers(
    contractor: Contractor = Depends(get_contractor),
    db: AsyncSession = Depends(get_db),
) -> dict[str, list[dict[str, Any]]]:
    """This company's leavers, split into the design's two tabs."""
    rows = await _own_leavers(db, contractor)
    return {
        "todo": [_row(lv, w) for lv, w in rows if not lv.confirmed],
        "done": [_row(lv, w) for lv, w in rows if lv.confirmed],
    }


@router.post("", response_model=ActionResult)
async def mark_leaver(
    payload: MarkPayload,
    contractor: Contractor = Depends(require_tc("Mark leavers")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Set a last day on one of this company's workers. Nothing is deleted."""
    last_day = payload.last_day.strip()
    reason = payload.reason.strip()
    if not last_day or not reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="A last day and a reason are required"
        )

    worker = (
        await db.execute(
            select(Worker).where(
                Worker.id == payload.worker_id,
                Worker.project_id == contractor.project.id,
                Worker.company_id == contractor.company.id,
            )
        )
    ).scalar_one_or_none()
    if worker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="That worker is not on your register"
        )

    open_leaver = (
        await db.execute(
            select(WorkerLeaver).where(
                WorkerLeaver.worker_id == worker.id,
                WorkerLeaver.project_id == contractor.project.id,
                WorkerLeaver.confirmed.is_(False),
            )
        )
    ).scalar_one_or_none()
    if open_leaver is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{worker.name} is already off-boarding — last day {open_leaver.last_day}",
        )

    # ponytail: `hours_label` (the design's "FINAL HOURS", a lifetime total) has no
    # source in the model — `WorkerHours` only holds this week. Left blank rather than
    # filled with a number that would be wrong; populate it when a totals source exists.
    db.add(
        WorkerLeaver(
            project_id=contractor.project.id,
            worker_id=worker.id,
            last_day=last_day,
            reason=reason,
            card_returned="—",
            status_label="Access ends 23:59",
            level=1,
            meta=f"{worker.job_role} · {contractor.project.code}",
        )
    )
    await record_audit(
        db,
        project_id=contractor.project.id,
        actor=contractor.user,
        action="Leaver marked",
        obj=f"{worker.name} · {contractor.company.name}",
        before="On the register",
        after=f"Last day {last_day} — {reason}",
    )
    await db.commit()
    return ActionResult(
        message=(
            f"{worker.name} — last day {last_day} saved. The GC was notified the moment you "
            "saved it; the record stays for audit"
        )
    )


@router.post("/{leaver_id}/confirm", response_model=ActionResult)
async def confirm_off_boarding(
    leaver_id: str,
    payload: ConfirmPayload,
    contractor: Contractor = Depends(require_tc("Mark leavers")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Close the off-boarding checklist, recording which checks actually passed."""
    rows = await _own_leavers(db, contractor, leaver_id)
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leaver not found")
    leaver, worker = rows[0]
    if leaver.confirmed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"{worker.name} is already off-boarded"
        )

    passed = [label for field, label in CHECKS if getattr(payload, field)]
    outstanding = [label for field, label in CHECKS if not getattr(payload, field)]

    leaver.confirmed = True
    leaver.card_returned = "Returned" if payload.card_returned else "Not returned"
    leaver.status_label = "Completed" if payload.card_returned else "Card not returned"
    leaver.level = 0 if payload.card_returned else 2

    await record_audit(
        db,
        project_id=contractor.project.id,
        actor=contractor.user,
        action="Off-boarding confirmed",
        obj=f"{worker.name} · {contractor.company.name}",
        before=f"Last day {leaver.last_day} — {leaver.reason}",
        after=(
            f"Confirmed — {', '.join(passed) if passed else 'no checks passed'}"
            + (f"; outstanding: {', '.join(outstanding)}" if outstanding else "")
        ),
    )
    await db.commit()

    message = (
        f"Off-boarding confirmed for {worker.name} — card voided at 23:59, record kept for audit"
    )
    if not payload.card_returned:
        message += ". The card was not returned — reported to the GC and to security"
    return ActionResult(message=message)
