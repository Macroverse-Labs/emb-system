"""Workers, their documents and training, and the document validation queue.

Backs the Workers register, the Worker profile tabs (Overview, Documents,
Training) and the Validation queue screens of the GC console.
"""

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.gc.base import PkMixin, ProjectScopedMixin, TimestampMixin


class Worker(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One person on the worker register.

    The first block of columns is the Workers table row; the rest are the
    profile facts and credentials the Overview tab renders.
    """

    __tablename__ = "gc_workers"

    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    worker_ref: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    company_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    job_role: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    zones_permitted: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    on_site: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_event: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    nationality: Mapped[str] = mapped_column(String(64), nullable=False, default="")

    date_of_birth: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    sex: Mapped[str] = mapped_column(String(16), nullable=False, default="—")
    telephone: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    address_local: Mapped[str] = mapped_column(String(255), nullable=False, default="—")
    address_home: Mapped[str] = mapped_column(String(255), nullable=False, default="—")
    direct_employer: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    induction_date: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    next_of_kin: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    rfid_card: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    face_template: Mapped[str] = mapped_column(String(200), nullable=False, default="—")
    second_factor: Mapped[str] = mapped_column(String(200), nullable=False, default="—")

    documents: Mapped[list["WorkerDocument"]] = relationship(
        back_populates="worker", cascade="all, delete-orphan", lazy="selectin"
    )
    training: Mapped[list["TrainingRecord"]] = relationship(
        back_populates="worker", cascade="all, delete-orphan", lazy="selectin"
    )


class WorkerDocument(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One document held on a worker profile. Backs the Documents tab."""

    __tablename__ = "gc_worker_documents"

    worker_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    doc_type: Mapped[str] = mapped_column(String(120), nullable=False)
    doc_number: Mapped[str] = mapped_column(String(64), nullable=False, default="—")
    expiry: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="valid")
    provider: Mapped[str] = mapped_column(String(120), nullable=False, default="")

    worker: Mapped[Worker] = relationship(back_populates="documents")


class TrainingRecord(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One course a worker holds (or does not). Backs the Training tab."""

    __tablename__ = "gc_training_records"

    worker_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="none")
    expiry: Mapped[str] = mapped_column(String(32), nullable=False, default="—")

    worker: Mapped[Worker] = relationship(back_populates="training")


class DocumentSubmission(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """A document awaiting a GC decision. Backs the Validation queue screen."""

    __tablename__ = "gc_document_submissions"

    worker_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_workers.id", ondelete="CASCADE"), index=True, nullable=False
    )
    company_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("gc_companies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    doc_type: Mapped[str] = mapped_column(String(120), nullable=False)
    doc_number: Mapped[str] = mapped_column(String(64), nullable=False, default="—")
    expiry: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    issuer: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    submitted: Mapped[str] = mapped_column(String(32), nullable=False, default="—")
    decision: Mapped[str | None] = mapped_column(String(16), index=True, nullable=True)
    decision_reason: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    decided_by: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    decided_at: Mapped[str] = mapped_column(String(32), nullable=False, default="")

    fields: Mapped[list["SubmissionField"]] = relationship(
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="SubmissionField.position",
        lazy="selectin",
    )
    flags: Mapped[list["SubmissionFlag"]] = relationship(
        back_populates="submission",
        cascade="all, delete-orphan",
        order_by="SubmissionFlag.position",
        lazy="selectin",
    )


class SubmissionField(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One extracted key/value pair shown beside the submission's scan."""

    __tablename__ = "gc_submission_fields"

    submission_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("gc_document_submissions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    submission: Mapped[DocumentSubmission] = relationship(back_populates="fields")


class SubmissionFlag(Base, PkMixin, ProjectScopedMixin, TimestampMixin):
    """One check the validator raised on a submission."""

    __tablename__ = "gc_submission_flags"

    submission_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("gc_document_submissions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    text: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    submission: Mapped[DocumentSubmission] = relationship(back_populates="flags")
