"""TC document uploads — the scans that feed the GC's validation queue.

Two boundaries meet in this module. The tenancy one: every submission is loaded with
`DocumentSubmission.company_id == contractor.company.id`, and a worker is only a valid
upload target if `Worker.company_id` matches too. The upload one: the bytes arriving here
are attacker-controlled, so the type, the size and above all the *name* are treated as
claims rather than facts — the on-disk name is generated here and never derived from what
the client sent.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.gc.workforce import DocumentSubmission, SubmissionField, Worker
from app.routers.gc.bootstrap import site_now
from app.routers.tc.deps import Contractor, require_tc
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/tc", tags=["tc"])

# The design's drop zone says "PDF or JPG · max 10 MB". PNG is allowed too because
# phone screenshots of a certificate are the same thing to a validator.
ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}
ALLOWED_SUFFIXES = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_BYTES = 10 * 1024 * 1024
CHUNK = 1024 * 1024


def _checked_suffix(upload: UploadFile) -> str:
    """Agree an extension from the declared type and the claimed name, or refuse.

    Both are client-supplied, so neither is trusted on its own: the content type picks
    the extension that actually gets written, and the filename only has to not
    contradict it. `Path(...).name` strips any directory the client tried to smuggle in
    before the suffix is read — and the returned suffix is from the allowlist regardless.
    """
    suffix = ALLOWED_TYPES.get((upload.content_type or "").split(";")[0].strip().lower())
    claimed = Path(upload.filename or "").name.lower()
    if suffix is None or Path(claimed).suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="PDF or JPG only — max 10 MB",
        )
    return suffix


# ponytail: local disk, swap for S3 when this runs on more than one box
async def _store(upload: UploadFile) -> str:
    """Write the upload under `settings.upload_dir` and return its stored filename.

    The name is a fresh uuid4 plus an allowlisted extension, so a filename like
    `../../etc/passwd` cannot steer the write — the client's name never reaches the
    path at all. Only the bare filename is returned (and stored on the row), which is
    what keeps the read side in `serve_file` inside the directory as well.

    The 10 MB cap is enforced chunk by chunk as the body arrives, not on a finished
    file: checking afterwards means having already written whatever was sent.
    """
    suffix = _checked_suffix(upload)
    directory = Path(settings.upload_dir)
    directory.mkdir(parents=True, exist_ok=True)
    stored = f"{uuid.uuid4().hex}{suffix}"
    destination = directory / stored

    written = 0
    try:
        with destination.open("wb") as handle:
            while chunk := await upload.read(CHUNK):
                written += len(chunk)
                if written > MAX_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail="That file is over 10 MB — PDF or JPG, max 10 MB",
                    )
                handle.write(chunk)
        if written == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="That file is empty"
            )
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
    return stored


async def _load_worker(db: AsyncSession, tc: Contractor, worker_id: str) -> Worker:
    """Fetch one of this contractor's own workers, or 404."""
    worker = await db.scalar(
        select(Worker).where(
            Worker.id == worker_id,
            Worker.company_id == tc.company.id,
            Worker.project_id == tc.project.id,
        )
    )
    if worker is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
    return worker


async def _load_submission(
    db: AsyncSession, tc: Contractor, submission_id: str
) -> DocumentSubmission:
    """Fetch one of this contractor's own submissions, or 404."""
    submission = await db.scalar(
        select(DocumentSubmission).where(
            DocumentSubmission.id == submission_id,
            DocumentSubmission.company_id == tc.company.id,
            DocumentSubmission.project_id == tc.project.id,
        )
    )
    if submission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    return submission


def _submit(
    tc: Contractor,
    worker: Worker,
    *,
    doc_type: str,
    doc_number: str,
    expiry: str,
    stored: str,
    original_name: str,
) -> DocumentSubmission:
    """Build a submission with no decision on it, which is what puts it in the GC's queue."""
    submission = DocumentSubmission(
        project_id=tc.project.id,
        company_id=tc.company.id,
        worker_id=worker.id,
        doc_type=doc_type,
        doc_number=doc_number or "—",
        expiry=expiry or "—",
        issuer=tc.company.name,
        submitted=f"{site_now():%d %b %H:%M}",
        file_path=stored,
        decision=None,
    )
    # The validator's panel reads the fields beside the scan; the name the contractor
    # uploaded belongs there and nowhere near the filesystem.
    submission.fields.append(
        SubmissionField(
            project_id=tc.project.id,
            label="Original file",
            value=Path(original_name).name[:255] or "—",
            position=0,
        )
    )
    return submission


@router.post("/documents", response_model=ActionResult, status_code=status.HTTP_201_CREATED)
async def upload_document(
    worker_id: str = Form(...),
    doc_type: str = Form(...),
    doc_number: str = Form(""),
    expiry: str = Form(""),
    file: UploadFile = File(...),
    tc: Contractor = Depends(require_tc("Upload documents")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Upload a scan for one of your workers. It lands in the GC's validation queue."""
    worker = await _load_worker(db, tc, worker_id)
    stored = await _store(file)
    submission = _submit(
        tc,
        worker,
        doc_type=doc_type,
        doc_number=doc_number,
        expiry=expiry,
        stored=stored,
        original_name=file.filename or "",
    )
    db.add(submission)
    await record_audit(
        db,
        project_id=tc.project.id,
        actor=tc.user,
        action="Document uploaded",
        obj=f"{worker.name} · {doc_type}",
        before="None",
        after="Awaiting GC validation",
    )
    await db.commit()
    return ActionResult(
        message=f"{doc_type} uploaded for {worker.name} — the GC validates it before it counts"
    )


@router.post("/documents/{submission_id}/resubmit", response_model=ActionResult)
async def resubmit_document(
    submission_id: str,
    doc_number: str = Form(""),
    expiry: str = Form(""),
    file: UploadFile = File(...),
    tc: Contractor = Depends(require_tc("Upload documents")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Replace a rejected scan.

    A new submission is written rather than the rejected one being overwritten. The
    design's HISTORY panel renders "Rejected — illegible" above "Submitted attempt 1",
    so the rejection is a record, not a state to be edited away.
    """
    rejected = await _load_submission(db, tc, submission_id)
    if rejected.decision is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That document is already awaiting a GC decision",
        )
    worker = await _load_worker(db, tc, rejected.worker_id)
    stored = await _store(file)
    db.add(
        _submit(
            tc,
            worker,
            doc_type=rejected.doc_type,
            # "Fields keep the last values — only the scan was wrong."
            doc_number=doc_number or rejected.doc_number,
            expiry=expiry or rejected.expiry,
            stored=stored,
            original_name=file.filename or "",
        )
    )
    await record_audit(
        db,
        project_id=tc.project.id,
        actor=tc.user,
        action="Document resubmitted",
        obj=f"{worker.name} · {rejected.doc_type}",
        before=f"{rejected.decision.title()} — {rejected.decision_reason}".strip(" —"),
        after="Awaiting GC validation",
    )
    await db.commit()
    return ActionResult(
        message=(
            f"{rejected.doc_type} resubmitted for {worker.name} — "
            "re-validation is usually within one working day"
        )
    )


@router.get("/documents/{submission_id}/file")
async def serve_file(
    submission_id: str,
    tc: Contractor = Depends(require_tc("Upload documents")),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    """Serve back the stored scan for one of your own submissions."""
    submission = await _load_submission(db, tc, submission_id)
    # `file_path` holds a bare generated filename; `.name` keeps that true even for a
    # row written before this module existed, or by hand.
    stored = Path(submission.file_path or "").name
    path = Path(settings.upload_dir) / stored
    if not stored or not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No scan on file")
    return FileResponse(path, filename=stored)
