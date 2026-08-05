import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class JobStatus(str, enum.Enum):
    SOURCED = "SOURCED"
    TAILORING = "TAILORING"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    APPROVED = "APPROVED"
    APPLIED = "APPLIED"
    EMAILED = "EMAILED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class Job(Base):
    """One row = one job posting + its application state (what the kanban renders)."""

    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    company: Mapped[str] = mapped_column(String)
    role_title: Mapped[str] = mapped_column(String)
    url: Mapped[str | None] = mapped_column(String, nullable=True)
    jd_text: Mapped[str] = mapped_column(Text)

    # Free text, not a narrow DB enum, so Phase 2 values ('csv_bulk', 'ats_api')
    # are just new strings — no migration needed.
    jd_source_type: Mapped[str] = mapped_column(String, default="paste_text")

    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, native_enum=False), default=JobStatus.SOURCED
    )

    # Phase 2/3 columns, additive and nullable — unused in Phase 1.
    batch_id: Mapped[int | None] = mapped_column(nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String, nullable=True)
    gmail_draft_id: Mapped[str | None] = mapped_column(String, nullable=True)
    ats_source: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    tailoring_runs: Mapped[list["TailoringRun"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
    tailored_resumes: Mapped[list["TailoredResume"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
    cover_letters: Mapped[list["CoverLetter"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
