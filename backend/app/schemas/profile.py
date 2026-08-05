from datetime import datetime

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    portfolio_url: str = ""


class ProfileOut(ProfileUpdate):
    id: int
    resume_original_filename: str | None = None
    resume_raw_text: str | None = None
    resume_uploaded_at: datetime | None = None

    model_config = {"from_attributes": True}
