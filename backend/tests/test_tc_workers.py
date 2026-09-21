"""TC worker register and document uploads: tenancy, and the upload trust boundary.

The interesting assertions here are the negative ones. A trade contractor console is
one shared project with several companies on it, so "contractor B gets 404" is the
feature; the same goes for a 10 MB cap that is only a cap if it is enforced, and a
filename that is only safe if it never reaches the filesystem.
"""

from pathlib import Path

import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.gc.contractor import WorkerDraft
from app.models.gc.org import Company
from app.models.gc.workforce import DocumentSubmission, Worker
from app.services.gc.seed import SEED_PASSWORD, seed_gc

# Two contractors on the same project. Everything one of them owns, the other must not
# be able to see or touch.
SINAR = "l.chandran@sinar.my"
PANTAS = "k.siva@pantas.com"

PDF = b"%PDF-1.4\n%test scan\n"


@pytest_asyncio.fixture(loop_scope="session", scope="session", autouse=True)
async def seeded(db_session: AsyncSession, create_test_database: None, tmp_path_factory) -> None:
    """Load the reference dataset and keep uploads out of the repo."""
    await seed_gc(db_session)
    settings.upload_dir = str(tmp_path_factory.mktemp("uploads"))


async def _auth(client: AsyncClient, email: str) -> dict[str, str]:
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": SEED_PASSWORD})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


async def _company(db: AsyncSession, name: str) -> Company:
    return (await db.execute(select(Company).where(Company.name == name))).scalars().first()


async def _worker_of(db: AsyncSession, company_name: str) -> Worker:
    company = await _company(db, company_name)
    return (
        (await db.execute(select(Worker).where(Worker.company_id == company.id))).scalars().first()
    )


async def test_contractor_adds_a_worker_to_their_own_register(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The wizard's final submit lands a pending worker under the contractor's company."""
    res = await client.post(
        "/api/v1/tc/workers",
        headers=await _auth(client, SINAR),
        json={"name": "Test Newstarter", "job_role": "Electrician's mate"},
    )
    assert res.status_code == 201, res.text
    assert "the GC validates the documents" in res.json()["message"]

    worker = (
        await db_session.execute(select(Worker).where(Worker.name == "Test Newstarter"))
    ).scalar_one()
    sinar = await _company(db_session, "Sinar Electrical")
    assert worker.company_id == sinar.id
    assert worker.status == "pending"
    assert worker.worker_ref.startswith("EMB-")


async def test_a_draft_belongs_to_the_company_that_opened_it(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Saving and resuming is per company: the other contractor cannot see or write it."""
    mine = await _auth(client, SINAR)
    theirs = await _auth(client, PANTAS)

    created = await client.post(
        "/api/v1/tc/workers/drafts", headers=mine, json={"step": 2, "fields": {"Mobile": "+60"}}
    )
    assert created.status_code == 201, created.text
    draft_id = created.json()["id"]

    resumed = await client.get("/api/v1/tc/workers/drafts", headers=mine)
    assert draft_id in [d["id"] for d in resumed.json()]

    stolen = await client.put(
        f"/api/v1/tc/workers/drafts/{draft_id}", headers=theirs, json={"step": 5, "fields": {}}
    )
    assert stolen.status_code == 404
    assert draft_id not in [
        d["id"] for d in (await client.get("/api/v1/tc/workers/drafts", headers=theirs)).json()
    ]

    draft = await db_session.get(WorkerDraft, draft_id)
    await db_session.refresh(draft)
    assert draft.step == 2, "another company's PUT must not have touched it"


async def test_another_companys_worker_is_not_withdrawable(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """A contractor may pull their own worker's access and nobody else's."""
    theirs = await _worker_of(db_session, "Pantas Steelworks")
    res = await client.post(
        f"/api/v1/tc/workers/{theirs.id}/withdraw",
        headers=await _auth(client, SINAR),
        json={"reason": "Demobilised"},
    )
    assert res.status_code == 404, res.text
    await db_session.refresh(theirs)
    assert theirs.status != "blocked"


async def test_withdrawing_your_own_worker_says_only_the_gc_can_reinstate(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    mine = await _worker_of(db_session, "Sinar Electrical")
    res = await client.post(
        f"/api/v1/tc/workers/{mine.id}/withdraw",
        headers=await _auth(client, SINAR),
        json={"reason": "Left the trade"},
    )
    assert res.status_code == 200, res.text
    assert "only the GC can reinstate" in res.json()["message"]


async def test_export_covers_only_the_callers_own_register(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    res = await client.get("/api/v1/tc/workers/export", headers=await _auth(client, SINAR))
    assert res.status_code == 200, res.text
    assert res.headers["content-type"].startswith("text/csv")
    theirs = await _worker_of(db_session, "Pantas Steelworks")
    assert theirs.worker_ref not in res.text
    assert "Pantas Steelworks" not in res.text


async def test_upload_rejects_the_wrong_type_and_anything_over_10_mb(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The cap and the allowlist are the whole point of taking uploads at all."""
    headers = await _auth(client, SINAR)
    mine = await _worker_of(db_session, "Sinar Electrical")
    form = {"worker_id": mine.id, "doc_type": "Passport / ID"}

    wrong_type = await client.post(
        "/api/v1/tc/documents",
        headers=headers,
        data=form,
        files={"file": ("shell.sh", b"#!/bin/sh\nrm -rf /\n", "application/x-sh")},
    )
    assert wrong_type.status_code == 415, wrong_type.text

    # A PDF content type does not excuse a .sh name, and vice versa.
    lying_name = await client.post(
        "/api/v1/tc/documents",
        headers=headers,
        data=form,
        files={"file": ("shell.sh", PDF, "application/pdf")},
    )
    assert lying_name.status_code == 415, lying_name.text

    oversized = await client.post(
        "/api/v1/tc/documents",
        headers=headers,
        data=form,
        files={"file": ("huge.pdf", b"%PDF-1.4\n" + b"A" * (11 * 1024 * 1024), "application/pdf")},
    )
    assert oversized.status_code == 413, oversized.text
    # Nothing half-written survives a refused upload.
    assert not list(Path(settings.upload_dir).glob("*.pdf"))


async def test_a_traversal_filename_never_reaches_the_path(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The stored name is generated here; the client's name is display text only."""
    headers = await _auth(client, SINAR)
    mine = await _worker_of(db_session, "Sinar Electrical")
    res = await client.post(
        "/api/v1/tc/documents",
        headers=headers,
        data={"worker_id": mine.id, "doc_type": "Work visa", "doc_number": "WV-1"},
        files={"file": ("../../etc/passwd.pdf", PDF, "application/pdf")},
    )
    assert res.status_code == 201, res.text

    submission = (
        (
            await db_session.execute(
                select(DocumentSubmission)
                .where(
                    DocumentSubmission.worker_id == mine.id,
                    DocumentSubmission.doc_type == "Work visa",
                )
                .order_by(DocumentSubmission.created_at.desc())
            )
        )
        .scalars()
        .first()
    )
    assert submission.decision is None, "must land in the GC's queue undecided"
    assert "/" not in submission.file_path and ".." not in submission.file_path

    upload_dir = Path(settings.upload_dir).resolve()
    stored = (upload_dir / submission.file_path).resolve()
    assert stored.parent == upload_dir and stored.read_bytes() == PDF
    assert not (upload_dir.parent.parent / "etc" / "passwd.pdf").exists()

    served = await client.get(f"/api/v1/tc/documents/{submission.id}/file", headers=headers)
    assert served.status_code == 200 and served.content == PDF


async def test_another_companys_submission_is_invisible(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Resubmitting or reading someone else's scan is a 404, not a 403."""
    pantas = await _company(db_session, "Pantas Steelworks")
    theirs = (
        (
            await db_session.execute(
                select(DocumentSubmission).where(DocumentSubmission.company_id == pantas.id)
            )
        )
        .scalars()
        .first()
    )
    headers = await _auth(client, SINAR)

    resubmit = await client.post(
        f"/api/v1/tc/documents/{theirs.id}/resubmit",
        headers=headers,
        files={"file": ("scan.pdf", PDF, "application/pdf")},
    )
    assert resubmit.status_code == 404, resubmit.text
    assert (
        await client.get(f"/api/v1/tc/documents/{theirs.id}/file", headers=headers)
    ).status_code == 404


async def test_resubmit_keeps_the_rejection_in_the_history(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """The rejected row stays rejected — the design's HISTORY panel renders it."""
    headers = await _auth(client, SINAR)
    mine = await _worker_of(db_session, "Sinar Electrical")
    sinar = await _company(db_session, "Sinar Electrical")
    rejected = DocumentSubmission(
        project_id=mine.project_id,
        company_id=sinar.id,
        worker_id=mine.id,
        doc_type="Passport / ID",
        doc_number="A4128866",
        expiry="2031-04-12",
        decision="rejected",
        decision_reason="Illegible",
        file_path="",
    )
    db_session.add(rejected)
    await db_session.commit()

    res = await client.post(
        f"/api/v1/tc/documents/{rejected.id}/resubmit",
        headers=headers,
        files={"file": ("new-scan.pdf", PDF, "application/pdf")},
    )
    assert res.status_code == 200, res.text
    assert "re-validation is usually within one working day" in res.json()["message"]

    await db_session.refresh(rejected)
    assert rejected.decision == "rejected", "the rejection must survive as history"

    fresh = (
        (
            await db_session.execute(
                select(DocumentSubmission).where(
                    DocumentSubmission.worker_id == mine.id,
                    DocumentSubmission.doc_type == "Passport / ID",
                    DocumentSubmission.decision.is_(None),
                )
            )
        )
        .scalars()
        .all()
    )
    assert len(fresh) == 1
    # "Fields keep the last values — only the scan was wrong."
    assert fresh[0].doc_number == "A4128866" and fresh[0].expiry == "2031-04-12"


async def test_a_gc_account_is_refused_the_tc_console(client: AsyncClient) -> None:
    """`require_tc` is a role gate as well as a capability gate."""
    res = await client.post(
        "/api/v1/tc/workers",
        headers=await _auth(client, settings.gc_admin_email),
        json={"name": "Should not exist"},
    )
    assert res.status_code == 403, res.text
