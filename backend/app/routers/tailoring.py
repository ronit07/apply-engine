import json
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models.job import Job, JobStatus
from app.models.profile import Profile
from app.models.tailoring import CoverLetter, RunStatus, TailoredResume, TailoringRun
from app.schemas.job import JobStatusUpdate
from app.schemas.tailoring import (
    CoverLetterUpdate,
    TailoredResumeUpdate,
    TailoringRunOut,
    TailoringStatusOut,
)
from app.services import render_pdf, validator
from app.tasks.background import run_tailoring

router = APIRouter(prefix="/api/jobs", tags=["tailoring"])


def _get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job


@router.post("/{job_id}/tailor", status_code=202)
def trigger_tailoring(
    job_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
) -> dict:
    job = _get_job_or_404(db, job_id)

    profile = db.execute(select(Profile).where(Profile.id == 1)).scalar_one_or_none()
    if not profile or not profile.resume_raw_text:
        raise HTTPException(422, "Upload a resume in your profile before tailoring.")

    job.status = JobStatus.TAILORING
    db.commit()

    background_tasks.add_task(run_tailoring, job_id)
    return {"job_id": job_id, "status": "queued"}


@router.get("/{job_id}/tailoring-status", response_model=TailoringStatusOut)
def get_tailoring_status(job_id: int, db: Session = Depends(get_db)) -> TailoringStatusOut:
    job = _get_job_or_404(db, job_id)

    runs = list(
        db.execute(
            select(TailoringRun)
            .where(TailoringRun.job_id == job_id)
            .order_by(TailoringRun.created_at.desc())
            .limit(5)
        ).scalars()
    )

    if not runs:
        overall = "idle"
    elif any(r.status == RunStatus.RUNNING or r.status == RunStatus.PENDING for r in runs):
        overall = "running"
    elif runs[0].status == RunStatus.FAILED:
        overall = "failed"
    else:
        overall = "succeeded"

    return TailoringStatusOut(
        job_id=job_id,
        job_status=job.status.value,
        runs=[TailoringRunOut.model_validate(r) for r in runs],
        overall_status=overall,
    )


def _latest_tailored_resume_row(db: Session, job_id: int) -> TailoredResume:
    stmt = (
        select(TailoredResume)
        .where(TailoredResume.job_id == job_id)
        .order_by(TailoredResume.created_at.desc())
        .limit(1)
    )
    row = db.execute(stmt).scalar_one_or_none()
    if row is None:
        raise HTTPException(404, "No tailored resume yet for this job. Run tailoring first.")
    return row


def _latest_cover_letter_row(db: Session, job_id: int) -> CoverLetter:
    stmt = (
        select(CoverLetter)
        .where(CoverLetter.job_id == job_id)
        .order_by(CoverLetter.created_at.desc())
        .limit(1)
    )
    row = db.execute(stmt).scalar_one_or_none()
    if row is None:
        raise HTTPException(404, "No cover letter yet for this job. Run tailoring first.")
    return row


def _profile_dict(db: Session) -> dict:
    profile = db.execute(select(Profile).where(Profile.id == 1)).scalar_one_or_none()
    if profile is None:
        return {}
    return {
        "full_name": profile.full_name,
        "email": profile.email,
        "phone": profile.phone,
        "location": profile.location,
        "linkedin_url": profile.linkedin_url,
        "github_url": profile.github_url,
        "portfolio_url": profile.portfolio_url,
    }


@router.put("/{job_id}/resume")
def update_resume(job_id: int, payload: TailoredResumeUpdate, db: Session = Depends(get_db)) -> dict:
    job = _get_job_or_404(db, job_id)
    row = _latest_tailored_resume_row(db, job_id)

    resume_dict = payload.resume.model_dump()
    profile = db.execute(select(Profile).where(Profile.id == 1)).scalar_one_or_none()
    warnings = validator.check_resume_for_fabrication(
        resume_dict, (profile.resume_raw_text if profile else "") or ""
    )

    row.resume_json = json.dumps(resume_dict)
    row.warnings_json = json.dumps(warnings)
    row.is_edited = True
    row.edited_at = datetime.utcnow()

    settings = get_settings()
    pdf_path = Path(settings.data_dir) / "generated" / f"job_{job_id}_resume.pdf"
    render_pdf.render_resume_pdf(resume_dict, _profile_dict(db), pdf_path)
    row.pdf_path = str(pdf_path)

    db.commit()
    return {"ok": True, "warnings": warnings}


@router.put("/{job_id}/cover-letter")
def update_cover_letter(
    job_id: int, payload: CoverLetterUpdate, db: Session = Depends(get_db)
) -> dict:
    job = _get_job_or_404(db, job_id)
    row = _latest_cover_letter_row(db, job_id)

    row.body_text = payload.body_text
    row.is_edited = True
    row.edited_at = datetime.utcnow()

    settings = get_settings()
    pdf_path = Path(settings.data_dir) / "generated" / f"job_{job_id}_cover_letter.pdf"
    render_pdf.render_cover_letter_pdf(
        payload.body_text, _profile_dict(db), job.company, job.role_title, pdf_path
    )
    row.pdf_path = str(pdf_path)

    db.commit()
    return {"ok": True}


@router.get("/{job_id}/resume.pdf")
def get_resume_pdf(job_id: int, db: Session = Depends(get_db)) -> FileResponse:
    row = _latest_tailored_resume_row(db, job_id)
    if not row.pdf_path or not Path(row.pdf_path).exists():
        raise HTTPException(404, "Resume PDF not generated yet.")
    return FileResponse(row.pdf_path, media_type="application/pdf")


@router.get("/{job_id}/cover-letter.pdf")
def get_cover_letter_pdf(job_id: int, db: Session = Depends(get_db)) -> FileResponse:
    row = _latest_cover_letter_row(db, job_id)
    if not row.pdf_path or not Path(row.pdf_path).exists():
        raise HTTPException(404, "Cover letter PDF not generated yet.")
    return FileResponse(row.pdf_path, media_type="application/pdf")


@router.put("/{job_id}/status")
def update_status(job_id: int, payload: JobStatusUpdate, db: Session = Depends(get_db)) -> dict:
    job = _get_job_or_404(db, job_id)
    job.status = payload.status
    db.commit()
    return {"ok": True, "status": job.status.value}
