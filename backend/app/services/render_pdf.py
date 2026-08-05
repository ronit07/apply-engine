"""PDF rendering via reportlab.

The plan's primary choice was WeasyPrint+Jinja2, with an explicit fallback to
reportlab if WeasyPrint's system deps (cairo/pango/gdk-pixbuf) prove painful
to install. This machine doesn't have those Homebrew packages, so we use the
sanctioned fallback directly — pure-Python, no system deps.
"""

from pathlib import Path

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

_styles = getSampleStyleSheet()
_NAME_STYLE = ParagraphStyle("Name", parent=_styles["Title"], fontSize=16, spaceAfter=2)
_CONTACT_STYLE = ParagraphStyle("Contact", parent=_styles["Normal"], fontSize=9, spaceAfter=12)
_SECTION_STYLE = ParagraphStyle(
    "Section", parent=_styles["Heading2"], fontSize=11, spaceBefore=10, spaceAfter=4
)
_BODY_STYLE = ParagraphStyle("Body", parent=_styles["Normal"], fontSize=10, leading=13)
_BULLET_STYLE = ParagraphStyle(
    "Bullet", parent=_BODY_STYLE, leftIndent=14, spaceAfter=2
)
_SUBHEAD_STYLE = ParagraphStyle(
    "Subhead", parent=_BODY_STYLE, fontName="Helvetica-Bold", spaceBefore=6
)


def _doc(output_path: str | Path) -> SimpleDocTemplate:
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    return SimpleDocTemplate(
        str(output_path),
        pagesize=LETTER,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
    )


def render_resume_pdf(resume: dict, profile: dict, output_path: str | Path) -> str:
    story = []

    story.append(Paragraph(profile.get("full_name", ""), _NAME_STYLE))
    contact_bits = [
        b
        for b in [
            profile.get("email"),
            profile.get("phone"),
            profile.get("location"),
            profile.get("linkedin_url"),
            profile.get("github_url"),
            profile.get("portfolio_url"),
        ]
        if b
    ]
    story.append(Paragraph(" | ".join(contact_bits), _CONTACT_STYLE))

    if resume.get("summary"):
        story.append(Paragraph("Summary", _SECTION_STYLE))
        story.append(Paragraph(resume["summary"], _BODY_STYLE))

    if resume.get("skills"):
        story.append(Paragraph("Skills", _SECTION_STYLE))
        story.append(Paragraph(", ".join(resume["skills"]), _BODY_STYLE))

    if resume.get("experience"):
        story.append(Paragraph("Experience", _SECTION_STYLE))
        for entry in resume["experience"]:
            header = f"{entry.get('title', '')} — {entry.get('company', '')}"
            dates = f"{entry.get('start_date', '')} - {entry.get('end_date', '')}".strip(" -")
            story.append(Paragraph(f"{header}  <i>{dates}</i>", _SUBHEAD_STYLE))
            for bullet in entry.get("bullets", []):
                story.append(Paragraph(f"• {bullet}", _BULLET_STYLE))

    if resume.get("projects"):
        story.append(Paragraph("Projects", _SECTION_STYLE))
        for entry in resume["projects"]:
            header = entry.get("name", "")
            dates = entry.get("dates", "")
            story.append(Paragraph(f"{header}  <i>{dates}</i>", _SUBHEAD_STYLE))
            for bullet in entry.get("bullets", []):
                story.append(Paragraph(f"• {bullet}", _BULLET_STYLE))

    if resume.get("education"):
        story.append(Paragraph("Education", _SECTION_STYLE))
        for entry in resume["education"]:
            header = f"{entry.get('school', '')} — {entry.get('degree', '')}"
            dates = entry.get("dates", "")
            story.append(Paragraph(f"{header}  <i>{dates}</i>", _SUBHEAD_STYLE))
            if entry.get("details"):
                story.append(Paragraph(entry["details"], _BODY_STYLE))

    if resume.get("certifications"):
        story.append(Paragraph("Certifications", _SECTION_STYLE))
        story.append(Paragraph(", ".join(resume["certifications"]), _BODY_STYLE))

    _doc(output_path).build(story)
    return str(output_path)


def render_cover_letter_pdf(
    body_text: str, profile: dict, company: str, role: str, output_path: str | Path
) -> str:
    story = [
        Paragraph(profile.get("full_name", ""), _NAME_STYLE),
        Paragraph(
            " | ".join(b for b in [profile.get("email"), profile.get("phone")] if b),
            _CONTACT_STYLE,
        ),
        Spacer(1, 12),
        Paragraph(f"Re: {role} at {company}", _SUBHEAD_STYLE),
        Spacer(1, 8),
    ]
    for paragraph in body_text.split("\n\n"):
        cleaned = paragraph.strip().replace("\n", " ")
        if cleaned:
            story.append(Paragraph(cleaned, _BODY_STYLE))
            story.append(Spacer(1, 8))

    _doc(output_path).build(story)
    return str(output_path)
