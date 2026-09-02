"""Load the GC console's reference dataset.

`seed_data.json` is generated from `frontend/src/lib/gc/data.ts` (`FIXTURE_DATA`),
which is itself the verbatim data of the design prototype. Regenerate it with:

    cd frontend && node --experimental-strip-types scripts/dump-seed-data.mjs \
        ../backend/app/services/gc/seed_data.json

Keeping one source means the seeded database and the frontend's offline fallback can
never disagree about what the console shows.
"""

import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import Base
from app.models.gc.access import (
    AccessThreshold,
    Device,
    PlanShape,
    Zone,
    ZoneCriterion,
    ZoneRequirement,
)
from app.models.gc.admin import (
    NotificationChannel,
    NotificationRule,
    ReferenceList,
    ReferenceValue,
    RolePermission,
)
from app.models.gc.enforcement import (
    Alert,
    Block,
    InductionAttendance,
    InductionSession,
    Violation,
)
from app.models.gc.org import Company, ContractorAccount, Project
from app.models.gc.records import (
    AccessEvent,
    AuditEntry,
    DashboardTile,
    ReportRow,
    ReportRun,
    ReportSchedule,
)
from app.models.gc.visitors import (
    Visit,
    VisitEvent,
    VisitFact,
    VisitorPolicySetting,
    VisitorProfile,
    VisitRequest,
)
from app.models.gc.workforce import (
    DocumentSubmission,
    SubmissionField,
    SubmissionFlag,
    TrainingRecord,
    Worker,
    WorkerDocument,
)
from app.models.user import User
from app.services.auth import get_password_hash

DATA_PATH = Path(__file__).with_name("seed_data.json")


def _parse_last_seen(label: str) -> datetime | None:
    """Turn the design's "Today 06:58" / "Yesterday 17:10" / "2 d ago" into a real time.

    The console renders relative labels; storing an actual timestamp means the API can
    regenerate them tomorrow instead of the seed's wording going stale.
    """
    now = datetime.now(UTC)
    if label in ("—", ""):
        return None
    if label.endswith("d ago"):
        return now - timedelta(days=int(label.split()[0]))
    day, _, clock = label.partition(" ")
    try:
        hour, minute = (int(x) for x in clock.split(":"))
    except ValueError:
        return None
    base = now if day == "Today" else now - timedelta(days=1)
    return base.replace(hour=hour, minute=minute, second=0, microsecond=0)


# POC sign-in credentials. Every seeded account shares the password; GC_ADMIN_EMAIL is
# the one the sign-in form pre-fills. Both are settings so a deployment can override
# them — the defaults are fine on a laptop and nowhere else.
SEED_PASSWORD = settings.gc_admin_password
GC_ADMIN_EMAIL = settings.gc_admin_email

# The design's data describes Emerald Bay Block A. The other two projects in the
# switcher exist so the switcher works; they start empty.
PRIMARY_PROJECT = "EMB1A"


def _load() -> dict[str, Any]:
    with DATA_PATH.open() as fh:
        data: dict[str, Any] = json.load(fh)
    return data


def _docs_for(index: int, status: str, nationality: str) -> list[dict[str, str]]:
    """Port of the design's `docsFor(w)` (design lines 1521-1531)."""
    bad = status in ("expired", "blocked")
    soon = status == "expiring"
    local = nationality == "Malaysia"
    return [
        {
            "doc_type": "Passport / ID",
            "doc_number": f"A{4820193 + index * 77}",
            "expiry": "14 Mar 2029",
            "status": "valid",
            "provider": nationality,
        },
        {
            "doc_type": "CIDB green card",
            "doc_number": f"GC-{8840000 + index * 131}",
            "expiry": "29 Aug 2026" if soon else "11 Jan 2028",
            "status": "expiring" if soon else "valid",
            "provider": "CIDB",
        },
        {
            "doc_type": "Work visa",
            "doc_number": "not required" if local else f"WV-{2290000 + index * 53}",
            "expiry": "—" if local else ("18 Aug 2026" if bad else "30 Sep 2027"),
            "status": "na" if local else ("expired" if bad else "valid"),
            "provider": "Immigration",
        },
        {
            "doc_type": "Safety induction",
            "doc_number": f"IND-{5100 + index}",
            "expiry": "12 Feb 2027",
            "status": "valid",
            "provider": "Emerald Builders",
        },
        {
            "doc_type": "Medical fitness",
            "doc_number": f"MF-{7710 + index * 3}",
            "expiry": "06 Sep 2026" if soon else "22 Jun 2027",
            "status": "expiring" if soon else "valid",
            "provider": "Panel clinic",
        },
    ]


def _training_for(index: int) -> list[dict[str, str]]:
    """Port of the design's `trainingFor(w)` (design lines 1532-1539)."""
    courses = [
        "Working at height",
        "Confined space",
        "Hot works",
        "Electrical LV",
        "Manual handling",
        "Lifting & slinging",
    ]
    out = []
    for i, course in enumerate(courses):
        has = (index + i) % 3 != 2
        soon = has and (index + i) % 5 == 1
        out.append(
            {
                "course": course,
                "status": ("expiring" if soon else "valid") if has else "none",
                "expiry": ("11 Sep 2026" if soon else "04 Apr 2028") if has else "—",
            }
        )
    return out


def _zone_criteria(zone_ref: str) -> list[str]:
    """Port of `cfgFor(id).reqs`."""
    if zone_ref == "a3":
        return ["CIDB green card", "Site induction", "Electrical LV"]
    if zone_ref == "b2":
        return ["CIDB green card", "Site induction", "Hot works", "Confined space"]
    return ["CIDB green card", "Site induction"]


def _rule_value(zone: str, requirement: str) -> str:
    """Port of the design's published `ruleVal(z, r)` matrix."""
    if requirement in ("CIDB green card", "Site induction"):
        return "req"
    if zone == "A3 Electrical" and requirement == "Electrical LV":
        return "req"
    if zone == "B2 Plant" and requirement in ("Hot works", "Confined space"):
        return "req"
    if zone == "A2 Podium" and requirement == "Working at height":
        return "req"
    if zone == "Laydown" and requirement == "Lifting & slinging":
        return "opt"
    if zone == "B1 Basement" and requirement == "Confined space":
        return "opt"
    return "na"


def _default_permission(capability: str, role: str) -> bool:
    """Port of `defPerm(cap, role)` from the Users & rights screen."""
    if role == "GC administrator":
        return True
    if role == "GC user":
        return capability not in (
            "Create zones",
            "Change access rules",
            "Issue TC logins",
            "Change system settings",
        )
    if role == "Security":
        return capability in ("Roll call", "Record violations")
    return capability == "Run reports"


def _default_channel(event: str, channel: str) -> bool:
    """Port of the Notifications screen's default event x channel matrix."""
    if channel == "Email":
        return True
    if channel == "In-app":
        return not event.startswith("Visitor")
    return event.startswith("Worker blocked") or event.startswith("Visitor")


async def _upsert_user(
    db: AsyncSession,
    *,
    email: str,
    hashed: str,
    full_name: str,
    role: str,
    company_id: str | None,
    last_seen_at: datetime | None,
) -> None:
    """Create the console user, or give an existing account its console identity.

    Skipping an account that already exists would leave it with the column defaults —
    no name and the lowest role — which is how a seeded administrator quietly loses
    their rights.
    """
    user = await db.scalar(select(User).where(User.email == email))
    if user is None:
        db.add(
            User(
                email=email,
                hashed_password=hashed,
                full_name=full_name,
                role=role,
                company_id=company_id,
                last_seen_at=last_seen_at,
            )
        )
        return
    user.full_name = full_name
    user.role = role
    user.company_id = company_id
    if last_seen_at is not None:
        user.last_seen_at = last_seen_at


async def seed_gc(db: AsyncSession, *, force: bool = False) -> bool:
    """Populate every GC table. Returns False if data was already present.

    Idempotent by design: safe to run on every container start. `force` reloads,
    which means clearing the GC tables first — otherwise a reload would stack a
    second copy of the dataset on top of the first.
    """
    existing = await db.scalar(select(func.count()).select_from(Project))
    if existing and not force:
        return False
    if existing:
        # Ordered children-first; gc_projects cascades to the project-scoped tables,
        # but the global ones have no project to cascade from.
        for table in reversed(Base.metadata.sorted_tables):
            if table.name.startswith("gc_"):
                await db.execute(delete(table))
        await db.flush()

    d = _load()

    # ---- projects and companies -------------------------------------------------
    projects = {}
    for code, name, badge, meta in d["projects"]:
        p = Project(code=code, name=name, badge=badge, meta=meta)
        db.add(p)
        projects[code] = p
    await db.flush()
    pid = projects[PRIMARY_PROJECT].id

    companies: dict[str, Company] = {}
    for i, (name, trade, reg, on, kind, contact, ins, flag) in enumerate(d["companies"]):
        c = Company(
            project_id=pid,
            name=name,
            trade=trade,
            kind=kind,
            contact=contact,
            insurance_expiry=ins,
            flag=flag,
            on_register=reg,
            on_site=on,
            contract_ref=f"PKG-{210 + i}",
        )
        db.add(c)
        companies[name] = c
    await db.flush()

    for co, who, email, status, seen, users in d["tcAccounts"]:
        db.add(
            ContractorAccount(
                project_id=pid,
                company_id=companies[co].id,
                contact_name=who,
                email=email,
                status=status,
                last_seen=seen,
                user_count=users,
            )
        )

    # ---- workers ----------------------------------------------------------------
    # The design loads a 20-row sample of the register, but its validation queue
    # names workers outside that sample; those get a register row too so the queue
    # can reference a real person.
    workers: dict[str, Worker] = {}
    rows = list(d["workers"])
    known = {r[0] for r in rows}
    for sub in d["submissions"]:
        if sub["w"] not in known:
            known.add(sub["w"])
            rows.append(
                [
                    sub["w"],
                    f"EMB-0{4600 + len(rows)}",
                    sub["co"],
                    "—",
                    "pending",
                    "—",
                    0,
                    "—",
                    sub["iss"],
                ]
            )

    for i, (name, ref, co, job, status, permitted, on, seen, nat) in enumerate(rows):
        w = Worker(
            project_id=pid,
            name=name,
            worker_ref=ref,
            company_id=companies[co].id,
            job_role=job,
            status=status,
            zones_permitted=permitted,
            on_site=bool(on),
            last_event=seen,
            nationality=nat,
            date_of_birth="14 Jun 1991",
            sex="Male",
            telephone="+60 12-448 9012",
            address_local="Blk C, Jalan Kempas 4, Johor",
            address_home=f"On file — uploaded by {co}",
            direct_employer=co if co == "Emerald Builders" else f"{co} (direct)",
            induction_date="12 Feb 2026",
            next_of_kin="On file · +880 17-224 1180",
            rfid_card="Card 8841 · issued 12 Feb 2026",
            face_template="Enrolled 12 Feb 2026 · quality 94%",
            second_factor="Required at A3 Electrical, Laydown",
        )
        db.add(w)
        workers[name] = w
        for doc in _docs_for(i, status, nat):
            db.add(WorkerDocument(project_id=pid, worker=w, **doc))
        for tr in _training_for(i):
            db.add(TrainingRecord(project_id=pid, worker=w, **tr))
    await db.flush()

    # ---- validation queue -------------------------------------------------------
    for sub in d["submissions"]:
        s = DocumentSubmission(
            project_id=pid,
            worker_id=workers[sub["w"]].id,
            company_id=companies[sub["co"]].id,
            doc_type=sub["doc"],
            doc_number=sub["no"],
            expiry=sub["exp"],
            issuer=sub["iss"],
            submitted=sub["sub"],
        )
        db.add(s)
        for pos, (label, value) in enumerate(sub["fields"]):
            db.add(
                SubmissionField(
                    project_id=pid, submission=s, label=label, value=value, position=pos
                )
            )
        for pos, text in enumerate(sub["flags"]):
            db.add(SubmissionFlag(project_id=pid, submission=s, text=text, position=pos))

    # ---- zones, rules, plan, devices --------------------------------------------
    zones: dict[str, Zone] = {}
    parent_at_depth: dict[int, Zone] = {}
    for ref, name, kind, depth, pop, factor in d["zones"]:
        z = Zone(
            project_id=pid,
            zone_ref=ref,
            name=name,
            kind=kind,
            depth=depth,
            population=pop,
            factor=factor,
            capacity="12" if ref == "a3" else "20" if ref == "b2" else "—",
            escort_required=ref in ("a3", "b2"),
            parent_id=parent_at_depth[depth - 1].id
            if depth and depth - 1 in parent_at_depth
            else None,
        )
        db.add(z)
        await db.flush()
        parent_at_depth[depth] = z
        zones[ref] = z
        for requirement in _zone_criteria(ref):
            db.add(ZoneCriterion(project_id=pid, zone_id=z.id, requirement=requirement))

    for zone_name in d["matrixZones"]:
        for requirement in d["requirements"]:
            db.add(
                ZoneRequirement(
                    project_id=pid,
                    zone_name=zone_name,
                    requirement=requirement,
                    value=_rule_value(zone_name, requirement),
                )
            )

    for x, y, w_, h, name, colour in [
        (8, 12, 38, 34, "A1 Basement", "#6750A4"),
        (52, 12, 34, 22, "A2 Podium", "#6750A4"),
        (52, 40, 20, 18, "A3 Electrical", "#B3261E"),
        (8, 54, 26, 22, "Laydown", "#49454F"),
    ]:
        db.add(PlanShape(project_id=pid, level="L1", x=x, y=y, w=w_, h=h, name=name, colour=colour))

    for ref, kind, loc, zone_label, status, link, buffered, sync, factor in d["devices"]:
        db.add(
            Device(
                project_id=pid,
                device_ref=ref,
                kind=kind,
                location=loc,
                zone_label=zone_label,
                status=status,
                link=link,
                buffered_events=int(buffered),
                last_sync=sync,
                factor=factor,
            )
        )

    for pos, (key, value, sub) in enumerate(
        [
            ("Maximum hours per week", "60 h", "Warning at 54 h · auto-block above cap"),
            ("Maximum consecutive days", "6 days", "Warning on day 6 · auto-block on day 7"),
            (
                "Inactivity before withdrawal",
                "31 days",
                "No turnstile event · contractor notified on day 24",
            ),
            ("Violations before block", "3 strikes", "Verbal, written, then automatic block"),
            ("Document grace period", "0 days", "Expiry withdraws access the same night"),
            ("Offline buffer retained", "72 h", "Device holds events, then refuses new entries"),
        ]
    ):
        db.add(
            AccessThreshold(
                project_id=pid, key_label=key, value_label=value, sub_label=sub, position=pos
            )
        )

    # ---- enforcement ------------------------------------------------------------
    for ref, when, where, by, cap, booked, state in d["sessions"]:
        session = InductionSession(
            project_id=pid,
            session_ref=ref,
            when_label=when,
            where_label=where,
            run_by=by,
            capacity=cap,
            booked=booked,
            state=state,
        )
        db.add(session)
        if state == "running":
            for wname, wco, label, colour in [
                ("Md Shahin Alam", "Sinar Electrical", "Present · card 8912 issued", "#146C2E"),
                ("Hafiz Rahman", "Zenith Scaffold", "Present · face enrolled", "#146C2E"),
                ("Sunil Gurung", "Kejora M&E", "No show — slot released", "#B3261E"),
                ("Deepak Rai", "Kejora M&E", "Present · awaiting card stock", "#7A5900"),
                ("Prakash Limbu", "Kejora M&E", "Present · card 8913 issued", "#146C2E"),
            ]:
                db.add(
                    InductionAttendance(
                        project_id=pid,
                        session=session,
                        worker_name=wname,
                        company_name=wco,
                        status_label=label,
                        status_colour=colour,
                    )
                )

    for when, name, co, what, by, level, colour in d["violations"]:
        db.add(
            Violation(
                project_id=pid,
                worker_id=workers[name].id if name in workers else None,
                occurred_label=when,
                worker_name=name,
                company_name=co,
                description=what,
                recorded_by=by,
                level=level,
                colour=colour,
            )
        )

    for name, co, kind, why, when, route, colour in d["blocks"]:
        db.add(
            Block(
                project_id=pid,
                worker_id=workers[name].id if name in workers else None,
                worker_name=name,
                company_name=co,
                kind=kind,
                reason=why,
                when_label=when,
                route_back=route,
                colour=colour,
            )
        )

    for pos, (kind, title, subtitle, badge, colour, target) in enumerate(d["alerts"]):
        db.add(
            Alert(
                project_id=pid,
                kind=kind,
                title=title,
                subtitle=subtitle,
                badge=badge,
                colour=colour,
                target_screen=target,
                position=pos,
            )
        )

    # ---- visitors ---------------------------------------------------------------
    for name, kind, by, why, zones_asked, window, age, owner in d["visitRequests"]:
        db.add(
            VisitRequest(
                project_id=pid,
                visitor_name=name,
                visitor_kind=kind,
                requested_by=by,
                purpose=why,
                zones_requested=zones_asked,
                window_label=window,
                age_label=age,
                host_is_me=owner == "me",
                host_name="A. Whitmore" if owner == "me" else "",
            )
        )

    overstay_visit: Visit | None = None
    for name, kind, host, zones_granted, window, state, seen in d["visitorsToday"]:
        visit = Visit(
            project_id=pid,
            visitor_name=name,
            visitor_kind=kind,
            host=host,
            zones_granted=zones_granted,
            window_label=window,
            state=state,
            last_event_label=seen,
            visit_date="Today",
            escort="T. W. Ming",
            credential="QR pass by SMS · expires with the window",
            company="",
        )
        db.add(visit)
        if state == "overstay":
            overstay_visit = visit
    await db.flush()

    # The Visit record screen is one worked example: the visitor who overstayed.
    if overstay_visit is not None:
        overstay_visit.company = "Pantas Steelworks (supplier of)"
        for pos, (label, value) in enumerate(
            [
                ("Visitor", "Zulhilmi Aziz · supplier"),
                ("Company", "Pantas Steelworks (supplier of)"),
                ("Requested by", "Contractor C · 07:41 yesterday"),
                ("Granted by", "A. Whitmore · GC host"),
                ("Zones granted", "Laydown — A Site declined at grant"),
                ("Window", "07:00–09:00 · trimmed from 07:00–12:00"),
                ("Escort", "T. W. Ming · named, required"),
                ("Credential", "QR pass by SMS · expires with the window"),
            ]
        ):
            db.add(
                VisitFact(
                    project_id=pid, visit=overstay_visit, label=label, value=value, position=pos
                )
            )
        for pos, (when, event, detail) in enumerate(
            [
                (
                    "Yesterday 07:41",
                    "Visit requested by Contractor C",
                    "A Site and Laydown asked for",
                ),
                (
                    "Yesterday 09:12",
                    "Granted by A. Whitmore",
                    "A Site declined · window trimmed to 2 h",
                ),
                ("Yesterday 09:13", "QR pass sent by SMS", "+60 12-••• 4471"),
                ("Today 07:04", "Signed in at Laydown vehicle gate", "Escort T. W. Ming present"),
                ("Today 09:00", "Pass expired", "Still on site — host and security notified"),
                ("Today 09:15", "Marked as overstayed", "Re-entry blocked until a fresh grant"),
            ]
        ):
            db.add(
                VisitEvent(
                    project_id=pid,
                    visit=overstay_visit,
                    when_label=when,
                    event=event,
                    detail=detail,
                    position=pos,
                )
            )

    for name, kind, co, visits, last, status, colour in [
        (
            "Zulhilmi Aziz",
            "Supplier",
            "Pantas Steelworks",
            14,
            "Overstayed 25 Aug",
            "Blocked — needs a fresh grant",
            "#B3261E",
        ),
        (
            "Melissa Tan",
            "Consultant",
            "Facade consultancy",
            38,
            "—",
            "Repeat visitor — fast grant",
            "#146C2E",
        ),
        ("Gopal Krishnan", "Auditor", "CIDB", 6, "—", "Repeat visitor — fast grant", "#146C2E"),
        (
            "Ivan Petrov",
            "Delivery driver",
            "Logistics",
            2,
            "Refused twice — no host",
            "Watchlist",
            "#7A5900",
        ),
        (
            "Kenneth Ooi",
            "Supplier",
            "Steel supplier",
            22,
            "—",
            "Repeat visitor — fast grant",
            "#146C2E",
        ),
        (
            "Unknown · card 4471",
            "—",
            "—",
            1,
            "Pass shared with a second person",
            "Blocked — investigation",
            "#B3261E",
        ),
    ]:
        db.add(
            VisitorProfile(
                project_id=pid,
                name=name,
                kind=kind,
                company=co,
                visit_count=visits,
                last_incident=last,
                status_label=status,
                colour=colour,
                blocked=status.startswith("Blocked"),
            )
        )

    toggles = [
        (
            "escort",
            "Every visit needs a named GC escort",
            "A visit cannot be created without one — the escort carries the duty",
            True,
        ),
        (
            "sms",
            "Credential is a QR pass sent by SMS",
            "No card to issue, no reader to enrol, nothing to hand back",
            True,
        ),
        (
            "photo",
            "Capture a photograph at first sign-in",
            "Held for the duration of the visit, then deleted",
            False,
        ),
        (
            "autoExpire",
            "Pass dies at the end of its window",
            "The visitor can still walk out, but cannot come back in",
            True,
        ),
        (
            "reentry",
            "An overstay blocks re-entry",
            "A fresh grant is required, from a host, with a reason",
            True,
        ),
        (
            "hostGrant",
            "Only a GC user may grant a visit",
            "A trade contractor may ask; granting is where zones get cut back",
            True,
        ),
    ]
    for pos, (key, label, sub, on) in enumerate(toggles):
        db.add(
            VisitorPolicySetting(
                project_id=pid,
                policy_key=key,
                label=label,
                sub_label=sub,
                kind="toggle",
                enabled=on,
                position=pos,
            )
        )
    limits = [
        ("max_window", "Maximum window length", "8 hours", "A longer visit needs an administrator"),
        (
            "notice",
            "Notice required",
            "2 hours",
            "Below this the request needs a phone call as well",
        ),
        ("per_host", "Visitors per host at once", "6", "One escort cannot hold more than six"),
        (
            "overstay_grace",
            "Overstay grace",
            "15 minutes",
            "Then the host and security are notified",
        ),
    ]
    for pos, (key, label, value, sub) in enumerate(limits):
        db.add(
            VisitorPolicySetting(
                project_id=pid,
                policy_key=key,
                label=label,
                sub_label=sub,
                kind="limit",
                value_label=value,
                position=pos,
            )
        )

    # ---- records ----------------------------------------------------------------
    for when, person, co, device, direction, verdict, note in d["log"]:
        db.add(
            AccessEvent(
                project_id=pid,
                occurred_label=when,
                person=person,
                company=co,
                device_label=device,
                direction=direction,
                verdict=verdict,
                note=note,
                is_visitor=co.startswith("Visitor"),
            )
        )

    for when, who, role, what, obj, before, after in d["audit"]:
        db.add(
            AuditEntry(
                project_id=pid,
                occurred_label=when,
                who=who,
                role=role,
                action=what,
                obj=obj,
                value_before=before,
                value_after=after,
            )
        )

    schedules = [
        (
            "Daily attendance",
            "Every day 06:30",
            "CSV + PDF",
            "Project director, 4 package managers",
            "Sent today 06:30",
        ),
        (
            "Weekly hours and consecutive days",
            "Mondays 07:00",
            "CSV",
            "HSE manager, 6 contractors",
            "Sent Mon 07:00",
        ),
        (
            "Monthly access audit",
            "1st of the month 08:00",
            "PDF",
            "Client, GC administrator",
            "Sent 01 Aug 08:00",
        ),
        (
            "Expiring documents",
            "Every day 06:00",
            "CSV",
            "Each contractor — own workers only",
            "Sent today 06:00",
        ),
        ("Refused entries", "Fridays 17:00", "PDF", "Security manager", "Sent Fri 17:00"),
    ]
    first_schedule: ReportSchedule | None = None
    for name, cadence, formats, recipients, last in schedules:
        sched = ReportSchedule(
            project_id=pid,
            name=name,
            cadence=cadence,
            formats=formats,
            recipients=recipients,
            last_sent=last,
        )
        db.add(sched)
        first_schedule = first_schedule or sched
    await db.flush()

    if first_schedule is not None:
        run = ReportRun(
            project_id=pid,
            schedule_id=first_schedule.id,
            ran_at_label="Generated 06:30 · scheduled",
            status="Delivered",
            row_count=6,
        )
        db.add(run)
        await db.flush()
        for co, reg, on, att, exp, blk, first_in, last_out in [
            ("Pantas Steelworks", 412, 268, "268", "2", "0", "06:31", "18:12"),
            ("Sinar Electrical", 388, 241, "241", "0", "0", "06:28", "18:02"),
            ("Kejora M&E", 356, 198, "198", "1", "1", "06:34", "17:48"),
            ("Titan Formwork", 298, 187, "187", "0", "1", "06:22", "18:20"),
            ("Zenith Scaffold", 214, 96, "96", "1", "1", "06:40", "17:30"),
            ("Emerald Builders", 186, 142, "142", "0", "0", "06:12", "19:04"),
        ]:
            db.add(
                ReportRow(
                    project_id=pid,
                    run_id=run.id,
                    company_name=co,
                    on_register=reg,
                    on_site=on,
                    attended=att,
                    expiring=exp,
                    blocked=blk,
                    first_in=first_in,
                    last_out=last_out,
                )
            )

    for pos, name in enumerate(d["tiles"]):
        db.add(DashboardTile(project_id=pid, name=name, position=pos, hidden=False))

    # ---- admin (global) ---------------------------------------------------------
    for role in d["roles"]:
        for capability in d["capabilities"]:
            db.add(
                RolePermission(
                    role=role, capability=capability, allowed=_default_permission(capability, role)
                )
            )

    for name, joined, count in d["refData"]:
        ref_list = ReferenceList(name=name, description=joined, item_count=count)
        db.add(ref_list)
        await db.flush()
        for pos, value in enumerate(v.strip() for v in joined.split(",")):
            db.add(ReferenceValue(list_id=ref_list.id, value=value, position=pos))

    for pos, (event, when, audience) in enumerate(d["notifications"]):
        rule = NotificationRule(event=event, when_label=when, audience=audience, position=pos)
        db.add(rule)
        await db.flush()
        for channel in ("Email", "SMS", "In-app"):
            db.add(
                NotificationChannel(
                    rule_id=rule.id, channel=channel, enabled=_default_channel(event, channel)
                )
            )

    # ---- console users ----------------------------------------------------------
    hashed = get_password_hash(SEED_PASSWORD)
    for name, role, co, seen, _scope in d["users"]:
        last_seen = _parse_last_seen(seen)
        handle = name.lower().replace(" ", "").replace(".", "")
        domain = "emeraldbuilders.com" if co == "Emerald Builders" else "contractor.example"
        email = f"{handle}@{domain}"
        await _upsert_user(
            db,
            email=email,
            hashed=hashed,
            full_name=name,
            role=role,
            company_id=companies[co].id if co in companies else None,
            last_seen_at=last_seen,
        )
    # The account the console signs in as.
    await _upsert_user(
        db,
        email=GC_ADMIN_EMAIL,
        hashed=hashed,
        full_name="A. Whitmore",
        role="GC administrator",
        company_id=companies["Emerald Builders"].id,
        last_seen_at=None,
    )

    await db.commit()
    return True
