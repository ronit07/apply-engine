"""Thin runner abstraction for tailoring jobs.

Phase 1 runs this via FastAPI's in-process BackgroundTasks. Phase 2 can swap
the call site (POST /api/jobs/{id}/tailor) for a real queue (RQ/Arq) without
changing this function's signature or the tailoring_runs status contract.
"""

import json
import traceback
from datetime import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal
from app.models.job import Job, JobStatus
from app.models.profile import Profile
from app.models.tailoring import CoverLetter, RunStatus, RunType, TailoredResume, TailoringRun
from app.services import render_pdf, tailor, validator


def _mark_run(db: Session, run: TailoringRun, status: RunStatus, error: str | None = None) -> None:
    run.status = status
    if status == RunStatus.RUNNING:
        run.started_at = datetime.utcnow()
    if status in (RunStatus.SUCCEEDED, RunStatus.FAILED):
        run.completed_at = datetime.utcnow()
    if error:
        run.error_message = error
    db.commit()


def run_tailoring(job_id: int) -> None:
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        if job is None:
            return

        profile_row = db.execute(select(Profile)).scalar_one_or_none()
        resume_text = (profile_row.resume_raw_text if profile_row else None) or ""
        profile_dict = (
            {
                "full_name": profile_row.full_name,
                "email": profile_row.email,
                "phone": profile_row.phone,
                "location": profile_row.location,
                "linkedin_url": profile_row.linkedin_url,
                "github_url": profile_row.github_url,
                "portfolio_url": profile_row.portfolio_url,
            }
            if profile_row
            else {}
        )

        job.status = JobStatus.TAILORING
        db.commit()

        settings = get_settings()
        data_dir = Path(settings.data_dir)

        run = TailoringRun(job_id=job.id, run_type=RunType.FULL, model_used=settings.anthropic_model)
        db.add(run)
        db.commit()
        db.refresh(run)
        _mark_run(db, run, RunStatus.RUNNING)

        try:
            keywords = tailor.extract_keywords(job.jd_text)
            resume_dict = tailor.tailor_resume(resume_text, job.jd_text, keywords)
            cover_letter_text = tailor.draft_cover_letter(
                resume_text, job.jd_text, job.company, job.role_title
            )

            warnings = validator.check_resume_for_fabrication(resume_dict, resume_text)

            resume_pdf_path = data_dir / "generated" / f"job_{job.id}_resume.pdf"
            render_pdf.render_resume_pdf(resume_dict, profile_dict, resume_pdf_path)

            cover_pdf_path = data_dir / "generated" / f"job_{job.id}_cover_letter.pdf"
            render_pdf.render_cover_letter_pdf(
                cover_letter_text, profile_dict, job.company, job.role_title, cover_pdf_path
            )

            db.add(
                TailoredResume(
                    job_id=job.id,
                    tailoring_run_id=run.id,
                    resume_json=json.dumps(resume_dict),
                    pdf_path=str(resume_pdf_path),
                    warnings_json=json.dumps(warnings),
                )
            )
            db.add(
                CoverLetter(
                    job_id=job.id,
                    tailoring_run_id=run.id,
                    body_text=cover_letter_text,
                    pdf_path=str(cover_pdf_path),
                )
            )
            job.status = JobStatus.READY_FOR_REVIEW
            db.commit()

            _mark_run(db, run, RunStatus.SUCCEEDED)
        except Exception as exc:  # noqa: BLE001 - report all failures on the run record
            job.status = JobStatus.SOURCED
            db.commit()
            # Full traceback goes to the server console for debugging; only the
            # short exception message is stored/shown, so the UI never dumps a
            # raw Python traceback (with local file paths) at the user.
            traceback.print_exc()
            _mark_run(db, run, RunStatus.FAILED, error=str(exc))
    finally:
        db.close()
