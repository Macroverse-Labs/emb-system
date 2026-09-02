"""Per-resource reads behind the console's aggregate.

Every list here returns the same row shape `app.routers.gc.bootstrap` returns for
that collection, so a screen can refetch just its own slice without the client
learning a second format. Filtering and sorting mirror what the view-models at
`frontend/src/components/gc/vm/vm1.ts` and `vm3.ts` do client-side today.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.access import Device, Zone
from app.models.gc.enforcement import Alert
from app.models.gc.org import Company, Project
from app.models.gc.records import AccessEvent, AuditEntry
from app.models.gc.visitors import Visit
from app.models.gc.workforce import DocumentSubmission, Worker
from app.models.user import User
from app.routers.gc.bootstrap import _all
from app.routers.gc.deps import get_project
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/gc", tags=["gc"])

# vm1.ts sorts the register by these worker fields; the numbers index the row tuple.
WORKER_SORT_KEYS = {"name": 0, "co": 2, "role": 3, "status": 4, "seen": 7}


def filter_log(events: list[AccessEvent], q: str, kind: str) -> list[AccessEvent]:
    """Apply the access log's search box and tab, exactly as `vm3.ts` does.

    Args:
        events: The project's access events.
        q: Free text matched against person, company, device and note.
        kind: One of `all`, `deny`, `visitor`, `out`.

    Returns:
        The events the log screen would show.
    """
    needle = q.lower()
    rows = [
        e
        for e in events
        if not needle or needle in f"{e.person}{e.company}{e.device_label}{e.note}".lower()
    ]
    if kind == "deny":
        return [e for e in rows if e.verdict == "deny"]
    if kind == "visitor":
        return [e for e in rows if e.company.startswith("Visitor")]
    if kind == "out":
        return [e for e in rows if e.direction == "out"]
    return rows


def log_row(event: AccessEvent) -> list[Any]:
    """One access log row, in the order the console renders it."""
    return [
        event.occurred_label,
        event.person,
        event.company,
        event.device_label,
        event.direction,
        event.verdict,
        event.note,
    ]


def audit_row(entry: AuditEntry) -> list[Any]:
    """One system-change audit row, in the order the console renders it."""
    return [
        entry.occurred_label,
        entry.who,
        entry.role,
        entry.action,
        entry.obj,
        entry.value_before,
        entry.value_after,
    ]


def worker_row(worker: Worker, company_name: str) -> list[Any]:
    """One worker register row, in the order the console renders it."""
    return [
        worker.name,
        worker.worker_ref,
        company_name,
        worker.job_role,
        worker.status,
        worker.zones_permitted,
        1 if worker.on_site else 0,
        worker.last_event,
        worker.nationality,
    ]


def submission_row(sub: DocumentSubmission, worker_name: str, company_name: str) -> dict[str, Any]:
    """One pending validation-queue card."""
    return {
        "id": sub.id,
        "w": worker_name,
        "co": company_name,
        "doc": sub.doc_type,
        "no": sub.doc_number,
        "exp": sub.expiry,
        "iss": sub.issuer,
        "sub": sub.submitted,
        "fields": [[f.label, f.value] for f in sub.fields],
        "flags": [f.text for f in sub.flags],
    }


async def _company_names(db: AsyncSession, project_id: str) -> dict[str, str]:
    return {c.id: c.name for c in await _all(db, Company, project_id)}


@router.get("/workers")
async def list_workers(
    q: str = "",
    filter: str = "all",
    sort: str = "name",
    dir: int = 1,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """The worker register, searched, filtered and sorted as `vm1.ts` does."""
    by_company = await _company_names(db, project.id)
    workers = await _all(db, Worker, project.id)
    needle = q.lower()

    rows: list[list[Any]] = []
    for w in workers:
        row = worker_row(w, by_company.get(w.company_id, ""))
        if needle and needle not in f"{row[0]}{row[1]}{row[2]}{row[3]}".lower():
            continue
        if filter == "onsite" and row[6] != 1:
            continue
        if filter == "expiring" and w.status != "expiring":
            continue
        if filter == "expired" and w.status not in ("expired", "blocked"):
            continue
        if filter == "pending" and w.status not in ("pending", "review"):
            continue
        if filter == "draft" and w.status != "draft":
            continue
        rows.append(row)

    key = WORKER_SORT_KEYS.get(sort, 0)
    rows.sort(key=lambda r: str(r[key]), reverse=dir < 0)
    return rows


@router.get("/workers/{worker_id}")
async def get_worker(
    worker_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> dict[str, Any]:
    """One worker profile: the register row, the Documents tab and the Training tab."""
    worker = await db.get(Worker, worker_id)
    if worker is None or worker.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    company = await db.get(Company, worker.company_id)
    return {
        "worker": worker_row(worker, company.name if company else ""),
        "documents": [
            {
                "t": d.doc_type,
                "no": d.doc_number,
                "exp": d.expiry,
                "st": d.status,
                "prov": d.provider,
            }
            for d in worker.documents
        ],
        "training": [{"t": t.course, "st": t.status, "exp": t.expiry} for t in worker.training],
    }


@router.get("/companies")
async def list_companies(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """Every contractor, agency and the GC itself. Backs Company profiles."""
    return [
        [c.name, c.trade, c.on_register, c.on_site, c.kind, c.contact, c.insurance_expiry, c.flag]
        for c in await _all(db, Company, project.id)
    ]


@router.get("/zones")
async def list_zones(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """The zone tree, ordered the way the builder nests it."""
    zones = sorted(await _all(db, Zone, project.id), key=lambda z: (z.depth, z.zone_ref))
    return [[z.zone_ref, z.name, z.kind, z.depth, z.population, z.factor] for z in zones]


@router.get("/devices")
async def list_devices(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """Turnstiles, readers, barriers and tablets. Backs the Devices screen."""
    return [
        [
            d.device_ref,
            d.kind,
            d.location,
            d.zone_label,
            d.status,
            d.link,
            str(d.buffered_events),
            d.last_sync,
            d.factor,
        ]
        for d in await _all(db, Device, project.id)
    ]


@router.get("/visits")
async def list_visits(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """Granted visits. Backs the Visitors today screen."""
    return [
        [
            v.visitor_name,
            v.visitor_kind,
            v.host,
            v.zones_granted,
            v.window_label,
            v.state,
            v.last_event_label,
        ]
        for v in await _all(db, Visit, project.id)
    ]


@router.get("/log")
async def list_log(
    q: str = "",
    filter: str = "all",
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """The access log, filtered by the screen's search box and tab."""
    events = await _all(db, AccessEvent, project.id)
    return [log_row(e) for e in filter_log(events, q, filter)]


@router.get("/audit")
async def list_audit(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """The system-change audit, newest first."""
    entries = sorted(
        await _all(db, AuditEntry, project.id), key=lambda a: a.created_at, reverse=True
    )
    return [audit_row(a) for a in entries]


@router.get("/alerts")
async def list_alerts(
    kind: str = "all",
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[list[Any]]:
    """Open alerts, in the order the alert centre lists them."""
    alerts = sorted(await _all(db, Alert, project.id), key=lambda a: a.position)
    return [
        [a.kind, a.title, a.subtitle, a.badge, a.colour, a.target_screen]
        for a in alerts
        if not a.resolved and kind in ("all", a.kind)
    ]


@router.get("/submissions")
async def list_submissions(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> list[dict[str, Any]]:
    """Documents still awaiting a decision. Backs the validation queue."""
    by_company = await _company_names(db, project.id)
    worker_names = {w.id: w.name for w in await _all(db, Worker, project.id)}
    return [
        submission_row(s, worker_names.get(s.worker_id, ""), by_company.get(s.company_id, ""))
        for s in await _all(db, DocumentSubmission, project.id)
        if s.decision is None
    ]
