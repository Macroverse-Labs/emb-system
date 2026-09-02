"""Shared column conventions for the GC console tables."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column


def new_id() -> str:
    """Generate a primary key, matching the format the users table already uses."""
    return str(uuid.uuid4())


def now_utc() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(UTC)


class PkMixin:
    """A uuid4 string primary key."""

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)


class TimestampMixin:
    """Created/updated timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False
    )


class ProjectScopedMixin:
    """Almost everything in the console belongs to exactly one project."""

    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_projects.id", ondelete="CASCADE"), index=True, nullable=False
    )
