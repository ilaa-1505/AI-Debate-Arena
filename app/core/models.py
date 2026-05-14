from pydantic import BaseModel, Field
from typing import Optional, List



class RoundScore(BaseModel):
    logic: int
    evidence: int
    persuasiveness: int
    rebuttal: int
    total: int


class RoundResult(BaseModel):
    round_number: int
    for_argument: str
    against_argument: str
    scores: dict          
    round_winner: str
    best_argument: str
    reasoning: str


class DebateState(BaseModel):
    session_id: str
    topic: str
    total_rounds: int
    current_round: int = 0
    history: str = ""           
    rounds: List[RoundResult] = []
    scorecard: List[dict] = [] 
    status: str = "pending"     
    verdict: Optional[dict] = None



class StartDebateRequest(BaseModel):
    topic: str = Field(..., min_length=5, max_length=300, description="The debate topic")
    rounds: int = Field(default=3, ge=1, le=5, description="Number of debate rounds (1–5)")


class StartDebateResponse(BaseModel):
    session_id: str
    topic: str
    rounds: int
    message: str


class RoundRequest(BaseModel):
    session_id: str


class DebateStatusResponse(BaseModel):
    session_id: str
    topic: str
    status: str
    current_round: int
    total_rounds: int
    rounds: List[RoundResult]
    verdict: Optional[dict]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
