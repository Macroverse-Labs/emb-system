"""System settings: the rights grid, reference lists and notification rules.

These configure the whole console rather than one project, so — unlike most of
`app.models.gc` — they carry no `ProjectScopedMixin`. Conventions otherwise match
`app.models.gc.org`.
"""

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.gc.base import PkMixin, TimestampMixin


class RolePermission(Base, PkMixin, TimestampMixin):
    """One cell of the role x capability grid. Backs the Users & rights screen.

    `app.routers.gc.deps.require` reads this table on every gated request, so a
    capability switched off here is genuinely refused by the API.
    """

    __tablename__ = "gc_role_permissions"
    __table_args__ = (UniqueConstraint("role", "capability", name="uq_gc_role_permission"),)

    role: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    capability: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    allowed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class ReferenceList(Base, PkMixin, TimestampMixin):
    """A controlled vocabulary — job roles, trades, document types, and so on.

    Backs the Reference data screen; `item_count` is the count the design prints
    beside each list.
    """

    __tablename__ = "gc_reference_lists"

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    item_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    values: Mapped[list["ReferenceValue"]] = relationship(
        back_populates="list", cascade="all, delete-orphan", lazy="selectin"
    )


class ReferenceValue(Base, PkMixin, TimestampMixin):
    """One entry of a reference list, in the order the list shows it."""

    __tablename__ = "gc_reference_values"

    list_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("gc_reference_lists.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    value: Mapped[str] = mapped_column(String(200), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    list: Mapped[ReferenceList] = relationship(back_populates="values")


class NotificationRule(Base, PkMixin, TimestampMixin):
    """What the system tells whom, and when. Backs the Notification rules screen."""

    __tablename__ = "gc_notification_rules"

    event: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    when_label: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    audience: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    channels: Mapped[list["NotificationChannel"]] = relationship(
        back_populates="rule", cascade="all, delete-orphan", lazy="selectin"
    )


class NotificationChannel(Base, PkMixin, TimestampMixin):
    """One Email / SMS / In-app checkbox of a rule's row."""

    __tablename__ = "gc_notification_channels"
    __table_args__ = (UniqueConstraint("rule_id", "channel", name="uq_gc_notification_channel"),)

    rule_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("gc_notification_rules.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    channel: Mapped[str] = mapped_column(String(16), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    rule: Mapped[NotificationRule] = relationship(back_populates="channels")
