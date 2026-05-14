from typing import Dict, Optional
from app.core.models import DebateState

_sessions: Dict[str, DebateState] = {}


def create_session(state: DebateState) -> None:
    _sessions[state.session_id] = state


def get_session(session_id: str) -> Optional[DebateState]:
    return _sessions.get(session_id)


def update_session(state: DebateState) -> None:
    _sessions[state.session_id] = state


def delete_session(session_id: str) -> bool:
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def list_sessions() -> list:
    return [
        {
            "session_id": s.session_id,
            "topic": s.topic,
            "status": s.status,
            "current_round": s.current_round,
            "total_rounds": s.total_rounds,
        }
        for s in _sessions.values()
    ]
