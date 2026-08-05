from types import SimpleNamespace

import pytest

from app.services import tailor


class FakeMessages:
    def __init__(self, response):
        self.response = response
        self.last_call = None

    def create(self, **kwargs):
        self.last_call = kwargs
        return self.response


class FakeClient:
    def __init__(self, response):
        self.messages = FakeMessages(response)


def _tool_use_message(tool_name: str, tool_input: dict):
    block = SimpleNamespace(type="tool_use", name=tool_name, input=tool_input)
    return SimpleNamespace(content=[block])


def _text_message(text: str):
    block = SimpleNamespace(type="text", text=text)
    return SimpleNamespace(content=[block])


def test_extract_keywords_returns_list(monkeypatch):
    fake_response = _tool_use_message("submit_keywords", {"keywords": ["Python", "SQL"]})
    fake_client = FakeClient(fake_response)
    monkeypatch.setattr(tailor, "_client", lambda: fake_client)

    keywords = tailor.extract_keywords("We need a Python and SQL engineer.")

    assert keywords == ["Python", "SQL"]


def test_tailor_resume_includes_no_fabrication_rule(monkeypatch):
    resume_payload = {
        "summary": "Experienced engineer.",
        "skills": ["Python"],
        "experience": [],
        "education": [],
    }
    fake_response = _tool_use_message("submit_tailored_resume", resume_payload)
    fake_client = FakeClient(fake_response)
    monkeypatch.setattr(tailor, "_client", lambda: fake_client)

    result = tailor.tailor_resume("source resume text", "job description text", ["Python"])

    assert result == resume_payload
    system_prompt = fake_client.messages.last_call["system"]
    assert tailor.NO_FABRICATION_RULE in system_prompt
    assert fake_client.messages.last_call["tool_choice"] == {
        "type": "tool",
        "name": "submit_tailored_resume",
    }


def test_draft_cover_letter_includes_no_fabrication_rule(monkeypatch):
    fake_response = _text_message("Dear Hiring Manager, ...")
    fake_client = FakeClient(fake_response)
    monkeypatch.setattr(tailor, "_client", lambda: fake_client)

    letter = tailor.draft_cover_letter("resume text", "jd text", "Acme", "Engineer")

    assert letter == "Dear Hiring Manager, ..."
    assert tailor.NO_FABRICATION_RULE in fake_client.messages.last_call["system"]


def test_tailor_resume_raises_if_tool_not_called(monkeypatch):
    fake_response = _text_message("I refuse to use tools.")
    fake_client = FakeClient(fake_response)
    monkeypatch.setattr(tailor, "_client", lambda: fake_client)

    with pytest.raises(tailor.TailoringError):
        tailor.tailor_resume("resume", "jd", [])


def test_client_raises_without_api_key(monkeypatch):
    monkeypatch.setattr(
        tailor, "get_settings", lambda: SimpleNamespace(anthropic_api_key="", anthropic_model="x")
    )

    with pytest.raises(tailor.TailoringError):
        tailor._client()
