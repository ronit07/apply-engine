# Apply Engine (Phase 1)

Personal tool for AI-tailored resumes/cover letters, with a review-before-anything-happens
workflow. This is Phase 1: single-job add → tailor → review/edit → approve. Planned for
later phases: bulk import from public ATS APIs, a background job queue, form autofill
with human confirmation, and Gmail-draft HR outreach.

## Setup

Backend:
```
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]" alembic
cp .env.example .env   # then set ANTHROPIC_API_KEY in .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend:
```
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173, fill in your Profile (contact info + resume upload),
and add your first job.

## Tests

```
cd backend && source .venv/bin/activate && python -m pytest tests/ -v
```

## Notes

- Without `ANTHROPIC_API_KEY` set, "Generate tailored materials" will fail gracefully
  (shown in the UI) rather than silently doing nothing — set the key in `backend/.env`
  to actually tailor resumes.
- Never auto-submits an application or auto-sends an email — every action needs your
  explicit review/approval, by design.
- `data/` (SQLite DB, uploaded resumes, generated PDFs) is local and gitignored-by-convention;
  it's not committed if you turn this into a git repo.
