"""Visitors — requests, visits, the visit record, repeat visitors and policy.

Backs the five visitor screens ported in `frontend/src/components/gc/vm/vm3.ts`:
Visitor requests, Visitors today, Visit record, Repeat & blocked visitors and
Visitor policy. Label columns stay strings so the console renders the design's
own formatting verbatim.
"""

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class VisitRequest(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A request for a visit, awaiting a host's decision.

    Backs the Visitor requests screen: `host_is_me` splits the "waiting on me as
    host" list from the "with other hosts" list.
    """

    __tablename__ = "gc_visit_requests"

    visitor_name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    visitor_kind: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    requested_by: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    purpose: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    zones_requested: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    window_label: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    age_label: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    host_is_me: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    host_name: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    decision: Mapped[str | None] = mapped_column(String(16), nullable=True)
    decision_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)


class Visit(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A granted visit. Backs Visitors today and the Visit record header."""

    __tablename__ = "gc_visits"

    request_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("gc_visit_requests.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    visitor_name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    visitor_kind: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    host: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    zones_granted: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    window_label: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    state: Mapped[str] = mapped_column(String(16), nullable=False, default="expected")
    last_event_label: Mapped[str] = mapped_column(String(64), nullable=False, default="—")
    visit_date: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    escort: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    credential: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    company: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    closed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    close_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    events: Mapped[list["VisitEvent"]] = relationship(
        back_populates="visit",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="VisitEvent.position",
    )
    facts: Mapped[list["VisitFact"]] = relationship(
        back_populates="visit",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="VisitFact.position",
    )


class VisitEvent(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One line of the Visit record timeline (`vrecEvents`)."""

    __tablename__ = "gc_visit_events"

    visit_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_visits.id", ondelete="CASCADE"), index=True, nullable=False
    )
    when_label: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    event: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    detail: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    visit: Mapped[Visit] = relationship(back_populates="events")


class VisitFact(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One key/value row of the Visit record fact list (`vrecFacts`)."""

    __tablename__ = "gc_visit_facts"

    visit_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_visits.id", ondelete="CASCADE"), index=True, nullable=False
    )
    label: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    value: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    visit: Mapped[Visit] = relationship(back_populates="facts")


class VisitorProfile(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A known visitor. Backs the Repeat & blocked visitors screen."""

    __tablename__ = "gc_visitor_profiles"

    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(64), nullable=False, default="—")
    company: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    visit_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_incident: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    status_label: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    colour: Mapped[str] = mapped_column(String(16), nullable=False, default="#49454F")
    blocked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class VisitorPolicySetting(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One visitor policy setting — a toggle (`vpToggles`) or a limit (`vpLimits`).

    `kind` says which: a "toggle" carries `enabled`, a "limit" carries
    `value_label`. One row per `policy_key`.
    """

    __tablename__ = "gc_visitor_policy"

    policy_key: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    sub_label: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="toggle")
    enabled: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    value_label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
