"""Zones, access rules, plan layers and devices — what a card is allowed to open.

Backs the zone builder, the zone plan layer, the Access rules matrix and the
Devices screen (`frontend/src/components/gc/vm/vm2.ts`).
"""

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class Zone(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One node of the zone tree. Backs the zone builder's left-hand tree and panel."""

    __tablename__ = "gc_zones"

    parent_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("gc_zones.id", ondelete="CASCADE"), index=True, nullable=True
    )
    zone_ref: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[str] = mapped_column(String(64), nullable=False, default="Sub zone")
    depth: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    population: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    factor: Mapped[str] = mapped_column(String(8), nullable=False, default="1FA")
    capacity: Mapped[str] = mapped_column(String(16), nullable=False, default="—")
    escort_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    children: Mapped[list["Zone"]] = relationship(
        back_populates="parent", lazy="selectin", cascade="all, delete-orphan"
    )
    parent: Mapped["Zone | None"] = relationship(back_populates="children", remote_side="Zone.id")
    criteria: Mapped[list["ZoneCriterion"]] = relationship(
        back_populates="zone", lazy="selectin", cascade="all, delete-orphan"
    )


class ZoneRequirement(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One cell of the Access rules zone x requirement matrix.

    Keyed by the display names the matrix renders (`MZONES` x `REQS`); `zone_id`
    links the cell to a built zone where the two line up.
    """

    __tablename__ = "gc_zone_requirements"
    __table_args__ = (
        UniqueConstraint("project_id", "zone_name", "requirement", name="uq_gc_zone_req"),
    )

    zone_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("gc_zones.id", ondelete="CASCADE"), index=True, nullable=True
    )
    zone_name: Mapped[str] = mapped_column(String(200), nullable=False)
    requirement: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[str] = mapped_column(String(8), nullable=False, default="na")


class ZoneCriterion(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One document a zone demands, ticked in the zone builder's criteria list."""

    __tablename__ = "gc_zone_criteria"

    zone_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_zones.id", ondelete="CASCADE"), index=True, nullable=False
    )
    requirement: Mapped[str] = mapped_column(String(200), nullable=False)

    zone: Mapped["Zone"] = relationship(back_populates="criteria")


class PlanShape(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A rectangle drawn on a level's plan. Coordinates are percentages of the drawing."""

    __tablename__ = "gc_plan_shapes"

    level: Mapped[str] = mapped_column(String(16), index=True, nullable=False, default="L1")
    x: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    y: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    w: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    h: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    colour: Mapped[str] = mapped_column(String(32), nullable=False, default="#6750A4")
    zone_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("gc_zones.id", ondelete="CASCADE"), index=True, nullable=True
    )


class Device(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A turnstile, reader, barrier or tablet. Backs the Devices screen."""

    __tablename__ = "gc_devices"

    device_ref: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(64), nullable=False, default="Turnstile")
    location: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    zone_label: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="online")
    link: Mapped[str] = mapped_column(String(64), nullable=False, default="Hard-wired")
    buffered_events: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_sync: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    factor: Mapped[str] = mapped_column(String(8), nullable=False, default="1FA")


class AccessThreshold(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One auto-block threshold listed down the Access rules screen."""

    __tablename__ = "gc_access_thresholds"

    key_label: Mapped[str] = mapped_column(String(200), nullable=False)
    value_label: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    sub_label: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
