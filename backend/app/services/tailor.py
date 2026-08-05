from typing import Any

import anthropic

from app.config import get_settings

NO_FABRICATION_RULE = (
    "Hard rule: you may only reorder, re-emphasize, and rephrase content "
    "that already appears in the candidate's source resume below. Never "
    "invent employers, job titles, dates, degrees, certifications, or "
    "skills not present in the source resume. If the job description asks "
    "for something the resume doesn't support, omit it rather than claim "
    "it. Company names, titles, and dates must be copied verbatim from the "
    "source resume."
)

_RESUME_TOOL = {
    "name": "submit_tailored_resume",
    "description": "Submit the tailored resume content as structured data.",
    "input_schema": {
        "type": "object",
        "required": ["summary", "skills", "experience", "education"],
        "properties": {
            "summary": {
                "type": "string",
                "description": "1-3 sentence professional summary tailored to this role",
            },
            "skills": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Ordered, most job-relevant first",
            },
            "experience": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["company", "title", "bullets"],
                    "properties": {
                        "company": {"type": "string"},
                        "title": {"type": "string"},
                        "location": {"type": "string"},
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "bullets": {"type": "array", "items": {"type": "string"}},
                    },
                },
            },
            "projects": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "dates": {"type": "string"},
                        "bullets": {"type": "array", "items": {"type": "string"}},
                    },
                },
            },
            "education": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "school": {"type": "string"},
                        "degree": {"type": "string"},
                        "dates": {"type": "string"},
                        "details": {"type": "string"},
                    },
                },
            },
            "certifications": {"type": "array", "items": {"type": "string"}},
        },
    },
}

_KEYWORDS_TOOL = {
    "name": "submit_keywords",
    "description": "Submit the extracted ATS keywords as a list of strings.",
    "input_schema": {
        "type": "object",
        "required": ["keywords"],
        "properties": {
            "keywords": {"type": "array", "items": {"type": "string"}},
        },
    },
}


class TailoringError(RuntimeError):
    pass


def _client() -> anthropic.Anthropic:
    settings = get_settings()
    if not settings.anthropic_api_key:
        raise TailoringError("ANTHROPIC_API_KEY is not configured.")
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def _tool_input(message: anthropic.types.Message, tool_name: str) -> dict[str, Any]:
    for block in message.content:
        if block.type == "tool_use" and block.name == tool_name:
            return block.input
    raise TailoringError(f"Model did not call the expected tool '{tool_name}'.")


def extract_keywords(jd_text: str) -> list[str]:
    settings = get_settings()
    client = _client()
    message = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=(
            "Extract ATS keywords from this job description — hard skills, tools, "
            "certifications, and required qualifications. Respond only by calling "
            "the submit_keywords tool."
        ),
        tools=[_KEYWORDS_TOOL],
        tool_choice={"type": "tool", "name": "submit_keywords"},
        messages=[{"role": "user", "content": jd_text}],
    )
    return _tool_input(message, "submit_keywords")["keywords"]


def tailor_resume(resume_text: str, jd_text: str, keywords: list[str]) -> dict[str, Any]:
    settings = get_settings()
    client = _client()
    system = (
        f"{NO_FABRICATION_RULE}\n\n"
        "Reorder bullets so the most relevant to the target role come first. "
        "Weave in the provided ATS keywords ONLY where they genuinely match "
        "something the candidate already did — do not force keywords that "
        "don't fit. Contact info is handled separately; do not include it. "
        "Respond only by calling the submit_tailored_resume tool."
    )
    user_content = (
        f"SOURCE RESUME:\n{resume_text}\n\n"
        f"JOB DESCRIPTION:\n{jd_text}\n\n"
        f"ATS KEYWORDS TO CONSIDER:\n{', '.join(keywords)}"
    )
    message = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=4096,
        system=system,
        tools=[_RESUME_TOOL],
        tool_choice={"type": "tool", "name": "submit_tailored_resume"},
        messages=[{"role": "user", "content": user_content}],
    )
    return _tool_input(message, "submit_tailored_resume")


def draft_cover_letter(resume_text: str, jd_text: str, company: str, role: str) -> str:
    settings = get_settings()
    client = _client()
    system = (
        f"{NO_FABRICATION_RULE}\n\n"
        "Write a concise, specific cover letter: 3-4 short paragraphs, plain "
        "text, no markdown formatting, no placeholders like [Company Name]. "
        "Reference concrete experience from the resume and connect it to the "
        "job description. No generic filler. Sign off with the candidate's "
        "name only (pulled from the resume)."
    )
    user_content = (
        f"COMPANY: {company}\nROLE: {role}\n\n"
        f"SOURCE RESUME:\n{resume_text}\n\n"
        f"JOB DESCRIPTION:\n{jd_text}"
    )
    message = client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": user_content}],
    )
    return "".join(block.text for block in message.content if block.type == "text").strip()
