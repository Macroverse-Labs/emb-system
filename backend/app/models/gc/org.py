"""Projects and companies — the organisational spine of the GC console.

Reference module for the rest of `app.models.gc`: uuid4 string keys, `gc_` table
prefix, `PkMixin`/`TimestampMixin`/`ProjectScopedMixin`, explicit `String(n)` widths,
and a docstring on every model saying what the design screen uses it for.
"""

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class Project(Base, PkMixin, TimestampMixin):
    """One construction project. The sidebar's project switcher lists these."""

    __tablename__ = "gc_projects"

    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    badge: Mapped[str] = mapped_column(String(8), nullable=False)
    meta: Mapped[str] = mapped_column(String(200), nullable=False, default="")


class Company(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A contractor, agency or the GC itself.

    Backs the Company profiles screen; its defaults pre-fill every worker the
    contractor adds.
    """

    __tablename__ = "gc_companies"

    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    trade: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    kind: Mapped[str] = mapped_column(String(64), nullable=False, default="Trade contractor")
    contact: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    insurance_expiry: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    flag: Mapped[str] = mapped_column(String(64), nullable=False, default="ok")
    on_register: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    on_site: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    contract_ref: Mapped[str] = mapped_column(String(64), nullable=False, default="")


class ContractorAccount(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A trade contractor login. Backs the Contractor accounts screen."""

    __tablename__ = "gc_contractor_accounts"

    company_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    contact_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="Active")
    last_seen: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    user_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
