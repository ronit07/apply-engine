from datetime import datetime

from pydantic import BaseModel

from app.models.tailoring import RunStatus, RunType


class ExperienceEntry(BaseModel):
    company: str
    title: str
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[str] = []


class ProjectEntry(BaseModel):
    name: str
    dates: str = ""
    bullets: list[str] = []


class EducationEntry(BaseModel):
    school: str
    degree: str = ""
    dates: str = ""
    details: str = ""


class TailoredResumeContent(BaseModel):
    summary: str
    skills: list[str] = []
    experience: list[ExperienceEntry] = []
    projects: list[ProjectEntry] = []
    education: list[EducationEntry] = []
    certifications: list[str] = []


class TailoredResumeOut(BaseModel):
    id: int
    job_id: int
    resume: TailoredResumeContent
    warnings: list[str] = []
    pdf_path: str | None
    is_edited: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TailoredResumeUpdate(BaseModel):
    resume: TailoredResumeContent


class CoverLetterOut(BaseModel):
    id: int
    job_id: int
    body_text: str
    pdf_path: str | None
    is_edited: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CoverLetterUpdate(BaseModel):
    body_text: str


class TailoringRunOut(BaseModel):
    id: int
    run_type: RunType
    status: RunStatus
    error_message: str | None
    estimated_cost_usd: float | None
    started_at: datetime | None
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class TailoringStatusOut(BaseModel):
    job_id: int
    job_status: str
    runs: list[TailoringRunOut]
    overall_status: str  # "idle" | "running" | "succeeded" | "failed"


class JobDetailOut(BaseModel):
    id: int
    company: str
    role_title: str
    url: str | None
    jd_text: str
    jd_source_type: str
    status: str
    created_at: datetime
    updated_at: datetime
    tailored_resume: TailoredResumeOut | None = None
    cover_letter: CoverLetterOut | None = None
    latest_runs: list[TailoringRunOut] = []
