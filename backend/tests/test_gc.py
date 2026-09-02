"""GC console API: the seed, the aggregate read, a decision, and the permission grid."""

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gc.org import Project
from app.models.gc.records import AuditEntry
from app.models.gc.workforce import DocumentSubmission
from app.services.gc.seed import GC_ADMIN_EMAIL, SEED_PASSWORD, seed_gc

ADMIN = GC_ADMIN_EMAIL
GC_USER = "jmenon@emeraldbuilders.com"


@pytest_asyncio.fixture(loop_scope="session", scope="session", autouse=True)
async def seeded(db_session: AsyncSession, create_test_database: None) -> None:
    """Load the reference dataset once for the whole module."""
    await seed_gc(db_session)


async def _token(client: AsyncClient, email: str) -> str:
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": SEED_PASSWORD})
    assert res.status_code == 200, res.text
    return str(res.json()["access_token"])


async def _auth(client: AsyncClient, email: str = ADMIN) -> dict[str, str]:
    return {"Authorization": f"Bearer {await _token(client, email)}"}


async def test_seed_is_idempotent(db_session: AsyncSession) -> None:
    """Running the seed twice must not duplicate the dataset."""
    before = await db_session.scalar(select(func.count()).select_from(Project))
    assert await seed_gc(db_session) is False
    after = await db_session.scalar(select(func.count()).select_from(Project))
    assert before == after


async def test_bootstrap_returns_every_collection(client: AsyncClient) -> None:
    """The console renders 30 screens off this one payload; none may come back empty."""
    res = await client.get("/api/v1/gc/bootstrap", headers=await _auth(client))
    assert res.status_code == 200, res.text
    payload = res.json()

    expected = [
        "projects",
        "workers",
        "companies",
        "alerts",
        "zones",
        "requirements",
        "matrixZones",
        "devices",
        "sessions",
        "violations",
        "blocks",
        "visitRequests",
        "visitorsToday",
        "log",
        "audit",
        "users",
        "capabilities",
        "roles",
        "tcAccounts",
        "refData",
        "notifications",
        "tiles",
        "submissions",
    ]
    empty = [k for k in expected if not payload.get(k)]
    assert not empty, f"empty collections: {empty}"

    # The worker tuple is positional and the client indexes it, so its shape is a
    # contract: nine design fields, then the row id the mutation endpoints need.
    worker = payload["workers"][0]
    assert len(worker) == 10
    assert worker[6] in (0, 1)
    assert len(worker[9]) == 36
    # Same for the other tuples whose screens fire a mutation.
    assert len(payload["devices"][0]) == 10
    assert len(payload["zones"][0]) == 7
    assert len(payload["blocks"][0]) == 8
    assert len(payload["visitRequests"][0]) == 9
    assert payload["meta"]["role"] == "GC administrator"


async def test_bootstrap_requires_a_token(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/gc/bootstrap")).status_code == 401


async def test_approving_a_document_writes_exactly_one_audit_row(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Every mutation is recorded against the account that made it."""
    headers = await _auth(client)
    pending = (
        await db_session.execute(
            select(DocumentSubmission).where(DocumentSubmission.decision.is_(None)).limit(1)
        )
    ).scalar_one()
    submission_id = pending.id

    before = await db_session.scalar(select(func.count()).select_from(AuditEntry))
    res = await client.post(f"/api/v1/gc/validation/{submission_id}/approve", headers=headers)
    assert res.status_code == 200, res.text
    assert "cleared to book an induction" in res.json()["message"]

    after = await db_session.scalar(select(func.count()).select_from(AuditEntry))
    assert after == (before or 0) + 1

    entry = (
        await db_session.execute(select(AuditEntry).order_by(AuditEntry.created_at.desc()).limit(1))
    ).scalar_one()
    assert entry.action == "Document approved"
    assert entry.who == "A. Whitmore"
    assert entry.value_after == "Approved"

    # A second decision on the same document is refused rather than silently redone.
    again = await client.post(f"/api/v1/gc/validation/{submission_id}/approve", headers=headers)
    assert again.status_code == 409


async def test_rejecting_requires_a_reason(client: AsyncClient, db_session: AsyncSession) -> None:
    """The contractor is told why, so the reason is not optional."""
    headers = await _auth(client)
    pending = (
        await db_session.execute(
            select(DocumentSubmission).where(DocumentSubmission.decision.is_(None)).limit(1)
        )
    ).scalar_one()
    res = await client.post(f"/api/v1/gc/validation/{pending.id}/reject", headers=headers, json={})
    assert res.status_code == 422


@pytest.mark.parametrize(
    ("email", "expected"),
    [(ADMIN, 200), (GC_USER, 403)],
)
async def test_capability_grid_gates_the_api(
    client: AsyncClient, email: str, expected: int
) -> None:
    """A GC user may not change access rules; the grid the UI edits is the authority."""
    res = await client.put(
        "/api/v1/gc/rules/matrix",
        headers=await _auth(client, email),
        json={"cells": {"A2 Podium|Hot works": "req"}},
    )
    assert res.status_code == expected, res.text
