"""System settings: rights grid, invitations, contractor logins, reference data, tiles.

The rights grid, reference lists and notification rules are global — they configure the
whole console, not one project — so nothing here filters them by project. The project is
still resolved, because every audit row is written against one.
"""

import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.admin import (
    NotificationChannel,
    NotificationRule,
    ReferenceList,
    ReferenceValue,
    RolePermission,
)
from app.models.gc.org import Company, ContractorAccount, Project
from app.models.gc.records import DashboardTile
from app.models.user import User
from app.routers.gc.deps import get_project, require
from app.schemas.gc.common import ActionResult
from app.services.auth import get_password_hash
from app.services.gc.audit import record_audit

router = APIRouter(prefix="/gc/admin", tags=["gc"])

ADMIN_ROLE = "GC administrator"
SETTINGS_CAP = "Change system settings"


class GridPayload(BaseModel):
    """A grid of checkboxes, keyed `"<row>|<column>"` exactly as the console keys them."""

    cells: dict[str, bool]


class InvitePayload(BaseModel):
    """Someone being given a console account. They choose their own password."""

    email: str
    full_name: str
    role: str


class ContractorPayload(BaseModel):
    """The one contact at a trade contractor who gets the login."""

    company_id: str
    contact_name: str
    email: str


class ValuesPayload(BaseModel):
    """The full new contents of a reference list, in the order it should show them."""

    values: list[str]


class TilesPayload(BaseModel):
    """The dashboard's tile names top to bottom, plus which of them are hidden."""

    order: list[str]
    hidden: list[str]


def _clip(text: str) -> str:
    """Trim an audit value to the column width."""
    return text[:200]


def _split(key: str) -> tuple[str, str]:
    """Split a `"<row>|<column>"` grid key, rejecting anything else."""
    row, sep, column = key.partition("|")
    if not sep or not row or not column:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Malformed cell key: {key}"
        )
    return row, column


async def _load_account(db: AsyncSession, project_id: str, account_id: str) -> ContractorAccount:
    account = (
        await db.execute(
            select(ContractorAccount).where(
                ContractorAccount.id == account_id,
                ContractorAccount.project_id == project_id,
            )
        )
    ).scalar_one_or_none()
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account


async def _company_name(db: AsyncSession, account: ContractorAccount) -> str:
    company = await db.get(Company, account.company_id)
    return company.name if company else ""


async def _act(
    db: AsyncSession,
    *,
    project: Project,
    user: User,
    account: ContractorAccount,
    blocked_prefix: str,
    new_status: str,
    action: str,
    outcome: str,
) -> ActionResult:
    """Move a contractor login to a new status, refusing a no-op, and audit it."""
    if account.status.startswith(blocked_prefix):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Already {account.status}"
        )
    company_name = await _company_name(db, account)
    before = account.status
    account.status = new_status
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action=action,
        obj=f"{company_name} · {account.email}",
        before=before,
        after=new_status,
    )
    await db.commit()
    return ActionResult(message=f"{company_name} — account {outcome}")


@router.put("/permissions", response_model=ActionResult)
async def save_permissions(
    payload: GridPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require(SETTINGS_CAP)),
) -> ActionResult:
    """Save the role x capability grid. Rights are set by role, never per user."""
    if payload.cells.get(f"{SETTINGS_CAP}|{ADMIN_ROLE}") is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{ADMIN_ROLE} must keep '{SETTINGS_CAP}' — nobody could grant it back",
        )

    rows = {(r.capability, r.role): r for r in (await db.execute(select(RolePermission))).scalars()}
    for key, allowed in payload.cells.items():
        capability, role = _split(key)
        row = rows.get((capability, role))
        was = row.allowed if row is not None else False
        if row is None:
            db.add(RolePermission(role=role, capability=capability, allowed=allowed))
        elif was != allowed:
            row.allowed = allowed
        else:
            continue
        await record_audit(
            db,
            project_id=project.id,
            actor=user,
            action="Permission changed",
            obj=f"{role} · {capability}",
            before="Allowed" if was else "Not allowed",
            after="Allowed" if allowed else "Not allowed",
        )
    await db.commit()
    return ActionResult(
        message="Permissions saved — affected users see the change at their next sign-in"
    )


@router.post("/users/invite", response_model=ActionResult)
async def invite_user(
    payload: InvitePayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require(SETTINGS_CAP)),
) -> ActionResult:
    """Invite someone to the console. The account is inert until they set a password."""
    existing = (
        await db.execute(select(User).where(User.email == payload.email))
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"{payload.email} already has an account"
        )

    db.add(
        User(
            email=payload.email,
            full_name=payload.full_name,
            role=payload.role,
            is_active=False,
            # No one holds this secret, so no password matches until they set one.
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
        )
    )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="User invited",
        obj=f"{payload.full_name} · {payload.email}",
        after=f"Invited as {payload.role}",
    )
    await db.commit()
    return ActionResult(message="Invitation sent — the account is inert until they set a password")


@router.post("/contractors", response_model=ActionResult)
async def issue_contractor_login(
    payload: ContractorPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Issue TC logins")),
) -> ActionResult:
    """Issue a trade contractor a login. They can add workers but not validate them."""
    company = (
        await db.execute(
            select(Company).where(
                Company.id == payload.company_id, Company.project_id == project.id
            )
        )
    ).scalar_one_or_none()
    if company is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    db.add(
        ContractorAccount(
            project_id=project.id,
            company_id=company.id,
            contact_name=payload.contact_name,
            email=payload.email,
            status="Invited — not yet accepted",
        )
    )
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Contractor login issued",
        obj=f"{company.name} · {payload.email}",
        after="Invited — not yet accepted",
    )
    await db.commit()
    return ActionResult(
        message="Login issued — the contractor can add workers but cannot validate them"
    )


@router.post("/contractors/{account_id}/suspend", response_model=ActionResult)
async def suspend_contractor(
    account_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Issue TC logins")),
) -> ActionResult:
    """Suspend a contractor login. Its workers stay on the register."""
    account = await _load_account(db, project.id, account_id)
    return await _act(
        db,
        project=project,
        user=user,
        account=account,
        blocked_prefix="Suspended",
        new_status="Suspended",
        action="Contractor login suspended",
        outcome="suspended — its workers stay on the register",
    )


@router.post("/contractors/{account_id}/unlock", response_model=ActionResult)
async def unlock_contractor(
    account_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Issue TC logins")),
) -> ActionResult:
    """Unlock a login locked out by failed sign-ins, and send a password reset."""
    account = await _load_account(db, project.id, account_id)
    if not account.status.startswith("Locked"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Not locked — {account.status}"
        )
    return await _act(
        db,
        project=project,
        user=user,
        account=account,
        blocked_prefix="Active",
        new_status="Active",
        action="Contractor login unlocked",
        outcome="unlocked, password reset sent",
    )


@router.post("/contractors/{account_id}/resend", response_model=ActionResult)
async def resend_contractor_invitation(
    account_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Issue TC logins")),
) -> ActionResult:
    """Re-send an invitation that has not been accepted yet."""
    account = await _load_account(db, project.id, account_id)
    if not account.status.startswith("Invited"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Already accepted — {account.status}"
        )
    company_name = await _company_name(db, account)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Contractor invitation re-sent",
        obj=f"{company_name} · {account.email}",
        before=account.status,
        after=account.status,
    )
    await db.commit()
    return ActionResult(message=f"{company_name} — account invitation re-sent")


@router.post("/contractors/{account_id}/reinstate", response_model=ActionResult)
async def reinstate_contractor(
    account_id: str,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require("Issue TC logins")),
) -> ActionResult:
    """Reinstate a suspended contractor login."""
    account = await _load_account(db, project.id, account_id)
    if not account.status.startswith("Suspended"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Not suspended — {account.status}"
        )
    return await _act(
        db,
        project=project,
        user=user,
        account=account,
        blocked_prefix="Active",
        new_status="Active",
        action="Contractor login reinstated",
        outcome="reinstated",
    )


@router.put("/refdata/{list_id}", response_model=ActionResult)
async def save_reference_list(
    list_id: str,
    payload: ValuesPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require(SETTINGS_CAP)),
) -> ActionResult:
    """Replace a reference list. Reference lists are global, not per project."""
    ref = await db.get(ReferenceList, list_id)
    if ref is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

    before = ref.description
    ref.values = [ReferenceValue(value=value, position=i) for i, value in enumerate(payload.values)]
    ref.description = ", ".join(payload.values)[:500]
    ref.item_count = len(payload.values)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Reference list edited",
        obj=ref.name,
        before=_clip(before),
        after=_clip(ref.description),
    )
    await db.commit()
    return ActionResult(
        message=(
            f"{ref.name} — editing a list changes what the worker form offers "
            "from now on, not retrospectively"
        )
    )


@router.put("/notifications", response_model=ActionResult)
async def save_notifications(
    payload: GridPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require(SETTINGS_CAP)),
) -> ActionResult:
    """Save the event x channel matrix. Notification rules are global, not per project."""
    rules = {r.event: r for r in (await db.execute(select(NotificationRule))).scalars()}
    channels = {
        (c.rule_id, c.channel): c for c in (await db.execute(select(NotificationChannel))).scalars()
    }
    for key, enabled in payload.cells.items():
        event, channel = _split(key)
        rule = rules.get(event)
        if rule is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No rule: {event}")
        row = channels.get((rule.id, channel))
        if row is None:
            db.add(NotificationChannel(rule_id=rule.id, channel=channel, enabled=enabled))
        elif row.enabled != enabled:
            row.enabled = enabled
        else:
            continue
        await record_audit(
            db,
            project_id=project.id,
            actor=user,
            action="Notification rule changed",
            obj=f"{event} · {channel}",
            before="Off" if enabled else "On",
            after="On" if enabled else "Off",
        )
    await db.commit()
    return ActionResult(message="Notification matrix saved")


@router.put("/dashboard/tiles", response_model=ActionResult)
async def save_dashboard_tiles(
    payload: TilesPayload,
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require(SETTINGS_CAP)),
) -> ActionResult:
    """Reorder and hide dashboard tiles. The reception board follows the same order."""
    tiles = {
        t.name: t
        for t in (
            await db.execute(select(DashboardTile).where(DashboardTile.project_id == project.id))
        ).scalars()
    }
    unknown = sorted((set(payload.order) | set(payload.hidden)) - tiles.keys())
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"No such tile: {', '.join(unknown)}"
        )

    before = ", ".join(
        t.name for t in sorted(tiles.values(), key=lambda t: t.position) if not t.hidden
    )
    hidden = set(payload.hidden)
    for i, name in enumerate(payload.order):
        tiles[name].position = i
        tiles[name].hidden = name in hidden
    after = ", ".join(name for name in payload.order if name not in hidden)
    await record_audit(
        db,
        project_id=project.id,
        actor=user,
        action="Dashboard layout saved",
        obj=project.name,
        before=_clip(before),
        after=_clip(after),
    )
    await db.commit()
    return ActionResult(message="Layout saved — the reception board follows the same order")
