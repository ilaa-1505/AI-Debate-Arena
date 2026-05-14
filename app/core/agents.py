import json
import re
from typing import Generator
from app.core.llm import call_llm, stream_llm
from app.core.prompts import (
    get_for_prompt,
    get_against_prompt,
    get_judge_prompt,
    get_verdict_prompt,
)


def clean_history(history: str) -> str:
    history = history.replace("[FOR]:", "[ARIA - FOR]:")
    history = history.replace("[AGAINST]:", "[REX - AGAINST]:")
    return history


def detect_mode(history: str, role: str) -> str:
    if role == "for":
        return "opening" if "[REX - AGAINST]:" not in history else "rebuttal"
    else:
        return "opening" if "[ARIA - FOR]:" not in history else "rebuttal"



def for_agent_stream(topic: str, history: str) -> Generator[str, None, None]:
    history = clean_history(history)
    mode = detect_mode(history, "for")

    system = (
        "You are ARIA, the FOR debater. "
        "Your sole job is to argue FOR the statement — support it, defend it, prove it true. "
        "If you find yourself agreeing with the opponent or arguing against the statement, stop and rewrite."
    )

    prompt = get_for_prompt(topic, history, mode)

    yield from stream_llm(system, prompt, temperature=0.80)


def for_agent(topic: str, history: str) -> str:
    history = clean_history(history)
    mode = detect_mode(history, "for")

    system = (
        "You are ARIA, the FOR debater. "
        "Your sole job is to argue FOR the statement — support it, defend it, prove it true. "
        "If you find yourself agreeing with the opponent or arguing against the statement, stop and rewrite."
    )

    prompt = get_for_prompt(topic, history, mode)

    return call_llm(system, prompt, temperature=0.80).strip()



def against_agent_stream(topic: str, history: str) -> Generator[str, None, None]:
    history = clean_history(history)
    mode = detect_mode(history, "against")

    system = (
        "You are REX, the AGAINST debater. "
        "Your sole job is to argue AGAINST the statement — challenge it, disprove it, expose its flaws. "
        "If you find yourself supporting the statement or making the opponent's case, stop and rewrite."
    )

    prompt = get_against_prompt(topic, history, mode)

    yield from stream_llm(system, prompt, temperature=0.65)


def against_agent(topic: str, history: str) -> str:
    history = clean_history(history)
    mode = detect_mode(history, "against")

    system = (
        "You are REX, the AGAINST debater. "
        "Your sole job is to argue AGAINST the statement — challenge it, disprove it, expose its flaws. "
        "If you find yourself supporting the statement or making the opponent's case, stop and rewrite."
    )

    prompt = get_against_prompt(topic, history, mode)

    return call_llm(system, prompt, temperature=0.65).strip()



def judge_agent(history: str, round_number: int) -> dict:
    history = clean_history(history)

    system = "You are a strict, neutral debate judge. Return only valid JSON."
    prompt = get_judge_prompt(history, round_number)

    response = call_llm(system, prompt, temperature=0.3)

    cleaned = re.sub(r"```json|```", "", response).strip()

    try:
        data = json.loads(cleaned)

        for side in ("for", "against"):
            if side in data and "total" not in data[side]:
                scores = data[side]
                data[side]["total"] = (
                    scores.get("logic", 0)
                    + scores.get("evidence", 0)
                    + scores.get("persuasiveness", 0)
                    + scores.get("rebuttal", 0)
                )

        return data

    except json.JSONDecodeError:
        return {
            "error": "Failed to parse judge response",
            "raw": response,
            "round_winner": "DRAW",
        }


def verdict_agent(history: str, scorecard: list) -> dict:
    history = clean_history(history)

    system = "You are the chief debate judge. Return only valid JSON."
    prompt = get_verdict_prompt(history, scorecard)

    response = call_llm(system, prompt, temperature=0.4)

    cleaned = re.sub(r"```json|```", "", response).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse verdict",
            "raw": response,
            "winner": "DRAW",
        }