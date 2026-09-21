"""Visitor requests — an ask, not a grant.

The only visitor screen a trade contractor gets. A request is created with no
decision and no granted zones; the GC host is the one who grants, and may trim the
zones or the hours first. `RequestPayload` forbids unknown fields, so a client
cannot smuggle `decision`, `zones_granted` or a window past the ask.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.visitors import VisitRequest
from app.routers.tc.deps import Contractor, get_contractor, require_tc
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/tc/visits", tags=["tc"])


class RequestPayload(BaseModel):
    """What a contractor may ask for. Anything else is a 422, not a silent drop.

    Note what is absent: no `decision`, no `zones_granted`, no escort. `zones` and
    `window` here are the *request* — what the host is being asked for — and land in
    `zones_requested` / `window_label`, never in a grant.
    """

    model_config = ConfigDict(extra="forbid")

    visitor_name: str
    visitor_company: str = ""
    purpose: str = ""
    zones: str = ""
    window: str = ""
    host_name: str = ""


@router.get("/requests", response_model=None)
async def list_requests(
    contractor: Contractor = Depends(get_contractor),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """This company's own requests and what the GC did with them.

    Not the project's visitor register — "YOU SEE YOUR OWN REQUESTS AND THEIR
    DECISIONS". `VisitRequest` has no company column, so `requested_by` (written as
    the company name on every request this router creates) is the tenancy filter.
    """
    rows = (
        (
            await db.execute(
                select(VisitRequest)
                .where(
                    VisitRequest.project_id == contractor.project.id,
                    VisitRequest.requested_by == contractor.company.name,
                )
                .order_by(VisitRequest.created_at.desc())
            )
        )
        .scalars()
        .all()
    )
    return [
        {
            "id": r.id,
            "visitor": r.visitor_name,
            "company": r.visitor_kind,
            "purpose": r.purpose,
            "askedFor": f"{r.zones_requested} · {r.window_label}".strip(" ·"),
            "host": r.host_name,
            "outcome": r.decision or "Waiting on the host",
            "note": r.decision_reason or "",
            "age": r.age_label,
        }
        for r in rows
    ]


@router.post("/requests", response_model=ActionResult)
async def raise_request(
    payload: RequestPayload,
    contractor: Contractor = Depends(require_tc("Request visits")),
    db: AsyncSession = Depends(get_db),
) -> ActionResult:
    """Ask a GC host for a visit. Only the GC can grant one."""
    visitor_name = payload.visitor_name.strip()
    if not visitor_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="The visitor needs a name"
        )
    host = payload.host_name.strip() or "the GC host on duty"

    db.add(
        VisitRequest(
            project_id=contractor.project.id,
            visitor_name=visitor_name,
            # The model has no column for the visitor's employer; `visitor_kind` is
            # the free-text line the request list prints under the name.
            visitor_kind=payload.visitor_company.strip(),
            # The tenancy key for the GET above — keep it exactly the company name.
            requested_by=contractor.company.name,
            purpose=payload.purpose.strip(),
            zones_requested=payload.zones.strip(),
            window_label=payload.window.strip(),
            age_label="Just now",
            host_is_me=False,
            host_name=host,
            # Explicit, not merely defaulted: a contractor never decides their own ask.
            decision=None,
            decision_reason=None,
        )
    )
    await record_audit(
        db,
        project_id=contractor.project.id,
        actor=contractor.user,
        action="Visit requested",
        obj=f"{visitor_name} · {contractor.company.name}",
        before="—",
        after=f"Asked {host} for {payload.zones.strip() or 'no zones named'} · {payload.window}",
    )
    await db.commit()
    return ActionResult(
        message=f"Request sent to {host} — they may cut the zones or the hours before approving"
    )
