import shutil
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.services.resume_parser import UnsupportedResumeFormat, extract_resume_text

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _get_or_create_profile(db: Session) -> Profile:
    profile = db.execute(select(Profile).where(Profile.id == 1)).scalar_one_or_none()
    if profile is None:
        profile = Profile(id=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db)) -> Profile:
    return _get_or_create_profile(db)


@router.put("", response_model=ProfileOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db)) -> Profile:
    profile = _get_or_create_profile(db)
    for field, value in payload.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/resume", response_model=ProfileOut)
def upload_resume(file: UploadFile, db: Session = Depends(get_db)) -> Profile:
    settings = get_settings()
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in (".pdf", ".docx", ".txt", ".md"):
        raise HTTPException(400, "Unsupported resume format. Use .pdf, .docx, .txt, or .md.")

    uploads_dir = Path(settings.data_dir) / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    dest_path = uploads_dir / f"resume{suffix}"

    with dest_path.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    try:
        resume_text = extract_resume_text(dest_path)
    except UnsupportedResumeFormat as exc:
        raise HTTPException(400, str(exc)) from exc

    if not resume_text.strip():
        raise HTTPException(422, "Couldn't extract any text from that resume file.")

    profile = _get_or_create_profile(db)
    profile.resume_original_filename = file.filename
    profile.resume_raw_text = resume_text
    profile.resume_uploaded_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile
