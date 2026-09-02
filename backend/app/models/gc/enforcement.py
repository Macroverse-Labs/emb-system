"""Inductions, violations, blocks and the alert centre.

Backs the design's Inductions, Violations, Blocks and Alerts screens, plus the
dashboard's "Needs a decision" list. Labels the design renders verbatim
(`"Tomorrow 07:00"`, `"12 d ago"`, `"#B3261E"`) stay strings.
"""

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class InductionSession(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One induction sitting. Backs the session list on the Inductions screen."""

    __tablename__ = "gc_induction_sessions"

    session_ref: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    when_label: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    where_label: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    run_by: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    booked: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    state: Mapped[str] = mapped_column(String(16), nullable=False, default="open")

    attendance: Mapped[list["InductionAttendance"]] = relationship(
        back_populates="session", lazy="selectin", cascade="all, delete-orphan"
    )


class InductionAttendance(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One seat on a session. Backs the attendance sheet beside the session list."""

    __tablename__ = "gc_induction_attendance"

    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("gc_induction_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    worker_name: Mapped[str] = mapped_column(String(200), nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    status_label: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    status_colour: Mapped[str] = mapped_column(String(16), nullable=False, default="#49454F")

    session: Mapped[InductionSession] = relationship(back_populates="attendance")


class Violation(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A recorded breach. Backs the Violations screen and the three-strike ladder."""

    __tablename__ = "gc_violations"

    worker_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=True
    )
    occurred_label: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    worker_name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    description: Mapped[str] = mapped_column(String(400), nullable=False, default="")
    recorded_by: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    level: Mapped[str] = mapped_column(String(64), nullable=False, default="Verbal warning")
    colour: Mapped[str] = mapped_column(String(16), nullable=False, default="#7A5900")


class Block(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A withdrawal of access, automatic or manual. Backs the Blocks screen."""

    __tablename__ = "gc_blocks"

    worker_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=True
    )
    worker_name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="Automatic")
    reason: Mapped[str] = mapped_column(String(400), nullable=False, default="")
    when_label: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    route_back: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    colour: Mapped[str] = mapped_column(String(16), nullable=False, default="#B3261E")
    lifted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lifted_by: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    lifted_reason: Mapped[str] = mapped_column(String(400), nullable=False, default="")


class Alert(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """Something needing a decision. Backs the Alert centre and the dashboard list."""

    __tablename__ = "gc_alerts"

    kind: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(400), nullable=False, default="")
    badge: Mapped[str] = mapped_column(String(16), nullable=False, default="")
    colour: Mapped[str] = mapped_column(String(16), nullable=False, default="#7A5900")
    target_screen: Mapped[str] = mapped_column(String(32), nullable=False, default="dashboard")
    snoozed_until: Mapped[str | None] = mapped_column(String(32), nullable=True)
    resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resolved_by: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
