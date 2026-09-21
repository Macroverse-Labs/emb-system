"""Contractor logins: the login the GC issues has to actually sign in."""

import re

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gc.org import Company, ContractorAccount
from app.models.gc.records import AuditEntry
from app.models.user import User
from app.services.gc.seed import GC_ADMIN_EMAIL, SEED_PASSWORD, seed_gc

CONTACT = "R. Okafor"
EMAIL = "r.okafor@northline-steel.co.uk"


@pytest_asyncio.fixture(loop_scope="session", scope="session", autouse=True)
async def seeded(db_session: AsyncSession, create_test_database: None) -> None:
    """Load the reference dataset once for the whole module."""
    await seed_gc(db_session)


async def _auth(client: AsyncClient) -> dict[str, str]:
    res = await client.post(
        "/api/v1/auth/login", json={"email": GC_ADMIN_EMAIL, "password": SEED_PASSWORD}
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _password(message: str) -> str:
    """Pull the temporary password out of the sentence the console shows."""
    found = re.search(r"temporary password (\S+)", message)
    assert found, message
    return found.group(1)


async def _login(client: AsyncClient, password: str) -> int:
    res = await client.post("/api/v1/auth/login", json={"email": EMAIL, "password": password})
    return res.status_code


async def test_issued_login_can_sign_in_and_follows_the_account_state(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Issue, sign in, suspend, refuse, reinstate — the whole point of the screen."""
    headers = await _auth(client)
    company = (await db_session.execute(select(Company).limit(1))).scalar_one()

    res = await client.post(
        "/api/v1/gc/admin/contractors",
        headers=headers,
        json={"company_id": company.id, "contact_name": CONTACT, "email": EMAIL},
    )
    assert res.status_code == 200, res.text
    password = _password(res.json()["message"])

    account = (
        await db_session.execute(select(ContractorAccount).where(ContractorAccount.email == EMAIL))
    ).scalar_one()
    login = await db_session.get(User, account.user_id)
    assert login is not None
    assert login.role == "Trade contractor"
    assert login.company_id == company.id
    assert login.is_active is True
    assert login.full_name == CONTACT

    # The acceptance criterion: the issued login signs in straight away.
    assert await _login(client, password) == 200

    # The password reaches the GC and nowhere else — never the audit trail.
    rows = (await db_session.execute(select(AuditEntry))).scalars().all()
    issued = [a for a in rows if a.action == "Contractor login issued"]
    assert issued and issued[-1].value_after == "Invited — not yet accepted"
    assert not [a for a in rows if password in f"{a.value_before}{a.value_after}{a.obj}"]

    # Re-sending mints a new password; the old one stops working.
    res = await client.post(f"/api/v1/gc/admin/contractors/{account.id}/resend", headers=headers)
    assert res.status_code == 200, res.text
    fresh = _password(res.json()["message"])
    assert fresh != password
    assert await _login(client, password) == 401
    assert await _login(client, fresh) == 200

    # Suspending deactivates the sign-in, so it is refused rather than merely flagged.
    res = await client.post(f"/api/v1/gc/admin/contractors/{account.id}/suspend", headers=headers)
    assert res.status_code == 200, res.text
    await db_session.refresh(login)
    assert login.is_active is False
    assert await _login(client, fresh) == 403

    # Reinstating hands it back.
    res = await client.post(f"/api/v1/gc/admin/contractors/{account.id}/reinstate", headers=headers)
    assert res.status_code == 200, res.text
    await db_session.refresh(login)
    assert login.is_active is True
    assert await _login(client, fresh) == 200


async def test_issuing_twice_on_one_email_is_refused(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """A second login on the same address would be an integrity error, not a feature."""
    company = (await db_session.execute(select(Company).limit(1))).scalar_one()
    res = await client.post(
        "/api/v1/gc/admin/contractors",
        headers=await _auth(client),
        json={"company_id": company.id, "contact_name": CONTACT, "email": EMAIL},
    )
    assert res.status_code == 400
    assert EMAIL in res.json()["detail"]
