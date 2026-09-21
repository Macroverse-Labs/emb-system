"""Hours & days — this company's fatigue position, and the rest days it plans.

The thresholds themselves belong to the GC ("THRESHOLDS — SET BY GC, NOT EDITABLE"),
so nothing here writes them. The one thing a contractor can do is plan a rest day
before the auto-block fires.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.contractor import WorkerHours
from app.models.gc.workforce import Worker
from app.routers.tc.deps import Contractor, get_contractor, require_tc
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/tc/hours", tags=["tc"])


class RestDaysPayload(BaseModel):
    """Which workers rest, and when. Nothing else is accepted."""

    model_config = ConfigDict(extra="forbid")

    worker_ids: list[str]
    rest_day: str


async def _own_hours(
    db: AsyncSession, contractor: Contractor, worker_ids: list[str] | None = None
) -> list[tuple[WorkerHours, Worker]]:
    """This company's hours rows. `WorkerHours` has no company, so `Worker` carries it."""
    stmt = (
        select(WorkerHours, Worker)
        .join(Worker, Worker.id == WorkerHours.worker_id)
        .where(
            WorkerHours.project_id == contractor.project.id,
            Worker.company_id == contractor.company.id,
        )
    )
    if worker_ids is not None:
        stmt = stmt.where(Worker.id.in_(worker_ids))
    rows = (await db.execute(stmt.order_by(WorkerHours.pct.desc()))).all()
    return [(hours, worker) for hours, worker in rows]


@router.get("", response_model=None)
async def list_hours(
    contractor: Contractor = Depends(get_contractor),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """This company's workers, worst fatigue position first."""
    return [
        {
            "id": hours.id,
            "workerId": worker.id,
            "worker": worker.name,
            "trade": worker.job_role,
            "pct": hours.pct,
            "hours": hours.hours_label,
            "days": hours.days_label,
            "warned": hours.warned,
            "flag": hours.flag,
            "restDayPlanned": hours.rest_day_planned,
        }
        for hours, worker in await _own_hours(db, contractor)
    ]


@router.post("/rest-days", response_model=ActionResult)
async def plan_rest_days(
    payload: RestDaysPayload,
    contractor: Contractor = Depends(require_tc("Add workers")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Plan a rest day, before the threshold blocks the worker at the gate."""
    worker_ids = list(dict.fromkeys(payload.worker_ids))
    rest_day = payload.rest_day.strip()
    if not worker_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Pick at least one worker"
        )
    if not rest_day:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Say which day they rest"
        )

    rows = await _own_hours(db, contractor, worker_ids)
    if len(rows) != len(worker_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some of those workers have no hours on your register",
        )

    for hours, worker in rows:
        before = hours.rest_day_planned or "None planned"
        hours.rest_day_planned = rest_day
        await record_audit(
            db,
            project_id=contractor.project.id,
            actor=contractor.user,
            action="Rest day planned",
            obj=f"{worker.name} · {hours.hours_label} · {hours.days_label}",
            before=before,
            after=rest_day,
        )
    await db.commit()
    return ActionResult(
        message=(
            f"Rest day on {rest_day} planned for {len(rows)} workers — they will not be "
            "auto-blocked at the gate that morning, and the GC sees the plan against the "
            "threshold"
        )
    )
