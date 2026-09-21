"""TC console: the tenancy boundary, the capability grid, and the bootstrap payload."""

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gc.admin import RolePermission
from app.models.gc.contractor import WorkerLeaver
from app.models.gc.enforcement import InductionAttendance, InductionSession
from app.models.gc.org import Company, Project
from app.models.gc.visitors import VisitRequest
from app.models.gc.workforce import DocumentSubmission, Worker, WorkerDocument
from app.services.gc.seed import GC_ADMIN_EMAIL, SEED_PASSWORD, seed_gc

# The seeded contractor login IS the issued TC account, one per company.
TC_EMAIL = "l.chandran@sinar.my"
TC_COMPANY = "Sinar Electrical"


@pytest_asyncio.fixture(loop_scope="session", scope="session", autouse=True)
async def seeded(db_session: AsyncSession, create_test_database: None) -> None:
    """Load the reference dataset once for the whole module."""
    await seed_gc(db_session)


async def _auth(client: AsyncClient, email: str) -> dict[str, str]:
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": SEED_PASSWORD})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


async def test_bootstrap_returns_only_this_company(client: AsyncClient) -> None:
    """The whole point of the console: a TC token never sees another company's rows."""
    res = await client.get("/api/v1/tc/bootstrap", headers=await _auth(client, TC_EMAIL))
    assert res.status_code == 200, res.text
    payload = res.json()

    assert payload["meta"]["company"] == TC_COMPANY
    assert payload["meta"]["project"] == "EMB1A"
    for key in ("workers", "docQueue", "training", "hours", "inactive", "leavers"):
        assert payload[key], f"{key} came back empty — the collection is not being built"

    ours = {w[0] for w in payload["workers"]}
    # Seeded register names belonging to other contractors — none may appear anywhere.
    theirs = {"Bilal Ahmed", "Sunil Gurung", "Nabin Thapa", "Krishna Bahadur"}
    assert ours & theirs == set()
    for name in (
        [row["n"] for row in payload["docQueue"]]
        + [row[0] for row in payload["training"]]
        + [row[0] for row in payload["hours"]]
        + [row[0] for row in payload["inactive"]]
        + [row[0] for row in payload["leavers"]]
    ):
        assert name in ours, f"{name} is not on this contractor's register"

    # Every project row is one this company is set up on.
    assert [p[0] for p in payload["projects"]] == ["EMB1A"]

    # The chips must be states the design can render.
    assert {w[4] for w in payload["workers"]} <= {
        "onsite",
        "allowed",
        "blocked",
        "pending",
        "inactive",
        "left",
    }
    assert {w[5] for w in payload["workers"]} <= {
        "valid",
        "rejected",
        "expiring",
        "awaiting",
        "archived",
    }


async def test_every_row_carries_an_addressable_id(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The trailing ids must resolve — an id that 404s on its own endpoint is the bug."""
    res = await client.get("/api/v1/tc/bootstrap", headers=await _auth(client, TC_EMAIL))
    payload = res.json()
    code = payload["meta"]["project"]

    projects = {p.id: p.code for p in (await db_session.scalars(select(Project))).all()}
    companies = {
        c.id for c in (await db_session.scalars(select(Company))).all() if c.name == TC_COMPANY
    }
    ours = {
        w.id: w
        for w in (await db_session.scalars(select(Worker))).all()
        if w.company_id in companies and projects.get(w.project_id) == code
    }
    leavers = {le.id: le.worker_id for le in (await db_session.scalars(select(WorkerLeaver))).all()}
    requests = {
        r.id: projects.get(r.project_id)
        for r in (await db_session.scalars(select(VisitRequest))).all()
    }
    docs = {d.id: d.worker_id for d in (await db_session.scalars(select(WorkerDocument))).all()}
    subs = {s.id: s.worker_id for s in (await db_session.scalars(select(DocumentSubmission))).all()}

    for row in payload["workers"]:
        assert len(row) == 8 and row[7] in ours
    for row in payload["hours"]:
        assert len(row) == 8 and row[7] in ours
    for row in payload["inactive"]:
        assert len(row) == 7 and row[6] in ours
    for row in payload["leavers"]:
        assert len(row) == 10 and row[9] in ours
        assert leavers.get(row[8]) == row[9], "leaverId does not resolve to this worker's leaver"
    for row in payload["visitorRequests"]:
        assert len(row) == 10 and requests.get(row[9]) == code
    for row in payload["training"]:
        assert len(row) == 4 and row[3] in ours

    for card in payload["docQueue"]:
        assert card["workerId"] in ours
        if card["grp"] == "rej":
            # Addressable by POST /tc/documents/{submission_id}/resubmit.
            assert subs.get(card["submissionId"]) == card["workerId"]
        else:
            # No submission to resubmit; the id is a WorkerDocument, hence the fresh upload.
            assert card["submissionId"] is None
            assert docs.get(card["id"]) == card["workerId"]

    # The seed has no rejection for this company, so the one path that *does* carry a
    # submission — the only one `/documents/{id}/resubmit` accepts — brings its own.
    worker = next(iter(ours.values()))
    sub = DocumentSubmission(
        worker_id=worker.id,
        company_id=worker.company_id,
        project_id=worker.project_id,
        doc_type="CIDB green card",
        decision="rejected",
        decision_reason="Illegible scan",
    )
    db_session.add(sub)
    await db_session.flush()
    try:
        res = await client.get("/api/v1/tc/bootstrap", headers=await _auth(client, TC_EMAIL))
        card = next(c for c in res.json()["docQueue"] if c["grp"] == "rej")
        assert card["submissionId"] == sub.id and card["workerId"] == worker.id
    finally:
        await db_session.delete(sub)
        await db_session.flush()


async def test_bootstrap_refuses_a_gc_account(client: AsyncClient) -> None:
    """A GC administrator has no company of their own; this console is not theirs."""
    res = await client.get("/api/v1/tc/bootstrap", headers=await _auth(client, GC_ADMIN_EMAIL))
    assert res.status_code == 403, res.text


async def test_bootstrap_needs_a_token(client: AsyncClient) -> None:
    res = await client.get("/api/v1/tc/bootstrap")
    assert res.status_code == 401


@pytest.mark.parametrize(
    "capability",
    ["Add workers", "Upload documents", "Book inductions", "Request visits", "Mark leavers"],
)
async def test_permissions_report_the_grid(
    client: AsyncClient, db_session: AsyncSession, capability: str
) -> None:
    """`meta.permissions` is the grid's answer, not a hardcoded list."""
    res = await client.get("/api/v1/tc/bootstrap", headers=await _auth(client, TC_EMAIL))
    grid = await db_session.scalar(
        select(RolePermission).where(
            RolePermission.role == "Trade contractor",
            RolePermission.capability == capability,
        )
    )
    assert res.json()["meta"]["permissions"][capability] is bool(grid and grid.allowed)


async def test_require_tc_follows_a_revoked_capability(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Revoking a capability in the grid must actually refuse the dependency."""
    from app.routers.tc.deps import require_tc

    dependency = require_tc("Add workers")
    row = await db_session.scalar(
        select(RolePermission).where(
            RolePermission.role == "Trade contractor",
            RolePermission.capability == "Add workers",
        )
    )
    assert row is not None
    contractor = type("C", (), {"user": type("U", (), {"role": "Trade contractor"})()})()

    row.allowed = False
    await db_session.flush()
    with pytest.raises(Exception, match="Add workers"):
        await dependency(contractor=contractor, db=db_session)

    row.allowed = True
    await db_session.flush()
    assert await dependency(contractor=contractor, db=db_session) is contractor


async def test_seed_tops_up_a_capability_added_after_the_first_seed(
    db_session: AsyncSession,
) -> None:
    """A release that adds a capability must reach an already-seeded database.

    `seed_gc` refuses to reload once data exists, so without the top-up the five TC
    capabilities would never appear on a deployed environment and `require()` — which
    denies any capability with no row — would refuse every contractor action, silently.
    """
    added = await db_session.scalar(
        select(RolePermission).where(
            RolePermission.role == "Trade contractor",
            RolePermission.capability == "Add workers",
        )
    )
    assert added is not None

    # A capability the grid has never seen, plus a row the GC has deliberately turned off.
    await db_session.delete(added)
    revoked = await db_session.scalar(
        select(RolePermission).where(
            RolePermission.role == "Trade contractor",
            RolePermission.capability == "Upload documents",
        )
    )
    assert revoked is not None
    revoked.allowed = False
    await db_session.flush()

    assert await seed_gc(db_session) is False  # already populated: tops up, does not reload

    restored = await db_session.scalar(
        select(RolePermission).where(
            RolePermission.role == "Trade contractor",
            RolePermission.capability == "Add workers",
        )
    )
    assert restored is not None and restored.allowed is True

    # The GC's own edit survives — the top-up fills gaps, it does not reset the grid.
    kept = await db_session.scalar(
        select(RolePermission).where(
            RolePermission.role == "Trade contractor",
            RolePermission.capability == "Upload documents",
        )
    )
    assert kept is not None and kept.allowed is False

    kept.allowed = True  # restore: the session is shared across this module
    await db_session.flush()


async def test_induction_sessions_are_bookable(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The whole reason this collection exists: the id must book, not 404.

    The design's Induction booking screen had a hand-drawn slot grid ("1-1") and no
    uuid to send, so `POST /tc/inductions/book` was unreachable from the console.
    """
    headers = await _auth(client, TC_EMAIL)
    payload = (await client.get("/api/v1/tc/bootstrap", headers=headers)).json()
    slots = payload["inductionSessions"]
    assert slots, "inductionSessions came back empty — the screen still has nothing to book"

    project = await db_session.scalar(
        select(Project).where(Project.code == payload["meta"]["project"])
    )
    assert project is not None
    real = {s.id: s for s in (await db_session.scalars(select(InductionSession))).all()}

    for slot in slots:
        session = real.get(slot["id"])
        assert session is not None, f"{slot['id']} is not an InductionSession"
        assert session.project_id == project.id, "a session from another project leaked"
        assert slot["ref"] == session.session_ref
        assert 0 <= slot["remaining"] <= slot["capacity"], slot
        assert slot["remaining"] == max(0, session.capacity - session.booked)
        # Attendance is company-scoped even though the session is not.
        for seat in slot["attendance"]:
            row = await db_session.get(InductionAttendance, seat["id"])
            assert row is not None and row.session_id == session.id
            assert row.company_name == TC_COMPANY, "another company's seat is visible"

    # Sessions are project-wide by design — a full slot is returned so the UI can grey
    # it out rather than being hidden and silently unbookable.
    assert {s["state"] for s in slots} == {
        s.state for s in real.values() if s.project_id == project.id
    }

    # The id must be directly usable against the booking endpoint. An open slot with
    # room returns 200; the failure this test guards is 404 "Session not found".
    open_slot = next(s for s in slots if s["state"] == "open" and s["remaining"] > 0)
    worker = await db_session.scalar(
        select(Worker).where(Worker.id.in_([w[7] for w in payload["workers"]]))
    )
    assert worker is not None
    res = await client.post(
        "/api/v1/tc/inductions/book",
        headers=headers,
        json={"session_id": open_slot["id"], "worker_ids": [worker.id]},
    )
    assert res.status_code in (200, 409), res.text
    assert "Session not found" not in res.text
