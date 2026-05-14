import uuid
import asyncio
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from app.core.models import (
    StartDebateRequest,
    StartDebateResponse,
    DebateState,
    RoundResult,
    DebateStatusResponse,
)
from app.core.session_store import (
    create_session,
    get_session,
    update_session,
    list_sessions,
    delete_session,
)
from app.core.agents import (
    for_agent,
    against_agent,
    for_agent_stream,
    against_agent_stream,
    judge_agent,
    verdict_agent,
)

router = APIRouter(tags=["debate"])



@router.post("/start", response_model=StartDebateResponse)
def start_debate(req: StartDebateRequest):
    session_id = str(uuid.uuid4())
    state = DebateState(
        session_id=session_id,
        topic=req.topic,
        total_rounds=req.rounds,
        status="pending",
    )
    create_session(state)
    return StartDebateResponse(
        session_id=session_id,
        topic=req.topic,
        rounds=req.rounds,
        message="Debate session created. Call /debate/run/{session_id} to stream the debate.",
    )



@router.get("/run/{session_id}")
async def run_debate(session_id: str):
    state = get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    if state.status not in ("pending", "running"):
        raise HTTPException(status_code=400, detail=f"Session is already '{state.status}'")

    async def event_generator():
        nonlocal state
        state.status = "running"
        update_session(state)

        try:
            for round_num in range(1, state.total_rounds + 1):
                state.current_round = round_num
                update_session(state)

                yield _sse("agent_start", {"agent": "FOR", "round": round_num})
                await asyncio.sleep(0)

                for_text = ""
                loop = asyncio.get_event_loop()

                def _for_chunks():
                    return list(for_agent_stream(state.topic, state.history))

                chunks = await loop.run_in_executor(None, _for_chunks)
                for chunk in chunks:
                    for_text += chunk
                    yield _sse("token", {"agent": "FOR", "token": chunk})
                    await asyncio.sleep(0)

                state.history += f"\n[FOR]: {for_text.strip()}\n"
                yield _sse("agent_end", {"agent": "FOR", "round": round_num, "text": for_text.strip()})
                update_session(state)
                await asyncio.sleep(0.3)

                yield _sse("agent_start", {"agent": "AGAINST", "round": round_num})
                await asyncio.sleep(0)

                against_text = ""

                def _against_chunks():
                    return list(against_agent_stream(state.topic, state.history))

                chunks = await loop.run_in_executor(None, _against_chunks)
                for chunk in chunks:
                    against_text += chunk
                    yield _sse("token", {"agent": "AGAINST", "token": chunk})
                    await asyncio.sleep(0)

                state.history += f"\n[AGAINST]: {against_text.strip()}\n"
                yield _sse("agent_end", {"agent": "AGAINST", "round": round_num, "text": against_text.strip()})
                update_session(state)
                await asyncio.sleep(0.3)

                yield _sse("agent_start", {"agent": "JUDGE", "round": round_num})
                await asyncio.sleep(0)

                state.status = "judging"
                update_session(state)

                def _judge():
                    return judge_agent(state.history, round_num)

                scores = await loop.run_in_executor(None, _judge)
                state.scorecard.append(scores)

                round_result = RoundResult(
                    round_number=round_num,
                    for_argument=for_text.strip(),
                    against_argument=against_text.strip(),
                    scores=scores,
                    round_winner=scores.get("round_winner", "DRAW"),
                    best_argument=scores.get("best_argument", ""),
                    reasoning=scores.get("reasoning", ""),
                )
                state.rounds.append(round_result)
                state.history += (
                    f"\n[JUDGE — Round {round_num}]: {scores.get('reasoning', '')}"
                    f" | Winner: {scores.get('round_winner', 'DRAW')}\n"
                )

                yield _sse("round_score", {"round": round_num, "scores": scores})
                state.status = "running"
                update_session(state)
                await asyncio.sleep(0.5)

            yield _sse("agent_start", {"agent": "VERDICT", "round": 0})
            await asyncio.sleep(0)

            def _verdict():
                return verdict_agent(state.history, state.scorecard)

            final = await loop.run_in_executor(None, _verdict)
            state.verdict = final
            state.status = "complete"
            update_session(state)

            yield _sse("verdict", {"verdict": final})
            yield _sse("done", {"message": "Debate complete", "session_id": session_id})

        except Exception as e:
            state.status = "error"
            update_session(state)
            yield _sse("error", {"message": str(e)})

    return EventSourceResponse(event_generator())


def _sse(event: str, data: dict) -> dict:
    return {"event": event, "data": json.dumps(data)}



@router.get("/status/{session_id}", response_model=DebateStatusResponse)
def get_status(session_id: str):
    state = get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    return DebateStatusResponse(
        session_id=state.session_id,
        topic=state.topic,
        status=state.status,
        current_round=state.current_round,
        total_rounds=state.total_rounds,
        rounds=state.rounds,
        verdict=state.verdict,
    )



@router.get("/sessions")
def get_sessions():
    return {"sessions": list_sessions()}



@router.delete("/{session_id}")
def remove_session(session_id: str):
    deleted = delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": f"Session {session_id} deleted"}
