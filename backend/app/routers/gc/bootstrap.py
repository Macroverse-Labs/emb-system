"""One read that fills the whole console."""

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.gc.access import AccessThreshold, Device, PlanShape, Zone, ZoneRequirement
from app.models.gc.admin import (
    NotificationRule,
    ReferenceList,
    RolePermission,
)
from app.models.gc.enforcement import Alert, Block, InductionSession, Violation
from app.models.gc.org import Company, ContractorAccount, Project
from app.models.gc.records import AccessEvent, AuditEntry, DashboardTile
from app.models.gc.visitors import Visit, VisitorProfile, VisitRequest
from app.models.gc.workforce import DocumentSubmission, Worker
from app.models.user import User
from app.routers.gc.deps import get_project
from app.services.auth import get_current_active_user

router = APIRouter(prefix="/gc", tags=["gc"])

# The design's own ticker sources. They are presentation, not project records.
TICKER_GATES = [
    "Gate A pedestrian",
    "Gate B pedestrian",
    "A2 Podium",
    "A3 Electrical",
    "Site office",
    "Laydown vehicle",
]
HOURS = [
    ("05", 88),
    ("06", 412),
    ("07", 286),
    ("08", 164),
    ("09", 72),
    ("10", 46),
    ("11", 38),
    ("12", 94),
    ("13", 88),
    ("14", 42),
    ("15", 36),
    ("16", 58),
    ("17", 186),
    ("18", 122),
]


def site_now() -> datetime:
    """Now, in the site's timezone — what a gate clock would read."""
    return datetime.now(ZoneInfo(settings.site_timezone))


def _relative(when: datetime | None) -> str:
    """Render a timestamp the way the console's tables do."""
    if when is None:
        return "—"
    now = site_now()
    when = when.astimezone(now.tzinfo)
    days = (now.date() - when.date()).days
    if days == 0:
        return f"Today {when:%H:%M}"
    if days == 1:
        return f"Yesterday {when:%H:%M}"
    return f"{days} d ago"


async def _all(db: AsyncSession, model: Any, project_id: str | None = None) -> list[Any]:
    stmt = select(model)
    if project_id is not None:
        stmt = stmt.where(model.project_id == project_id)
    return list((await db.execute(stmt)).scalars().all())


@router.get("/bootstrap")
async def bootstrap(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
) -> dict[str, Any]:
    """Everything the console needs for one project, in the shapes it already renders.

    The payload deliberately mirrors `frontend/src/lib/gc/data.ts`, so the client can
    swap it in for its offline fixtures without a single view-model change. The one
    addition is a row id appended to the tuples whose screens fire a mutation — the
    design indexes these positionally from the front, so a trailing element is free.

    ponytail: one aggregate read. Split into the per-resource GETs below if the payload
    ever gets slow — they already exist and return the same rows.
    """
    pid = project.id

    projects = await _all(db, Project)
    companies = await _all(db, Company, pid)
    by_company = {c.id: c.name for c in companies}
    workers = await _all(db, Worker, pid)
    zones = sorted(await _all(db, Zone, pid), key=lambda z: (z.depth, z.zone_ref))
    reqs = await _all(db, ZoneRequirement, pid)
    requirement_names = sorted({r.requirement for r in reqs})
    matrix_zones = sorted({r.zone_name for r in reqs})
    submissions = await _all(db, DocumentSubmission, pid)
    worker_names = {w.id: w.name for w in workers}
    ref_lists = await _all(db, ReferenceList)
    rules = sorted(await _all(db, NotificationRule), key=lambda r: r.position)
    events = await _all(db, AccessEvent, pid)
    console_users = list((await db.execute(select(User))).scalars().all())
    capabilities = sorted({p.capability for p in await _all(db, RolePermission)})
    roles = sorted({p.role for p in await _all(db, RolePermission)})

    return {
        "projects": [[p.code, p.name, p.badge, p.meta] for p in projects],
        "workers": [
            [
                w.name,
                w.worker_ref,
                by_company.get(w.company_id, ""),
                w.job_role,
                w.status,
                w.zones_permitted,
                1 if w.on_site else 0,
                w.last_event,
                w.nationality,
                w.id,
            ]
            for w in workers
        ],
        "contractorLoad": [
            [c.name, c.on_register, c.on_site, c.flag] for c in companies if c.on_register
        ],
        "companies": [
            [
                c.name,
                c.trade,
                c.on_register,
                c.on_site,
                c.kind,
                c.contact,
                c.insurance_expiry,
                c.flag,
            ]
            for c in companies
        ],
        "alerts": [
            [a.kind, a.title, a.subtitle, a.badge, a.colour, a.target_screen]
            for a in sorted(await _all(db, Alert, pid), key=lambda a: a.position)
            if not a.resolved
        ],
        "moves": [
            [e.occurred_label[:5], e.person, e.device_label.split(" · ")[-1], e.direction]
            for e in events[:7]
        ],
        "hours": [list(h) for h in HOURS],
        "zones": [
            [z.zone_ref, z.name, z.kind, z.depth, z.population, z.factor, z.id] for z in zones
        ],
        "requirements": requirement_names,
        "matrixZones": matrix_zones,
        "devices": [
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
                d.id,
            ]
            for d in await _all(db, Device, pid)
        ],
        "sessions": [
            [s.session_ref, s.when_label, s.where_label, s.run_by, s.capacity, s.booked, s.state]
            for s in await _all(db, InductionSession, pid)
        ],
        "violations": [
            [
                v.occurred_label,
                v.worker_name,
                v.company_name,
                v.description,
                v.recorded_by,
                v.level,
                v.colour,
            ]
            for v in await _all(db, Violation, pid)
        ],
        "blocks": [
            [
                b.worker_name,
                b.company_name,
                b.kind,
                b.reason,
                b.when_label,
                b.route_back,
                b.colour,
                b.id,
            ]
            for b in await _all(db, Block, pid)
            if not b.lifted
        ],
        "visitRequests": [
            [
                r.visitor_name,
                r.visitor_kind,
                r.requested_by,
                r.purpose,
                r.zones_requested,
                r.window_label,
                r.age_label,
                "me" if r.host_is_me else "other",
                r.id,
            ]
            for r in await _all(db, VisitRequest, pid)
            if r.decision is None
        ],
        "visitorsToday": [
            [
                v.visitor_name,
                v.visitor_kind,
                v.host,
                v.zones_granted,
                v.window_label,
                v.state,
                v.last_event_label,
            ]
            for v in await _all(db, Visit, pid)
        ],
        "log": [
            [
                e.occurred_label,
                e.person,
                e.company,
                e.device_label,
                e.direction,
                e.verdict,
                e.note,
            ]
            for e in events
        ],
        "audit": [
            [a.occurred_label, a.who, a.role, a.action, a.obj, a.value_before, a.value_after]
            for a in sorted(
                await _all(db, AuditEntry, pid), key=lambda a: a.created_at, reverse=True
            )
        ],
        "users": [
            [
                u.full_name or u.email,
                u.role,
                by_company.get(u.company_id or "", "Guardforce (sub)"),
                _relative(u.last_seen_at),
                "all",
            ]
            for u in console_users
            if u.full_name
        ],
        "capabilities": capabilities,
        "roles": roles,
        "tcAccounts": [
            [
                by_company.get(a.company_id, ""),
                a.contact_name,
                a.email,
                a.status,
                a.last_seen,
                a.user_count,
            ]
            for a in await _all(db, ContractorAccount, pid)
        ],
        "refData": [[rl.name, rl.description, rl.item_count] for rl in ref_lists],
        "notifications": [[r.event, r.when_label, r.audience] for r in rules],
        "tiles": [
            t.name for t in sorted(await _all(db, DashboardTile, pid), key=lambda t: t.position)
        ],
        "submissions": [
            {
                "id": s.id,
                "w": worker_names.get(s.worker_id, ""),
                "co": by_company.get(s.company_id, ""),
                "doc": s.doc_type,
                "no": s.doc_number,
                "exp": s.expiry,
                "iss": s.issuer,
                "sub": s.submitted,
                "fields": [[f.label, f.value] for f in s.fields],
                "flags": [f.text for f in s.flags],
            }
            for s in submissions
            if s.decision is None
        ],
        "tickerNames": [w.name for w in workers if w.on_site][:10],
        "tickerGates": TICKER_GATES,
        # Not part of GcData: extras the console reads directly.
        "meta": {
            "project": project.code,
            "role": user.role,
            # The design loads a 20-worker sample of a 2,418-strong register, so the
            # headline occupancy is the contractors' own on-site counts, not len(sample).
            "onSite": sum(c.on_site for c in companies),
            "planShapes": [
                {
                    "x": p.x,
                    "y": p.y,
                    "w": p.w,
                    "h": p.h,
                    "n": p.name,
                    "c": p.colour,
                    "level": p.level,
                }
                for p in await _all(db, PlanShape, pid)
            ],
            "thresholds": [
                {"k": t.key_label, "v": t.value_label, "sub": t.sub_label}
                for t in sorted(await _all(db, AccessThreshold, pid), key=lambda t: t.position)
            ],
            "matrix": {f"{r.zone_name}|{r.requirement}": r.value for r in reqs},
            "permissions": {
                f"{p.capability}|{p.role}": p.allowed for p in await _all(db, RolePermission)
            },
            "visitorProfiles": [
                {
                    "n": v.name,
                    "kind": v.kind,
                    "co": v.company,
                    "visits": str(v.visit_count),
                    "last": v.last_incident,
                    "st": v.status_label,
                    "c": v.colour,
                }
                for v in await _all(db, VisitorProfile, pid)
            ],
        },
    }


@router.get("/live")
async def live(
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_active_user),
) -> dict[str, Any]:
    """The turnstile ticker: clock, headcount and the most recent movements."""
    companies = await _all(db, Company, project.id)
    events = await _all(db, AccessEvent, project.id)
    return {
        "clock": f"{site_now():%H:%M}",
        "onSite": sum(c.on_site for c in companies),
        "moves": [
            [e.occurred_label[:5], e.person, e.device_label.split(" · ")[-1], e.direction]
            for e in events[:7]
        ],
    }
