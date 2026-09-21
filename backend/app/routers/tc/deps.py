"""Shared dependencies for the TC (trade contractor) console API.

This module is the tenancy boundary. `get_project` on its own lets any authenticated
user read any project; `get_contractor` narrows that to one company on one project and
every TC endpoint must depend on it (directly or via `require_tc`) before it touches a
row. Nothing here trusts a query parameter for identity — the company comes from the
signed-in user's own `company_id`.
"""

from collections.abc import Awaitable, Callable
from typing import NamedTuple

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.admin import RolePermission
from app.models.gc.org import Company, Project
from app.models.user import User
from app.routers.gc.deps import get_project
from app.services.auth import get_current_active_user

TC_ROLE = "Trade contractor"


class Contractor(NamedTuple):
    """Who is asking, on behalf of which company, on which project."""

    user: User
    company: Company
    project: Project


async def get_contractor(
    user: User = Depends(get_current_active_user),
    project: Project = Depends(get_project),
    db: AsyncSession = Depends(get_db),
) -> Contractor:
    """Resolve the signed-in trade contractor's own company on the active project.

    Refuses anyone who is not a trade contractor, and anyone whose `company_id` does
    not name a company on this project. The two refusals share one message on purpose:
    a caller must not be able to tell "wrong project" from "no such company" and map
    the register that way.
    """
    if user.role != TC_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This console is for trade contractor accounts.",
        )
    company = None
    if user.company_id:
        company = await db.scalar(
            select(Company).where(
                Company.id == user.company_id,
                Company.project_id == project.id,
            )
        )
    if company is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not registered on this project.",
        )
    return Contractor(user=user, company=company, project=project)


def require_tc(capability: str) -> Callable[..., Awaitable[Contractor]]:
    """Gate a TC endpoint on the tenancy check plus one capability from the grid.

    The capability half is the same `gc_role_permissions` lookup `gc/deps.require`
    does — the Users & rights screen is the authority, so a capability the GC revokes
    for the "Trade contractor" role is genuinely refused here, not merely hidden.
    """

    async def dependency(
        contractor: Contractor = Depends(get_contractor),
        db: AsyncSession = Depends(get_db),
    ) -> Contractor:
        row = await db.scalar(
            select(RolePermission).where(
                RolePermission.role == contractor.user.role,
                RolePermission.capability == capability,
            )
        )
        if row is None or not row.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your role may not: {capability}",
            )
        return contractor

    return dependency
