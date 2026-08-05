import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.job import Job, JobStatus
from app.models.tailoring import CoverLetter, TailoredResume, TailoringRun
from app.schemas.job import JobCreate, JobOut
from app.schemas.tailoring import CoverLetterOut, JobDetailOut, TailoredResumeOut, TailoringRunOut
from app.services.jd_fetch import JdFetchError, fetch_jd_text

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("", response_model=JobOut, status_code=201)
def create_job(payload: JobCreate, db: Session = Depends(get_db)) -> Job:
    jd_text = payload.jd_text
    source_type = "paste_text"

    if not jd_text or not jd_text.strip():
        source_type = "paste_url"
        try:
            jd_text = fetch_jd_text(payload.url)
        except JdFetchError as exc:
            raise HTTPException(422, str(exc)) from exc

    job = Job(
        company=payload.company,
        role_title=payload.role_title,
        url=payload.url,
        jd_text=jd_text,
        jd_source_type=source_type,
        status=JobStatus.SOURCED,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=list[JobOut])
def list_jobs(
    status: JobStatus | None = Query(default=None), db: Session = Depends(get_db)
) -> list[Job]:
    stmt = select(Job).order_by(Job.created_at.desc())
    if status is not None:
        stmt = stmt.where(Job.status == status)
    return list(db.execute(stmt).scalars())


def _get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job


def _latest_tailored_resume(db: Session, job_id: int) -> TailoredResume | None:
    stmt = (
        select(TailoredResume)
        .where(TailoredResume.job_id == job_id)
        .order_by(TailoredResume.created_at.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


def _latest_cover_letter(db: Session, job_id: int) -> CoverLetter | None:
    stmt = (
        select(CoverLetter)
        .where(CoverLetter.job_id == job_id)
        .order_by(CoverLetter.created_at.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


@router.get("/{job_id}", response_model=JobDetailOut)
def get_job(job_id: int, db: Session = Depends(get_db)) -> JobDetailOut:
    job = _get_job_or_404(db, job_id)

    resume_row = _latest_tailored_resume(db, job_id)
    resume_out = None
    if resume_row is not None:
        resume_out = TailoredResumeOut(
            id=resume_row.id,
            job_id=resume_row.job_id,
            resume=json.loads(resume_row.resume_json),
            warnings=json.loads(resume_row.warnings_json) if resume_row.warnings_json else [],
            pdf_path=resume_row.pdf_path,
            is_edited=resume_row.is_edited,
            created_at=resume_row.created_at,
        )

    cover_row = _latest_cover_letter(db, job_id)
    cover_out = CoverLetterOut.model_validate(cover_row) if cover_row is not None else None

    runs = list(
        db.execute(
            select(TailoringRun)
            .where(TailoringRun.job_id == job_id)
            .order_by(TailoringRun.created_at.desc())
            .limit(5)
        ).scalars()
    )

    return JobDetailOut(
        id=job.id,
        company=job.company,
        role_title=job.role_title,
        url=job.url,
        jd_text=job.jd_text,
        jd_source_type=job.jd_source_type,
        status=job.status.value,
        created_at=job.created_at,
        updated_at=job.updated_at,
        tailored_resume=resume_out,
        cover_letter=cover_out,
        latest_runs=[TailoringRunOut.model_validate(r) for r in runs],
    )


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db)) -> None:
    job = _get_job_or_404(db, job_id)
    db.delete(job)
    db.commit()
