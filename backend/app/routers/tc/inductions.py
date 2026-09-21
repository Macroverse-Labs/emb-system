"""Inductions — book this company's cleared workers into a session that has places.

The design states two rules that the screen only *shows* (a greyed row, a "FULL"
tile). Both are enforced here, because a screen is not a rule:

1. Only workers the GC has validated may be booked.
2. Capacity is per slot — a booking that would take `booked` past `capacity` is
   refused rather than accepted and reconciled later.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.enforcement import InductionAttendance, InductionSession
from app.models.gc.workforce import Worker
from app.routers.tc.deps import Contractor, get_contractor, require_tc
from app.schemas.gc.common import ActionResult
from app.schemas.tc.bootstrap import TcInductionAttendee, TcInductionSession
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/tc/inductions", tags=["tc"])

# The status the validation queue leaves behind when the GC approves a document —
# its own toast says "cleared to book an induction". So this one value is the
# design's "DOCUMENTS VALIDATED BY THE GC — NOBODY ELSE APPEARS HERE" rule.
BOOKABLE_STATUS = "cleared"


class BookPayload(BaseModel):
    """The slot and this company's workers to seat in it. Nothing else is accepted."""

    model_config = ConfigDict(extra="forbid")

    session_id: str
    worker_ids: list[str]


async def induction_sessions(db: AsyncSession, contractor: Contractor) -> list[TcInductionSession]:
    """This project's slots, each carrying the seats this contractor already holds.

    Sessions are project-wide, not company-scoped: the GC runs them and every
    contractor books into the same slots, so a full one is returned too — `remaining`
    and `state` are what grey it out. The attendance is *not* project-wide.

    `/tc/bootstrap` and `GET /tc/inductions` are the same read; both call this so the
    id the console books with can never drift from the id the list showed.
    """
    sessions = (
        await db.scalars(
            select(InductionSession)
            .where(InductionSession.project_id == contractor.project.id)
            .order_by(InductionSession.session_ref)
        )
    ).all()
    # InductionAttendance carries no company_id — the GC's attendance sheet is keyed
    # by the printed company name — so that name is the tenancy filter here.
    attendance = (
        await db.scalars(
            select(InductionAttendance)
            .where(
                InductionAttendance.project_id == contractor.project.id,
                InductionAttendance.company_name == contractor.company.name,
            )
            .order_by(InductionAttendance.worker_name)
        )
    ).all()
    seats: dict[str, list[TcInductionAttendee]] = {}
    for a in attendance:
        seats.setdefault(a.session_id, []).append(
            TcInductionAttendee(
                id=a.id, worker=a.worker_name, status=a.status_label, colour=a.status_colour
            )
        )
    return [
        TcInductionSession(
            id=s.id,
            ref=s.session_ref,
            when=s.when_label,
            where=s.where_label,
            run_by=s.run_by,
            capacity=s.capacity,
            booked=s.booked,
            remaining=max(0, s.capacity - s.booked),
            state=s.state,
            attendance=seats.get(s.id, []),
        )
        for s in sessions
    ]


@router.get("", response_model=list[TcInductionSession])
async def list_inductions(
    contractor: Contractor = Depends(get_contractor),
    db: AsyncSession = Depends(get_db),
) -> list[TcInductionSession]:
    """The project's slots and the seats this contractor holds on each."""
    return await induction_sessions(db, contractor)


@router.post("/book", response_model=ActionResult)
async def book(
    payload: BookPayload,
    contractor: Contractor = Depends(require_tc("Book inductions")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Seat this company's validated workers in a slot that still has places."""
    worker_ids = list(dict.fromkeys(payload.worker_ids))
    if not worker_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Pick at least one worker to book"
        )

    # Rule 0, the one the design does not have to state: only this company's people.
    workers = list(
        (
            await db.execute(
                select(Worker).where(
                    Worker.id.in_(worker_ids),
                    Worker.project_id == contractor.project.id,
                    Worker.company_id == contractor.company.id,
                )
            )
        )
        .scalars()
        .all()
    )
    if len(workers) != len(worker_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some of those workers are not on your register",
        )

    # Rule 1 — documents validated by the GC.
    waiting = sorted(w.name for w in workers if w.status != BOOKABLE_STATUS)
    if waiting:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Documents are still with the GC — {', '.join(waiting)} cannot be booked yet",
        )

    # Rule 2 — capacity is per slot. The row is locked for the read-check-write so two
    # contractors booking the last places at once cannot both win. SQLite (the test
    # database) has no row locks and ignores the clause; Postgres, which production
    # runs, does not.
    session = (
        await db.execute(
            select(InductionSession)
            .where(
                InductionSession.id == payload.session_id,
                InductionSession.project_id == contractor.project.id,
            )
            .with_for_update()
        )
    ).scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    remaining = session.capacity - session.booked
    if session.state != "open" or remaining < len(workers):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"No places in that session — {max(remaining, 0)} left and you asked for "
                f"{len(workers)}. Pick another slot"
            ),
        )

    before = f"{session.booked} / {session.capacity} booked"
    for worker in workers:
        db.add(
            InductionAttendance(
                project_id=contractor.project.id,
                session_id=session.id,
                worker_name=worker.name,
                company_name=contractor.company.name,
                status_label="Booked — card issued at the end of the session",
                status_colour="#49454F",
            )
        )
    session.booked += len(workers)
    if session.booked >= session.capacity:
        session.state = "full"

    await record_audit(
        db,
        project_id=contractor.project.id,
        actor=contractor.user,
        action="Induction booked",
        obj=f"{len(workers)} workers · {session.session_ref} · {contractor.company.name}",
        before=before,
        after=f"{session.booked} / {session.capacity} booked",
    )
    await db.commit()
    return ActionResult(
        message=(
            f"{len(workers)} workers booked into {session.when_label} — "
            "cards issued at the end of the session"
        )
    )
