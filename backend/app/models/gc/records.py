"""Things the console records rather than configures: events, audit, reports, tiles.

Follows the conventions of `app.models.gc.org`: `gc_` table prefix, uuid4 string
keys, explicit `String(n)` widths, and a docstring on every model naming the design
screen it backs. Label columns keep the design's own formatting as strings.
"""

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class AccessEvent(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One turnstile or reader decision. Backs the Access log screen."""

    __tablename__ = "gc_access_events"

    occurred_label: Mapped[str] = mapped_column(String(32), nullable=False)
    person: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    company: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    device_label: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    direction: Mapped[str] = mapped_column(String(8), nullable=False, default="in")
    verdict: Mapped[str] = mapped_column(String(8), nullable=False, default="pass")
    note: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    is_visitor: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class AuditEntry(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One recorded change. Backs the System-change audit screen.

    Written only by `app.services.gc.audit.record_audit`, which every mutating
    endpoint calls; the design's `created_at` is what the screen orders by.
    """

    __tablename__ = "gc_audit_entries"

    occurred_label: Mapped[str] = mapped_column(String(64), nullable=False, default="Just now")
    who: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(64), nullable=False)
    action: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    obj: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    value_before: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    value_after: Mapped[str] = mapped_column(String(200), nullable=False, default="—")


class ReportSchedule(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A standing report and who receives it. Backs the Reports screen."""

    __tablename__ = "gc_report_schedules"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    cadence: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    formats: Mapped[str] = mapped_column(String(64), nullable=False, default="CSV")
    recipients: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    last_sent: Mapped[str] = mapped_column(String(64), nullable=False, default="—")


class ReportRun(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One delivered artifact of a schedule. Backs the Report output screen header."""

    __tablename__ = "gc_report_runs"

    schedule_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("gc_report_schedules.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    ran_at_label: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="Delivered")
    row_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class ReportRow(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One contractor line of a run. Backs the table on the Report output screen.

    The counts the design renders right-aligned as text (`attended`, `expiring`,
    `blocked`) stay strings so a run keeps exactly the figures it was delivered with.
    """

    __tablename__ = "gc_report_rows"

    run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_report_runs.id", ondelete="CASCADE"), index=True, nullable=False
    )
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    on_register: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    on_site: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    attended: Mapped[str] = mapped_column(String(16), nullable=False, default="0")
    expiring: Mapped[str] = mapped_column(String(16), nullable=False, default="0")
    blocked: Mapped[str] = mapped_column(String(16), nullable=False, default="0")
    first_in: Mapped[str] = mapped_column(String(16), nullable=False, default="—")
    last_out: Mapped[str] = mapped_column(String(16), nullable=False, default="—")


class DashboardTile(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One dashboard tile, in order. Backs the tile editor screen."""

    __tablename__ = "gc_dashboard_tiles"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hidden: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
