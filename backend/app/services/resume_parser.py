from pathlib import Path

import pdfplumber
from docx import Document


class UnsupportedResumeFormat(ValueError):
    pass


def extract_resume_text(file_path: str | Path) -> str:
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf(path)
    if suffix == ".docx":
        return _extract_docx(path)
    if suffix in (".txt", ".md"):
        return path.read_text(encoding="utf-8")

    raise UnsupportedResumeFormat(
        f"Unsupported resume format '{suffix}'. Use .pdf, .docx, .txt, or .md."
    )


def _extract_pdf(path: Path) -> str:
    chunks: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                chunks.append(text)
    return "\n\n".join(chunks).strip()


def _extract_docx(path: Path) -> str:
    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()
