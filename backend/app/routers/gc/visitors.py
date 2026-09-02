"""Visitors — grant or decline a request, run today's visits, and set the policy.

Two routers because the paths sit under two prefixes: `router` (`/gc/visits`) carries
the requests and the visits themselves, `visitors_router` (`/gc/visitors`) carries the
repeat-visitor and policy actions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.org import Project
from app.models.gc.visitors import Visit, VisitorPolicySetting, VisitorProfile, VisitRequest
from app.models.user import User
from app.routers.gc.bootstrap import site_now
from app.routers.gc.deps import get_project, require
from app.schemas.gc.common import ActionResult
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/gc/visits", tags=["gc"])
visitors_router = APIRouter(prefix="/gc/visitors", tags=["gc"])


class GrantPayload(BaseModel):
    """The zones and window the host actually grants — both usually trimmed."""

    zones: str
    window: str


class DeclinePayload(BaseModel):
    """The reason a request was refused. The requester is told exactly this."""

    reason: str


class RaisePayload(BaseModel):
    """A visit raised directly by a host, without a request to approve."""

    visitor_name: str
    visitor_kind: str = ""
    host: str = ""
    zones_granted: str = ""
    window_label: str = ""
    escort: str = "—"


class ClosePayload(BaseModel):
    """The reason a visit was closed by hand rather than by the pass expiring."""

    reason: str


class PolicyPayload(BaseModel):
    """The visitor policy screen's toggles and limits, keyed by `policy_key`."""

    toggles: dict[str, bool] = {}
    limits: dict[str, str] = {}


async def _load_request(db: AsyncSession, project_id: str, request_id: str) -> VisitRequest:
    req = (
        await db.execute(
            select(VisitRequest).where(
                VisitRequest.id == request_id,
                VisitRequest.project_id == project_id,
            )
        )
    ).scalar_one_or_none()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if req.decision is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Already {req.decision}")
    return req


async def _load_visit(db: AsyncSession, project_id: str, visit_id: str) -> Visit:
    visit = (
        await db.execute(select(Visit).where(Visit.id == visit_id, Visit.project_id == project_id))
    ).scalar_one_or_none()
    if visit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found")
    return visit


@router.post("/requests/{request_id}/grant", response_model=ActionResult)
async def grant(
    request_id: str,
    payload: GrantPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Grant visitor passes")),
) -> ActionResult:
    """Grant a visit request, on the zones and window the host is willing to allow."""
    req = await _load_request(db, project.id, request_id)
    zones = payload.zones.strip()
    window = payload.window.strip()
    now = site_now()

    req.decision = "granted"
    db.add(
        Visit(
            project_id=project.id,
            request_id=req.id,
            visitor_name=req.visitor_name,
            visitor_kind=req.visitor_kind,
            host=user.full_name or user.email,
            zones_granted=zones,
            window_label=window,
            state="expected",
            visit_date=f"{now:%d %b %Y}",
        )
    )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visitor pass granted",
        obj=f"{req.visitor_name} · {req.purpose}",
        before=f"Requested {req.zones_requested} · {req.window_label}",
        after=f"Granted {zones} · {window}",
    )
    await db.commit()
    return ActionResult(
        message="Pass granted — QR texted to the visitor, escort and Gate A notified"
    )


@router.post("/requests/{request_id}/decline", response_model=ActionResult)
async def decline(
    request_id: str,
    payload: DeclinePayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Grant visitor passes")),
) -> ActionResult:
    """Decline a visit request. The requester is notified with the reason."""
    req = await _load_request(db, project.id, request_id)

    req.decision = "declined"
    req.decision_reason = payload.reason
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visitor request declined",
        obj=f"{req.visitor_name} · {req.purpose}",
        before="Pending",
        after=f"Declined — {payload.reason}",
    )
    await db.commit()
    return ActionResult(message=f"Request declined — {req.requested_by} notified with your reason")


@router.post("/", response_model=ActionResult)
async def raise_visit(
    payload: RaisePayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Grant visitor passes")),
) -> ActionResult:
    """Raise a visit directly, without a request to approve first."""
    now = site_now()
    visit = Visit(
        project_id=project.id,
        visitor_name=payload.visitor_name,
        visitor_kind=payload.visitor_kind,
        host=payload.host or (user.full_name or user.email),
        zones_granted=payload.zones_granted,
        window_label=payload.window_label,
        escort=payload.escort,
        state="expected",
        visit_date=f"{now:%d %b %Y}",
    )
    db.add(visit)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visit created",
        obj=f"{payload.visitor_name} · {payload.visitor_kind}",
        after=f"{payload.zones_granted} · {payload.window_label}",
    )
    await db.commit()
    return ActionResult(message="Visit created — QR pass sent, expires at the end of the window")


@router.post("/{visit_id}/badge-out", response_model=ActionResult)
async def badge_out(
    visit_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Grant visitor passes")),
) -> ActionResult:
    """Sign a visitor out and close their pass."""
    visit = await _load_visit(db, project.id, visit_id)
    if visit.state == "left":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already signed out")
    clock = f"{site_now():%H:%M}"

    before = visit.state
    visit.state = "left"
    visit.last_event_label = f"out {clock}"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visitor badged out",
        obj=f"{visit.visitor_name} · {visit.zones_granted}",
        before=before,
        after=f"left {clock}",
    )
    await db.commit()
    return ActionResult(message=f"{visit.visitor_name} signed out — pass closed at {clock}")


@router.post("/{visit_id}/resend", response_model=ActionResult)
async def resend(
    visit_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Grant visitor passes")),
) -> ActionResult:
    """Re-send the QR pass by SMS to a visitor who has not arrived yet."""
    visit = await _load_visit(db, project.id, visit_id)
    if visit.state != "expected":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Visit is {visit.state} — the pass is no longer pending",
        )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visitor pass re-sent",
        obj=f"{visit.visitor_name} · {visit.window_label}",
        after="QR pass re-sent by SMS",
    )
    await db.commit()
    return ActionResult(message=f"QR pass re-sent by SMS to {visit.visitor_name}")


@router.post("/{visit_id}/close", response_model=ActionResult)
async def close(
    visit_id: str,
    payload: ClosePayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Grant visitor passes")),
) -> ActionResult:
    """Close a visit by hand, recording why."""
    visit = await _load_visit(db, project.id, visit_id)
    if visit.closed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Visit already closed")

    visit.closed = True
    visit.close_reason = payload.reason
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visit closed manually",
        obj=f"{visit.visitor_name} · {visit.visit_date}",
        before="Open",
        after=f"Closed — {payload.reason}",
    )
    await db.commit()
    return ActionResult(message="Visit closed manually — reason recorded against your account")


@visitors_router.post("/{profile_id}/lift", response_model=ActionResult)
async def lift_block(
    profile_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Block & reinstate")),
) -> ActionResult:
    """Lift a block on a repeat visitor, letting them be granted a visit again."""
    profile = (
        await db.execute(
            select(VisitorProfile).where(
                VisitorProfile.id == profile_id,
                VisitorProfile.project_id == project.id,
            )
        )
    ).scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visitor not found")
    if not profile.blocked:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Visitor is not blocked")

    before = profile.status_label
    profile.blocked = False
    profile.status_label = "Block lifted"
    profile.colour = "#49454F"
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visitor block lifted",
        obj=f"{profile.name} · {profile.company}",
        before=before,
        after="Block lifted",
    )
    await db.commit()
    return ActionResult(message=f"{profile.name} — block lifted, reason recorded")


@visitors_router.put("/policy", response_model=ActionResult)
async def save_policy(
    payload: PolicyPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Change system settings")),
) -> ActionResult:
    """Save the visitor policy — the toggles and limits that govern every grant."""
    keys = set(payload.toggles) | set(payload.limits)
    rows = (
        (
            await db.execute(
                select(VisitorPolicySetting).where(
                    VisitorPolicySetting.project_id == project.id,
                    VisitorPolicySetting.policy_key.in_(keys),
                )
            )
        )
        .scalars()
        .all()
    )
    found = {row.policy_key: row for row in rows}
    missing = sorted(keys - found.keys())
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown policy settings: {', '.join(missing)}",
        )

    changed: list[str] = []
    for key, enabled in payload.toggles.items():
        row = found[key]
        if row.enabled != enabled:
            changed.append(f"{row.label}: {'on' if enabled else 'off'}")
        row.enabled = enabled
    for key, value in payload.limits.items():
        row = found[key]
        if row.value_label != value:
            changed.append(f"{row.label}: {value}")
        row.value_label = value

    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Visitor policy changed",
        obj="Visitor policy",
        after="; ".join(changed) if changed else "No change",
    )
    await db.commit()
    return ActionResult(
        message="Visitor policy saved — it governs requests, grants and the guard tablet"
    )
