"""Shared dependencies for the GC console API."""

from collections.abc import Awaitable, Callable

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gc.admin import RolePermission
from app.models.gc.org import Project
from app.models.user import User
from app.services.auth import get_current_active_user


async def get_project(
    project: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> Project:
    """Resolve the active project from `?project=<code>`, defaulting to the first."""
    stmt = select(Project).order_by(Project.code)
    if project:
        stmt = select(Project).where(Project.code == project)
    found = (await db.execute(stmt)).scalars().first()
    if found is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return found


def require(capability: str) -> Callable[..., Awaitable[User]]:
    """Gate an endpoint on a capability from the role x capability grid.

    The same `gc_role_permissions` table is what the Users & rights screen edits, so
    a permission toggled off in the UI is genuinely refused by the API — the grid is
    the authority, not a hardcoded list.
    """

    async def dependency(
        user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        row = (
            await db.execute(
                select(RolePermission).where(
                    RolePermission.role == user.role,
                    RolePermission.capability == capability,
                )
            )
        ).scalar_one_or_none()
        if row is None or not row.allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your role may not: {capability}",
            )
        return user

    return dependency
