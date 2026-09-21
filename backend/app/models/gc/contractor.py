"""Trade-contractor-owned records: hours, leavers and worker drafts.

Backs the Hours & days, Leavers and Add-a-worker screens of the TC console.
"""

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class WorkerHours(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One worker's fatigue position this cycle. Backs the Hours & days screen."""

    __tablename__ = "gc_worker_hours"

    worker_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    pct: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hours_label: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    days_label: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    warned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    flag: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    rest_day_planned: Mapped[str] = mapped_column(String(32), nullable=False, default="")


class WorkerLeaver(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A worker on their way off the project. Backs the Leavers screen."""

    __tablename__ = "gc_worker_leavers"

    worker_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    last_day: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    reason: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    card_returned: Mapped[str] = mapped_column(String(64), nullable=False, default="—")
    hours_label: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    status_label: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    meta: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class WorkerDraft(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A part-filled Add-a-worker wizard. Every step of that screen saves as a draft."""

    __tablename__ = "gc_worker_drafts"

    company_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    created_by: Mapped[str] = mapped_column(String(36), nullable=False, default="")
    step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    payload: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
