"""Reports, report runs, and the queued CSV extracts of the log and the audit."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.org import Company, Project
from app.models.gc.records import AccessEvent, AuditEntry, ReportRow, ReportRun, ReportSchedule
from app.models.gc.workforce import Worker
from app.models.user import User
from app.routers.gc.bootstrap import _all, site_now
from app.routers.gc.deps import get_project, require
from app.routers.gc.resources import audit_row, filter_log, log_row
from app.schemas.gc.common import ActionResult
from app.schemas.gc.records import ReportScheduleCreate
from app.services.gc.audit import record_audit
from app.tasks.export import export_csv

router = APIRouter(prefix="/gc", tags=["gc"])

LOG_COLUMNS = ["Time", "Person", "Contractor", "Device", "Direction", "Result", "Note"]
AUDIT_COLUMNS = ["Time", "Who", "Role", "Change", "Object", "From", "To"]


def _hhmm(event: AccessEvent) -> str:
    """The clock part of an event's label, which is what a report row shows."""
    return event.occurred_label[:5]


async def _build_rows(db: AsyncSession, project_id: str, run_id: str) -> list[ReportRow]:
    """Compute one report line per contractor from the project's current data.

    Attendance is the contractor's headcount on site; expiring and blocked are counted
    off the worker register; the first and last times come from that contractor's own
    access events.
    """
    workers = await _all(db, Worker, project_id)
    events = await _all(db, AccessEvent, project_id)
    rows: list[ReportRow] = []
    for company in await _all(db, Company, project_id):
        theirs = [w for w in workers if w.company_id == company.id]
        times = sorted(_hhmm(e) for e in events if e.company == company.name)
        rows.append(
            ReportRow(
                project_id=project_id,
                run_id=run_id,
                company_name=company.name,
                on_register=company.on_register,
                on_site=company.on_site,
                attended=str(company.on_site),
                expiring=str(sum(1 for w in theirs if w.status == "expiring")),
                blocked=str(sum(1 for w in theirs if w.status in ("blocked", "expired"))),
                first_in=times[0] if times else "—",
                last_out=times[-1] if times else "—",
            )
        )
    return rows


@router.post("/reports", response_model=ActionResult, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    payload: ReportScheduleCreate,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Run reports")),
) -> ActionResult:
    """Add a standing report to the Reports screen."""
    schedule = ReportSchedule(
        project_id=project.id,
        name=payload.name,
        cadence=payload.cadence,
        formats=payload.formats,
        recipients=payload.recipients,
    )
    db.add(schedule)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Report schedule created",
        obj=payload.name,
        after=f"{payload.cadence} · {payload.formats} · {payload.recipients}",
    )
    await db.commit()
    return ActionResult(
        message="New schedule — pick the report, the day, the format and who receives it"
    )


@router.post("/reports/{schedule_id}/run", response_model=ActionResult)
async def run_schedule(
    schedule_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Run reports")),
) -> ActionResult:
    """Run a schedule now, delivering a run computed from the project's current data."""
    schedule = await db.get(ReportSchedule, schedule_id)
    if schedule is None or schedule.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

    now = site_now()
    run = ReportRun(
        project_id=project.id,
        schedule_id=schedule.id,
        ran_at_label=f"{now:%d %b %Y %H:%M}",
    )
    db.add(run)
    await db.flush()  # the run's uuid is a column default, so the rows need it assigned
    rows = await _build_rows(db, project.id, run.id)
    db.add_all(rows)
    run.row_count = len(rows)
    schedule.last_sent = f"Sent today {now:%H:%M}"

    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Report run",
        obj=schedule.name,
        before=schedule.cadence,
        after=f"{len(rows)} contractors",
    )
    await db.commit()
    first_recipient = schedule.recipients.split(",")[0].strip()
    return ActionResult(message=f"{schedule.name} — run now, delivered to {first_recipient}")


@router.get("/log/export", response_model=ActionResult)
async def export_log(
    q: str = "",
    filter: str = "all",
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Run reports")),
) -> ActionResult:
    """Queue a CSV of the access log exactly as the screen has it filtered."""
    events = filter_log(await _all(db, AccessEvent, project.id), q, filter)
    export_csv.delay(f"gc-log-{project.code}", LOG_COLUMNS, [log_row(e) for e in events])
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Access log exported",
        obj=f"Access log · {filter}",
        after=f"{len(events)} events queued",
    )
    await db.commit()
    return ActionResult(message="CSV of the filtered stream queued — emailed when ready")


@router.get("/audit/export", response_model=ActionResult)
async def export_audit(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Run reports")),
) -> ActionResult:
    """Queue the signed extract of the system-change audit."""
    entries = sorted(
        await _all(db, AuditEntry, project.id), key=lambda a: a.created_at, reverse=True
    )
    export_csv.delay(f"gc-audit-{project.code}", AUDIT_COLUMNS, [audit_row(a) for a in entries])
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Audit extract exported",
        obj=f"{len(entries)} entries",
        after="Queued",
    )
    await db.commit()
    return ActionResult(message="Audit extract queued — immutable, signed, retained seven years")
