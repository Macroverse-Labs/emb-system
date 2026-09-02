"""Document validation queue — approve or reject with a reason."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.org import Company, Project
from app.models.gc.workforce import DocumentSubmission, Worker
from app.models.user import User
from app.routers.gc.bootstrap import site_now
from app.routers.gc.deps import get_project, require
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/gc/validation", tags=["gc"])


class RejectPayload(BaseModel):
    """The reason a document was refused. The contractor is told exactly this."""

    reason: str


async def _load(db: AsyncSession, project_id: str, submission_id: str) -> DocumentSubmission:
    sub = (
        await db.execute(
            select(DocumentSubmission).where(
                DocumentSubmission.id == submission_id,
                DocumentSubmission.project_id == project_id,
            )
        )
    ).scalar_one_or_none()
    if sub is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if sub.decision is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Already {sub.decision} by {sub.decided_by}",
        )
    return sub


async def _names(db: AsyncSession, sub: DocumentSubmission) -> tuple[str, str]:
    worker = await db.get(Worker, sub.worker_id)
    company = await db.get(Company, sub.company_id)
    return (worker.name if worker else ""), (company.name if company else "")


@router.post("/{submission_id}/approve", response_model=ActionResult)
async def approve(
    submission_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Validate documents")),
) -> ActionResult:
    """Approve a document, clearing the worker to book an induction."""
    sub = await _load(db, project.id, submission_id)
    worker_name, _ = await _names(db, sub)

    sub.decision = "approved"
    sub.decided_by = user.full_name or user.email
    sub.decided_at = f"{site_now():%d %b %Y %H:%M}"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Document approved",
        obj=f"{worker_name} · {sub.doc_type}",
        before="Pending",
        after="Approved",
    )
    await db.commit()
    return ActionResult(
        message=f"{sub.doc_type} approved — {worker_name} cleared to book an induction"
    )


@router.post("/{submission_id}/reject", response_model=ActionResult)
async def reject(
    submission_id: str,
    payload: RejectPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Validate documents")),
) -> ActionResult:
    """Reject a document. The contractor is notified with the reason."""
    sub = await _load(db, project.id, submission_id)
    worker_name, company_name = await _names(db, sub)

    sub.decision = "rejected"
    sub.decision_reason = payload.reason
    sub.decided_by = user.full_name or user.email
    sub.decided_at = f"{site_now():%d %b %Y %H:%M}"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Document rejected",
        obj=f"{worker_name} · {sub.doc_type}",
        before="Pending",
        after=f"Rejected — {payload.reason}",
    )
    await db.commit()
    return ActionResult(
        message=f"{sub.doc_type} rejected — {company_name} notified with the reason"
    )
