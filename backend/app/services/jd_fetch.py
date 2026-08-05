import httpx
from bs4 import BeautifulSoup


class JdFetchError(RuntimeError):
    pass


def fetch_jd_text(url: str, timeout: float = 15.0) -> str:
    try:
        response = httpx.get(
            url,
            timeout=timeout,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (apply-engine job description fetch)"},
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise JdFetchError(f"Could not fetch job posting from {url}: {exc}") from exc

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned = "\n".join(lines)

    if not cleaned:
        raise JdFetchError(f"No readable text found at {url}. Paste the JD text instead.")

    return cleaned
