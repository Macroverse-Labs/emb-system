"""One read that fills the whole TC console — scoped to one contractor's own company.

The GC's `/gc/bootstrap` is the same idea for a whole project. This one differs in the
only way that matters: every collection below is filtered to `contractor.company`, and
the two that cannot be (see `visitorRequests`) say so in a comment rather than leaking.
"""

from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.admin import RolePermission
from app.models.gc.contractor import WorkerHours, WorkerLeaver
from app.models.gc.enforcement import Block
from app.models.gc.org import Company, Project
from app.models.gc.visitors import VisitRequest
from app.models.gc.workforce import DocumentSubmission, TrainingRecord, Worker, WorkerDocument
from app.routers.gc.bootstrap import site_now
from app.routers.tc.deps import Contractor, get_contractor
from app.routers.tc.inductions import induction_sessions
from app.schemas.tc.bootstrap import TcBootstrap, TcDocRow, TcMeta
from app.services.gc.seed import TC_CAPABILITIES

router = APIRouter(prefix="/tc", tags=["tc"])

# The design's Inactive workers screen: a worker who has not badged in for 31 days is
# blocked automatically. Rows enter the list once they are two-thirds through it, which
# is where the design's own shortest row (22 d) sits.
INACTIVITY_LIMIT_DAYS = 31
INACTIVITY_WATCH_DAYS = 21
# How long a contractor gets to replace a rejected document before access stops, and
# the window a renewal is expected inside. Both drive the progress bars only.
REJECTION_WINDOW_DAYS = 14
RENEWAL_WINDOW_DAYS = 90


def _parse_date(label: str) -> date | None:
    """Read one of the label formats the console stores dates in, or give up.

    Dates live as display strings all over these tables ("29 Aug 2026", "2026-09-12",
    "26 Jul"). Anything unparseable — "—", "Never" — is simply not a date.
    """
    label = label.strip()
    for fmt in ("%d %b %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(label, fmt).date()
        except ValueError:
            continue
    # "26 Jul" carries no year: read it as the most recent occurrence, never the future.
    # The year is supplied here rather than defaulted, which 3.15 stops allowing.
    today = site_now().date()
    try:
        parsed = datetime.strptime(f"{label} {today.year}", "%d %b %Y").date()
    except ValueError:
        return None
    return parsed.replace(year=today.year - 1) if parsed > today else parsed


def _days_until(label: str) -> int | None:
    parsed = _parse_date(label)
    return None if parsed is None else (parsed - site_now().date()).days


def _pct(consumed: int, window: int) -> str:
    """A clock-consumed progress bar, clamped to 0-100%."""
    return f"{max(0, min(100, round(consumed / window * 100)))}%"


@router.get("/bootstrap", response_model=TcBootstrap)
async def bootstrap(
    contractor: Contractor = Depends(get_contractor),
    db: AsyncSession = Depends(get_db),
) -> TcBootstrap:
    """Everything one trade contractor sees, in the shapes `tc/types.ts` declares.

    No capability gate: the same as `/gc/bootstrap`, being able to sign in to the
    console is what earns the read. What the contractor may *do* is `meta.permissions`,
    and every mutation re-checks it through `require_tc`.

    Rows whose screen fires a mutation carry their database id as a trailing element,
    the same convention `/gc/bootstrap` uses — without it the console cannot address
    its own endpoints. Append only; the frontend indexes these from the front.

    ponytail: one aggregate read, ~10 queries. Split per screen if it ever gets slow.
    """
    company, project = contractor.company, contractor.project
    today = site_now().date()

    workers = list(
        (
            await db.scalars(
                select(Worker)
                .where(Worker.project_id == project.id, Worker.company_id == company.id)
                .order_by(Worker.name)
            )
        ).all()
    )
    worker_ids = {w.id for w in workers}
    worker_names = {w.id: w.name for w in workers}
    worker_roles = {w.id: w.job_role for w in workers}

    # A company with nobody on the register still gets a valid payload; the `in_([])`
    # guards below keep that from turning into an unfiltered query.
    submissions = (
        list(
            (
                await db.scalars(
                    select(DocumentSubmission).where(
                        DocumentSubmission.company_id == company.id,
                        DocumentSubmission.project_id == project.id,
                    )
                )
            ).all()
        )
        if worker_ids
        else []
    )
    documents = (
        list(
            (
                await db.scalars(
                    select(WorkerDocument).where(WorkerDocument.worker_id.in_(worker_ids))
                )
            ).all()
        )
        if worker_ids
        else []
    )
    training = (
        list(
            (
                await db.scalars(
                    select(TrainingRecord)
                    .where(TrainingRecord.worker_id.in_(worker_ids))
                    .order_by(TrainingRecord.course)
                )
            ).all()
        )
        if worker_ids
        else []
    )
    hours_rows = (
        list(
            (
                await db.scalars(select(WorkerHours).where(WorkerHours.worker_id.in_(worker_ids)))
            ).all()
        )
        if worker_ids
        else []
    )
    leaver_rows = (
        list(
            (
                await db.scalars(select(WorkerLeaver).where(WorkerLeaver.worker_id.in_(worker_ids)))
            ).all()
        )
        if worker_ids
        else []
    )
    # Blocks carry a nullable worker_id, so match on the name too — but only against
    # names already known to be this company's, which keeps the scope intact.
    blocks = list(
        (
            await db.scalars(
                select(Block).where(Block.project_id == project.id, Block.lifted.is_(False))
            )
        ).all()
    )
    blocked_ids = {
        b.worker_id
        for b in blocks
        if b.worker_id in worker_ids or b.worker_name in worker_names.values()
    }
    blocked_names = {b.worker_name for b in blocks} & set(worker_names.values())
    left_ids = {row.worker_id for row in leaver_rows}

    docs_by_worker: dict[str, list[WorkerDocument]] = {}
    for doc in documents:
        docs_by_worker.setdefault(doc.worker_id, []).append(doc)
    subs_by_worker: dict[str, list[DocumentSubmission]] = {}
    for sub in submissions:
        subs_by_worker.setdefault(sub.worker_id, []).append(sub)

    def _inactive_days(worker: Worker) -> int | None:
        parsed = _parse_date(worker.last_seen_on)
        return None if parsed is None else (today - parsed).days

    def _access(worker: Worker) -> str:
        """Which of the design's six chips this worker wears.

        Precedence, most terminal first: a leaver has left whatever else is true; an
        open block stops them at the gate; otherwise on-site beats allowed; a worker
        still awaiting induction is `pending`; and a worker the 31-day clock is
        counting down is `inactive`.
        """
        if worker.id in left_ids:
            return "left"
        if worker.id in blocked_ids or worker.name in blocked_names or worker.status == "blocked":
            return "blocked"
        if worker.on_site:
            return "onsite"
        if worker.status in ("pending", "draft", "review"):
            return "pending"
        days = _inactive_days(worker)
        if worker.inactivity_warnings or (days is not None and days >= INACTIVITY_WATCH_DAYS):
            return "inactive"
        return "allowed"

    def _doc_state(worker: Worker) -> str:
        """Which of the design's five document chips this worker wears.

        Precedence: a leaver's file is archived; a GC rejection outranks everything a
        clock can do; then the nearest expiry; then anything still with the GC. The
        design has no "expired" chip, so an already-expired document reads `expiring` —
        the block it caused shows on the access chip instead.
        """
        if worker.id in left_ids:
            return "archived"
        subs = subs_by_worker.get(worker.id, [])
        if any(s.decision == "rejected" for s in subs):
            return "rejected"
        if any(d.status in ("expiring", "expired") for d in docs_by_worker.get(worker.id, [])):
            return "expiring"
        if any(s.decision is None for s in subs):
            return "awaiting"
        return "valid"

    def _last_seen(worker: Worker) -> str:
        for label in (worker.last_seen_on, worker.last_event):
            if label and label != "—":
                return label
        return "Never"

    # ---- documents queue, grouped by consequence ------------------------------------
    doc_queue: list[TcDocRow] = []
    for sub in submissions:
        if sub.decision != "rejected":
            continue
        age = (site_now() - sub.created_at.astimezone(site_now().tzinfo)).days
        left = REJECTION_WINDOW_DAYS - age
        doc_queue.append(
            TcDocRow(
                id=sub.id,
                worker_id=sub.worker_id,
                submission_id=sub.id,
                n=worker_names.get(sub.worker_id, ""),
                doc=sub.doc_type,
                d=(
                    sub.flags[0].text.upper() if sub.flags else f"{sub.doc_type.upper()} · REJECTED"
                ),
                when=f"{age} d" if left > 0 else "—",
                grp="rej",
                no=sub.doc_number,
                exp=sub.expiry,
                file=(sub.file_path.rsplit("/", 1)[-1].upper() or "—"),
                reason=sub.decision_reason,
                head=(
                    f"REJECTED BY THE GC — {sub.decided_at.upper()} · {sub.decided_by.upper()}"
                    if sub.decided_at
                    else "REJECTED BY THE GC"
                ),
                st=f"Rejected {sub.decided_at}" if sub.decided_at else "Rejected",
                days=(
                    f"{left} DAYS LEFT TO PRODUCE THIS DOCUMENT"
                    if left > 0
                    else "CLOCK EXPIRED — WORKER IS BLOCKED"
                ),
                pct=_pct(age, REJECTION_WINDOW_DAYS),
            )
        )
    for doc in documents:
        if doc.status not in ("expiring", "expired"):
            continue
        expires_in = _days_until(doc.expiry)
        gone = doc.status == "expired" or (expires_in is not None and expires_in <= 0)
        doc_queue.append(
            TcDocRow(
                id=doc.id,
                worker_id=doc.worker_id,
                # A WorkerDocument, not a submission: there is nothing to resubmit.
                submission_id=None,
                n=worker_names.get(doc.worker_id, ""),
                doc=doc.doc_type,
                d=doc.doc_type.upper(),
                when="—" if gone or expires_in is None else f"{expires_in} d",
                grp="gone" if gone else "exp",
                no=doc.doc_number,
                exp=doc.expiry,
                file="—",
                reason=(
                    f"Expired on {doc.expiry}. Access was withdrawn automatically — only the "
                    "GC can reinstate it once a valid document is validated."
                    if gone
                    else f"Not rejected — it expires on {doc.expiry}. "
                    "Upload the renewal and the worker never notices."
                ),
                head=(
                    "EXPIRED — ACCESS ALREADY STOPPED"
                    if gone
                    else "EXPIRING — RENEWAL NOT YET UPLOADED"
                ),
                st=f"Expired {doc.expiry}" if gone else f"Expires {expires_in} d",
                days=(
                    "CLOCK EXPIRED — WORKER IS BLOCKED"
                    if gone
                    else f"{expires_in} DAYS UNTIL ACCESS STOPS"
                ),
                pct="100%"
                if gone
                else _pct(RENEWAL_WINDOW_DAYS - (expires_in or 0), RENEWAL_WINDOW_DAYS),
            )
        )
    group_order = {"rej": 0, "exp": 1, "gone": 2}
    doc_queue.sort(key=lambda row: (group_order[row.grp], row.n))

    # ---- training matrix ------------------------------------------------------------
    # Columns come from the courses this company's workers actually hold records for,
    # alphabetically — the design's hand-ordered TRCOLS is not derivable from the data.
    training_columns = sorted({t.course for t in training})
    by_worker_course = {(t.worker_id, t.course): t for t in training}
    training_rows = []
    for worker in workers:
        if not any((worker.id, course) in by_worker_course for course in training_columns):
            continue
        cells = []
        for course in training_columns:
            record = by_worker_course.get((worker.id, course))
            if record is None or record.status == "none":
                cells.append("—")
                continue
            if record.status in ("expiring", "expired"):
                lapses_in = _days_until(record.expiry)
                cells.append(f"exp:{lapses_in} d" if lapses_in and lapses_in > 0 else "exp:expired")
                continue
            cells.append(record.expiry)
        training_rows.append((worker.name, worker.job_role, cells, worker.id))

    # ---- inactivity, against the 31-day clock ---------------------------------------
    inactive = []
    for worker in workers:
        days = _inactive_days(worker)
        if days is None or (days < INACTIVITY_WATCH_DAYS and not worker.inactivity_warnings):
            continue
        blocked = days >= INACTIVITY_LIMIT_DAYS
        remaining = INACTIVITY_LIMIT_DAYS - days
        if blocked:
            due = "—"
        elif remaining <= 1:
            due = "Tonight" if remaining <= 0 else "Tomorrow"
        else:
            due = f"{date.fromordinal(today.toordinal() + remaining):%d %b}"
        warnings = {0: "—", 1: "Warned once"}.get(worker.inactivity_warnings, "Warned twice")
        if blocked:
            # The clock fired 31 days after the last badge-in, so that is the block date.
            fired = date.fromordinal(today.toordinal() - days + INACTIVITY_LIMIT_DAYS)
            warnings = f"Blocked {fired:%d %b}"
        inactive.append(
            (
                worker.name,
                worker.last_seen_on,
                days,
                due,
                warnings,
                2 if blocked else (1 if worker.inactivity_warnings else 0),
                worker.id,
            )
        )
    inactive.sort(key=lambda row: -row[2])

    # ---- visitor requests -----------------------------------------------------------
    # SCOPING NOTE: gc_visit_requests has no company_id — the only link back to a
    # contractor is the free-text `requested_by` the GC console writes. So a contractor
    # is shown its own requests (name matched) plus any it is the named host of, and
    # nothing else. Other contractors' requests are deliberately withheld even though
    # the design's mock shows some with mine=0; returning them would be a leak.
    requests = list(
        (
            await db.scalars(
                select(VisitRequest)
                .where(VisitRequest.project_id == project.id)
                .order_by(VisitRequest.created_at)
            )
        ).all()
    )
    visitor_requests = []
    for req in requests:
        mine = company.name in req.requested_by
        if not mine and req.host_name != contractor.user.full_name:
            continue
        # The design's chip reads "Waiting · 4 h"; the stored label is "4 h ago".
        asked = req.age_label.removesuffix(" ago")
        if req.decision == "approved":
            status_label, colour = f"Approved — {req.zones_requested}", "#146C2E"
        elif req.decision is not None:
            status_label, colour = "Declined", "#B3261E"
        else:
            status_label, colour = f"Waiting · {asked}", "#7A5900"
        visitor_requests.append(
            (
                req.visitor_kind,
                req.visitor_name,
                req.purpose,
                req.window_label,
                req.host_name,
                status_label,
                colour,
                (req.decision_reason or f"Asked {req.age_label}").upper(),
                1 if mine else 0,
                req.id,
            )
        )

    # ---- the project switcher -------------------------------------------------------
    # Only the projects this company is set up on — a company row exists per project.
    company_projects = list(
        (
            await db.execute(
                select(Project, Company)
                .join(Company, Company.project_id == Project.id)
                .where(Company.name == company.name)
                .order_by(Project.code)
            )
        ).all()
    )

    # What the grid actually allows this role, so the UI greys out what the GC revoked.
    # Absent row means not granted — the same reading `require_tc` takes.
    granted = {
        row.capability: row.allowed
        for row in (
            await db.scalars(
                select(RolePermission).where(RolePermission.role == contractor.user.role)
            )
        ).all()
    }
    permissions = {cap: bool(granted.get(cap)) for cap in sorted(TC_CAPABILITIES)}

    return TcBootstrap(
        projects=[
            (proj.code, proj.name, proj.badge, f"{co.on_register} workers · {co.on_site} on site")
            for proj, co in company_projects
        ],
        workers=[
            (
                w.name,
                w.worker_ref,
                w.job_role,
                w.direct_employer or "Direct",
                _access(w),
                _doc_state(w),
                _last_seen(w),
                w.id,
            )
            for w in workers
        ],
        doc_queue=doc_queue,
        training_columns=[c.upper() for c in training_columns],
        training=training_rows,
        # Project-wide on purpose: the GC runs the sessions, every contractor books the
        # same slots. Only the attendance nested in each one is scoped to this company.
        induction_sessions=await induction_sessions(db, contractor),
        hours=[
            (
                worker_names.get(h.worker_id, ""),
                worker_roles.get(h.worker_id, ""),
                h.pct,
                h.hours_label,
                h.days_label,
                1 if h.warned else 0,
                h.flag,
                h.worker_id,
            )
            for h in sorted(hours_rows, key=lambda h: -h.pct)
        ],
        inactive=inactive,
        leavers=[
            (
                worker_names.get(le.worker_id, ""),
                le.last_day,
                le.reason,
                le.card_returned,
                le.hours_label,
                le.status_label,
                le.level,
                le.meta,
                le.id,
                le.worker_id,
            )
            for le in sorted(leaver_rows, key=lambda le: -le.level)
        ],
        visitor_requests=visitor_requests,
        meta=TcMeta(
            company=company.name,
            project=project.code,
            # The bell counts what has a deadline: every document card, every request
            # still waiting on a host, and every worker the inactivity clock has flagged.
            notifications=(
                len(doc_queue)
                + sum(1 for r in visitor_requests if r[5].startswith("Waiting"))
                + sum(1 for r in inactive if r[5] > 0)
            ),
            # The company's own register counts, not len(workers): the seeded register is
            # a sample, and the sidebar badge must read the real headcount.
            on_register=company.on_register,
            on_site=company.on_site,
            permissions=permissions,
        ),
    )
