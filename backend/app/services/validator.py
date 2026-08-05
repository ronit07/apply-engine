from rapidfuzz import fuzz

_MATCH_THRESHOLD = 70


def _best_match_score(needle: str, haystack: str) -> int:
    if not needle.strip():
        return 100
    return fuzz.partial_ratio(needle.lower(), haystack.lower())


def check_resume_for_fabrication(resume: dict, source_text: str) -> list[str]:
    """Fuzzy-matches tailored experience against the source resume.

    Non-blocking assist — the human review step is the real safety net.
    Returns human-readable warnings, empty list if nothing looks off.
    """
    warnings: list[str] = []

    for entry in resume.get("experience", []):
        company = entry.get("company", "")
        title = entry.get("title", "")

        if company and _best_match_score(company, source_text) < _MATCH_THRESHOLD:
            warnings.append(
                f"Company \"{company}\" wasn't found in your source resume — "
                "double-check this wasn't invented."
            )
        if title and _best_match_score(title, source_text) < _MATCH_THRESHOLD:
            warnings.append(
                f"Title \"{title}\" at {company or 'this employer'} wasn't found "
                "in your source resume — double-check this wasn't invented."
            )

    for cert in resume.get("certifications", []):
        if _best_match_score(cert, source_text) < _MATCH_THRESHOLD:
            warnings.append(
                f"Certification \"{cert}\" wasn't found in your source resume — "
                "double-check this wasn't invented."
            )

    return warnings
