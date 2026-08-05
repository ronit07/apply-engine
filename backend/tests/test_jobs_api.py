from app.services import tailor

FAKE_RESUME = {
    "summary": "Engineer tailored for this role.",
    "skills": ["Python", "SQL"],
    "experience": [
        {
            "company": "Acme Corp",
            "title": "Software Engineer",
            "start_date": "2022",
            "end_date": "Present",
            "bullets": ["Built things at Acme Corp."],
        }
    ],
    "projects": [],
    "education": [{"school": "State University", "degree": "BS CS", "dates": "2022"}],
    "certifications": [],
}


def _mock_tailoring(monkeypatch):
    monkeypatch.setattr(tailor, "extract_keywords", lambda jd_text: ["Python", "SQL"])
    monkeypatch.setattr(
        tailor, "tailor_resume", lambda resume_text, jd_text, keywords: dict(FAKE_RESUME)
    )
    monkeypatch.setattr(
        tailor,
        "draft_cover_letter",
        lambda resume_text, jd_text, company, role: "Dear Hiring Manager,\n\nI would love to join.",
    )


def _setup_profile(client):
    client.put(
        "/api/profile",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "555-1234",
            "location": "Remote",
            "linkedin_url": "",
            "github_url": "",
            "portfolio_url": "",
        },
    )
    # Directly seed resume_raw_text via the profile row, bypassing file upload
    # (multipart upload isn't the concern of this test).
    from app.models.profile import Profile
    from sqlalchemy import select

    return Profile, select


def test_full_job_lifecycle(client, db_session, monkeypatch):
    _mock_tailoring(monkeypatch)
    Profile, select = _setup_profile(client)

    profile = db_session.execute(select(Profile).where(Profile.id == 1)).scalar_one()
    profile.resume_raw_text = "Jane Doe worked at Acme Corp as a Software Engineer since 2022."
    db_session.commit()

    create_resp = client.post(
        "/api/jobs",
        json={
            "company": "Acme Corp",
            "role_title": "Software Engineer",
            "jd_text": "Looking for a Python and SQL engineer.",
        },
    )
    assert create_resp.status_code == 201
    job = create_resp.json()
    assert job["status"] == "SOURCED"
    job_id = job["id"]

    tailor_resp = client.post(f"/api/jobs/{job_id}/tailor")
    assert tailor_resp.status_code == 202

    status_resp = client.get(f"/api/jobs/{job_id}/tailoring-status")
    assert status_resp.status_code == 200
    assert status_resp.json()["overall_status"] == "succeeded"

    detail_resp = client.get(f"/api/jobs/{job_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["status"] == "READY_FOR_REVIEW"
    assert detail["tailored_resume"]["resume"]["summary"] == FAKE_RESUME["summary"]
    assert detail["cover_letter"]["body_text"].startswith("Dear Hiring Manager")

    edited_resume = dict(FAKE_RESUME)
    edited_resume["summary"] = "An edited summary."
    edit_resp = client.put(f"/api/jobs/{job_id}/resume", json={"resume": edited_resume})
    assert edit_resp.status_code == 200

    detail_resp2 = client.get(f"/api/jobs/{job_id}")
    assert detail_resp2.json()["tailored_resume"]["resume"]["summary"] == "An edited summary."
    assert detail_resp2.json()["tailored_resume"]["is_edited"] is True

    approve_resp = client.put(f"/api/jobs/{job_id}/status", json={"status": "APPROVED"})
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"

    list_resp = client.get("/api/jobs", params={"status": "APPROVED"})
    assert list_resp.status_code == 200
    assert any(j["id"] == job_id for j in list_resp.json())


def test_tailor_without_resume_returns_422(client):
    create_resp = client.post(
        "/api/jobs",
        json={"company": "Acme", "role_title": "Engineer", "jd_text": "Do engineering things."},
    )
    job_id = create_resp.json()["id"]

    tailor_resp = client.post(f"/api/jobs/{job_id}/tailor")

    assert tailor_resp.status_code == 422


def test_create_job_without_url_or_text_returns_422(client):
    resp = client.post("/api/jobs", json={"company": "Acme", "role_title": "Engineer"})
    assert resp.status_code == 422


def test_get_missing_job_returns_404(client):
    resp = client.get("/api/jobs/999")
    assert resp.status_code == 404
