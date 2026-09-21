"""TC console: the rules that cost real money if only the UI enforces them.

Every test here is a refusal. The happy paths are covered incidentally; what is
checked deliberately is that a trade contractor cannot book an unvalidated worker,
cannot overfill a session, cannot touch another company's people, and cannot grant
their own visitor pass.
"""

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gc.contractor import WorkerLeaver
from app.models.gc.enforcement import InductionSession
from app.models.gc.org import Company
from app.models.gc.visitors import VisitRequest
from app.models.gc.workforce import Worker
from app.models.user import User
from app.services.gc.seed import SEED_PASSWORD, TC_ADMIN_EMAIL, seed_gc

SINAR = "Sinar Electrical"
KEJORA = "Kejora M&E"


@pytest_asyncio.fixture(loop_scope="session", scope="session", autouse=True)
async def seeded(db_session: AsyncSession, create_test_database: None) -> None:
    """Load the reference dataset once for the whole module."""
    await seed_gc(db_session)


async def _token(client: AsyncClient, email: str) -> str:
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": SEED_PASSWORD})
    assert res.status_code == 200, res.text
    return str(res.json()["access_token"])


async def _auth(client: AsyncClient, db: AsyncSession, company: str = SINAR) -> dict[str, str]:
    """Sign in as the trade contractor account issued to `company`.

    Looked up rather than hardcoded: the seed owns which address each contractor
    signs in with, and this suite is about tenancy, not about that address. The demo
    login the seed parks on one company is excluded — it is a second Trade contractor
    on Sinar, so without this the lookup is ambiguous rather than wrong.
    """
    user = (
        await db.execute(
            select(User)
            .join(Company, Company.id == User.company_id)
            .where(
                Company.name == company,
                User.role == "Trade contractor",
                User.email != TC_ADMIN_EMAIL,
            )
        )
    ).scalar_one()
    return {"Authorization": f"Bearer {await _token(client, user.email)}"}


async def _worker(db: AsyncSession, name: str) -> Worker:
    return (await db.execute(select(Worker).where(Worker.name == name))).scalar_one()


async def _session(db: AsyncSession, ref: str) -> InductionSession:
    return (
        await db.execute(select(InductionSession).where(InductionSession.session_ref == ref))
    ).scalar_one()


async def test_an_unvalidated_worker_cannot_be_booked(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Documents still with the GC is a server rule, not a greyed-out row."""
    waiting = await _worker(db_session, "Md Shahin Alam")  # Sinar Electrical, `pending`
    assert waiting.status != "cleared"
    slot = await _session(db_session, "IND-94")

    res = await client.post(
        "/api/v1/tc/inductions/book",
        headers=await _auth(client, db_session),
        json={"session_id": slot.id, "worker_ids": [waiting.id]},
    )
    assert res.status_code == 409, res.text
    assert "Documents are still with the GC" in res.json()["detail"]
    assert "Md Shahin Alam" in res.json()["detail"]


async def test_a_session_cannot_be_booked_past_capacity(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Capacity is per slot; the last place goes to one booking, not two."""
    slot = await _session(db_session, "IND-94")
    slot.booked = slot.capacity - 1  # one place left
    await db_session.commit()

    ravi = await _worker(db_session, "Ravi Kumaran")  # Sinar, cleared
    ahmad = await _worker(db_session, "Ahmad Zulkifli")  # Sinar, cleared
    headers = await _auth(client, db_session)

    too_many = await client.post(
        "/api/v1/tc/inductions/book",
        headers=headers,
        json={"session_id": slot.id, "worker_ids": [ravi.id, ahmad.id]},
    )
    assert too_many.status_code == 409, too_many.text
    assert "No places in that session" in too_many.json()["detail"]

    await db_session.refresh(slot)
    assert slot.booked == slot.capacity - 1, "a refused booking must not have taken the place"

    # The last place is bookable, once, and closes the slot.
    ok = await client.post(
        "/api/v1/tc/inductions/book",
        headers=headers,
        json={"session_id": slot.id, "worker_ids": [ravi.id]},
    )
    assert ok.status_code == 200, ok.text
    assert "cards issued at the end of the session" in ok.json()["message"]
    await db_session.refresh(slot)
    assert slot.booked == slot.capacity
    assert slot.state == "full"

    full = await client.post(
        "/api/v1/tc/inductions/book",
        headers=headers,
        json={"session_id": slot.id, "worker_ids": [ahmad.id]},
    )
    assert full.status_code == 409, full.text


async def test_another_companys_worker_cannot_be_booked(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Sinar may not seat Kejora's cleared worker, however open the slot is."""
    nabin = await _worker(db_session, "Nabin Thapa")  # Kejora M&E, cleared
    slot = await _session(db_session, "IND-93")

    res = await client.post(
        "/api/v1/tc/inductions/book",
        headers=await _auth(client, db_session, SINAR),
        json={"session_id": slot.id, "worker_ids": [nabin.id]},
    )
    assert res.status_code == 404, res.text
    assert "not on your register" in res.json()["detail"]


async def test_another_companys_worker_cannot_be_marked_a_leaver(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """A last day on someone else's payroll is not Sinar's to set."""
    nabin = await _worker(db_session, "Nabin Thapa")  # Kejora M&E
    res = await client.post(
        "/api/v1/tc/leavers",
        headers=await _auth(client, db_session, SINAR),
        json={"worker_id": nabin.id, "last_day": "30 Sep", "reason": "Resigned"},
    )
    assert res.status_code == 404, res.text

    # And no leaver row was created behind the refusal.
    rows = (
        (await db_session.execute(select(WorkerLeaver).where(WorkerLeaver.worker_id == nabin.id)))
        .scalars()
        .all()
    )
    assert all(r.last_day != "30 Sep" for r in rows)


async def test_another_companys_off_boarding_cannot_be_confirmed(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Kejora's checklist is Kejora's to close."""
    nabin = await _worker(db_session, "Nabin Thapa")
    leaver = (
        await db_session.execute(select(WorkerLeaver).where(WorkerLeaver.worker_id == nabin.id))
    ).scalar_one()

    res = await client.post(
        f"/api/v1/tc/leavers/{leaver.id}/confirm",
        headers=await _auth(client, db_session, SINAR),
        json={"card_returned": True},
    )
    assert res.status_code == 404, res.text
    await db_session.refresh(leaver)
    assert leaver.confirmed is False


async def test_marking_a_leaver_keeps_the_worker(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """A last day, not a delete — the record stays for audit."""
    ahmad = await _worker(db_session, "Ahmad Zulkifli")  # Sinar
    res = await client.post(
        "/api/v1/tc/leavers",
        headers=await _auth(client, db_session, SINAR),
        json={"worker_id": ahmad.id, "last_day": "12 Sep", "reason": "Contract ended"},
    )
    assert res.status_code == 200, res.text
    assert "the record stays for audit" in res.json()["message"]
    assert await db_session.get(Worker, ahmad.id) is not None

    # A second last day on the same worker is a conflict, not a duplicate row.
    again = await client.post(
        "/api/v1/tc/leavers",
        headers=await _auth(client, db_session, SINAR),
        json={"worker_id": ahmad.id, "last_day": "13 Sep", "reason": "Resigned"},
    )
    assert again.status_code == 409, again.text


async def test_a_rest_day_cannot_be_planned_for_another_companys_worker(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The hours screen is scoped to the contractor's own register."""
    nabin = await _worker(db_session, "Nabin Thapa")  # Kejora, and has an hours row
    res = await client.post(
        "/api/v1/tc/hours/rest-days",
        headers=await _auth(client, db_session, SINAR),
        json={"worker_ids": [nabin.id], "rest_day": "Fri 28 Aug"},
    )
    assert res.status_code == 404, res.text


async def test_a_visit_request_cannot_self_grant(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """An ask, not a grant: no decision, no granted zones, no smuggling either in."""
    headers = await _auth(client, db_session, SINAR)
    for smuggled in (
        {"decision": "granted"},
        {"zones_granted": "A Site, B Site"},
        {"decision_reason": "approved by me"},
        {"host_is_me": True},
    ):
        res = await client.post(
            "/api/v1/tc/visits/requests",
            headers=headers,
            json={"visitor_name": "Facade consultant", **smuggled},
        )
        assert res.status_code == 422, f"{smuggled} was accepted: {res.text}"

    ok = await client.post(
        "/api/v1/tc/visits/requests",
        headers=headers,
        json={
            "visitor_name": "Cable tester",
            "visitor_company": "Volt Diagnostics",
            "purpose": "Loop testing",
            "zones": "A3 Electrical",
            "window": "Thu 09:00-11:00",
            "host_name": "A. Whitmore",
        },
    )
    assert ok.status_code == 200, ok.text
    assert "they may cut the zones or the hours" in ok.json()["message"]

    row = (
        await db_session.execute(
            select(VisitRequest).where(VisitRequest.visitor_name == "Cable tester")
        )
    ).scalar_one()
    assert row.decision is None
    assert row.host_is_me is False
    assert row.zones_requested == "A3 Electrical"


async def test_a_contractor_sees_only_its_own_requests(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """You see your own requests — not the project's visitor register."""
    made = await client.post(
        "/api/v1/tc/visits/requests",
        headers=await _auth(client, db_session, KEJORA),
        json={"visitor_name": "Pump technician", "purpose": "Service"},
    )
    assert made.status_code == 200, made.text

    mine = await client.get(
        "/api/v1/tc/visits/requests", headers=await _auth(client, db_session, SINAR)
    )
    assert mine.status_code == 200, mine.text
    names = [r["visitor"] for r in mine.json()]
    assert "Cable tester" in names
    assert "Pump technician" not in names
