import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class RunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class RunType(str, enum.Enum):
    KEYWORDS = "keywords"
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    FULL = "full"


class TailoringRun(Base):
    """The seam that makes swapping in a real background queue (Phase 2) additive."""

    __tablename__ = "tailoring_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"))
    run_type: Mapped[RunType] = mapped_column(Enum(RunType, native_enum=False))
    status: Mapped[RunStatus] = mapped_column(
        Enum(RunStatus, native_enum=False), default=RunStatus.PENDING
    )

    model_used: Mapped[str | None] = mapped_column(String, nullable=True)
    prompt_version: Mapped[str] = mapped_column(String, default="v1")

    input_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    estimated_cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    job: Mapped["Job"] = relationship(back_populates="tailoring_runs")


class TailoredResume(Base):
    __tablename__ = "tailored_resumes"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"))
    tailoring_run_id: Mapped[int | None] = mapped_column(
        ForeignKey("tailoring_runs.id"), nullable=True
    )

    resume_json: Mapped[str] = mapped_column(Text)  # JSON-encoded structured resume
    pdf_path: Mapped[str | None] = mapped_column(String, nullable=True)
    warnings_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_edited: Mapped[bool] = mapped_column(default=False)
    edited_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    job: Mapped["Job"] = relationship(back_populates="tailored_resumes")


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"))
    tailoring_run_id: Mapped[int | None] = mapped_column(
        ForeignKey("tailoring_runs.id"), nullable=True
    )

    body_text: Mapped[str] = mapped_column(Text)
    pdf_path: Mapped[str | None] = mapped_column(String, nullable=True)

    is_edited: Mapped[bool] = mapped_column(default=False)
    edited_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    job: Mapped["Job"] = relationship(back_populates="cover_letters")
