from datetime import datetime

from pydantic import BaseModel, model_validator

from app.models.job import JobStatus


class JobCreate(BaseModel):
    company: str
    role_title: str
    url: str | None = None
    jd_text: str | None = None

    @model_validator(mode="after")
    def require_url_or_text(self) -> "JobCreate":
        if not self.url and not (self.jd_text and self.jd_text.strip()):
            raise ValueError("Provide either a job posting URL or the job description text.")
        return self


class JobOut(BaseModel):
    id: int
    company: str
    role_title: str
    url: str | None
    jd_text: str
    jd_source_type: str
    status: JobStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobStatusUpdate(BaseModel):
    status: JobStatus
