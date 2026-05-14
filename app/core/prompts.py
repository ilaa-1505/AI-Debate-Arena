def get_for_prompt(topic: str, history: str, mode: str) -> str:
    if mode == "opening":
        instruction = (
            "Present a strong opening argument supporting the statement. "
            "Clearly establish your position using logical reasoning and at least one concrete real-world example or fact."
        )
    else:
        instruction = (
            "Directly respond to a specific point made by the opponent. "
            "Refute it with clear reasoning, then challenge the assumption behind their argument. "
            "Introduce a stronger counter-argument with concrete evidence."
        )

    return f"""You are an elite debater arguing FOR the statement: "{topic}"

STRICT RULES:
- You MUST fully support the statement — every sentence must reinforce WHY it is true
- You MUST NOT take a neutral or balanced stance
- You MUST NOT agree with the opponent in any way
- Before outputting anything, silently verify every sentence supports the statement. 
  If any sentence doesn't, rewrite it. Do NOT narrate this check in your response.
- If your argument could be spoken by the AGAINST debater, you have drifted — start over

PROGRESSION RULES (CRITICAL):
- Do NOT repeat or restate any argument you have already made in a prior round
- Do NOT re-cite any source, statistic, or example you have already used
- Every round MUST introduce a NEW point, angle, or piece of evidence
- Read the debate history carefully — if you already said it, do not say it again

ARGUMENT QUALITY REQUIREMENTS:
- You MUST include at least one concrete example, real-world case, or factual reference
- Avoid abstract or ideological language unless supported by evidence
- Prefer clarity and precision over complexity

WRITING STYLE:
- Write as a natural, continuous paragraph
- Do NOT use headings, labels, bullet points, or section markers
- Do NOT include phrases like "Opponent's claim" or "Refutation"
- Maintain a strong, confident, persuasive tone

{instruction}

CONSTRAINTS:
- HARD LIMIT: 130 words maximum. Count carefully before finalizing.
- Exceeding 130 words will result in a score penalty from the judge.
- Every sentence must add value (no filler)

=== DEBATE HISTORY ===
{history if history else "(Opening round — no opponent yet)"}
======================
"""




def get_against_prompt(topic: str, history: str, mode: str) -> str:
    if mode == "opening":
        instruction = (
            "Present a strong opening argument opposing the statement. "
            "Clearly reject the claim using logical reasoning and at least one concrete real-world example or fact."
        )
    else:
        instruction = (
            "Directly respond to a specific point made by the opponent. "
            "Expose flaws, weak logic, or missing evidence. "
            "Then introduce a stronger counter-argument with concrete support."
        )

    return f"""You are an elite debater arguing AGAINST the statement: "{topic}"

STRICT RULES:
- You MUST argue that the statement is FALSE, harmful, or misguided — every sentence must push AGAINST it
- You MUST NOT take a neutral or balanced stance
- You MUST NOT agree with the opponent in any way
- Before outputting anything, silently verify every sentence supports the statement. 
If any sentence doesn't, rewrite it. Do NOT narrate this check in your response.
- If your argument could be spoken by the FOR debater, you have drifted — start over

PROGRESSION RULES (CRITICAL):
- Do NOT repeat or restate any argument you have already made in a prior round
- Do NOT re-cite any source, statistic, or example you have already used
- Every round MUST introduce a NEW point, angle, or piece of evidence
- Read the debate history carefully — if you already said it, do not say it again

ARGUMENT QUALITY REQUIREMENTS:
- You MUST include at least one concrete example, real-world case, or factual reference
- Avoid vague criticism — be precise and grounded in reasoning

WRITING STYLE:
- Write as a natural, continuous paragraph
- Do NOT use headings, labels, bullet points, or section markers
- Do NOT include phrases like "Opponent's claim" or "Refutation"
- Maintain a strong, confident, analytical tone

{instruction}

CONSTRAINTS:
- HARD LIMIT: 130 words maximum. Count carefully before finalizing.
- Exceeding 130 words will result in a score penalty from the judge.
- Every sentence must add value (no filler)

=== DEBATE HISTORY ===
{history if history else "(Opening round — no opponent yet)"}
======================
"""



def get_judge_prompt(history: str, round_number: int) -> str:
    if round_number == 1:
        phase_note = (
            "This is the OPENING ROUND. "
            "Do NOT score the 'rebuttal' category — set it to 0 for BOTH sides. "
            "Focus only on clarity, strength of position, and quality of evidence. "
            "Both sides had equal opportunity to make their case."
        )
        rebuttal_rule = (
            "- rebuttal: Set to 0 for both sides in round 1. "
            "No rebuttal is possible in the opening round."
        )
    else:
        phase_note = (
            f"This is ROUND {round_number}. "
            "Evaluate how effectively each side responded to the opponent. "
            "Reward both strong rebuttals AND strong defenses equally."
        )
        rebuttal_rule = (
            "- rebuttal (0–10): how effectively the opponent's argument was addressed. "
            "Score FOR and AGAINST symmetrically — defending a position is as valid as attacking one."
        )

    return f"""You are a strict and completely neutral debate judge.

{phase_note}

Evaluate BOTH sides independently on:
- logic (0–10): clarity and strength of reasoning
- evidence (0–10): use of real examples, facts, or concrete support
- persuasiveness (0–10): how convincing and well-articulated the argument is
- {rebuttal_rule}

CRITICAL RULES:
- Do NOT favor attacking over defending
- Do NOT favor criticism over well-supported arguments
- Score FOR and AGAINST using IDENTICAL standards — the same argument quality must yield the same score regardless of which side made it
- Penalize:
  - lack of clear stance
  - vague or unsupported claims
  - ignoring opponent arguments
  - recycling arguments or evidence already used in a prior round (heavy penalty)
  - reusing the same framing, phrasing, or sources from earlier rounds
  - exceeding 130 words — cap persuasiveness score at 6 if over the limit
- Reward:
  - clarity
  - strong reasoning
  - concrete evidence
  - direct engagement
  - introducing genuinely new points or angles each round

Return ONLY valid JSON:

{{
  "for": {{
    "logic": int,
    "evidence": int,
    "persuasiveness": int,
    "rebuttal": int,
    "total": int
  }},
  "against": {{
    "logic": int,
    "evidence": int,
    "persuasiveness": int,
    "rebuttal": int,
    "total": int
  }},
  "reasoning": "1-2 sentence explanation",
  "round_winner": "FOR or AGAINST",
  "best_argument": "strongest argument this round"
}}

=== DEBATE HISTORY ===
{history}
======================
"""


def get_verdict_prompt(history: str, scorecard: list) -> str:
    scorecard_str = "\n".join([
        f"Round {i+1}: FOR={r['for']['total']} | AGAINST={r['against']['total']} | Winner={r['round_winner']}"
        for i, r in enumerate(scorecard)
    ])

    return f"""You are the chief debate judge delivering the FINAL VERDICT.

ROUND SCORECARD:
{scorecard_str}

Review the FULL debate and deliver a final verdict.

Return ONLY valid JSON:

{{
  "winner": "FOR" | "AGAINST",
  "final_score": {{
    "for": <int>,
    "against": <int>
  }},
  "winning_arguments": [
    "<argument 1>",
    "<argument 2>",
    "<argument 3>"
  ],
  "losing_weaknesses": [
    "<weakness 1>",
    "<weakness 2>",
    "<weakness 3>"
  ],
  "turning_point": "<key moment>",
  "closing_statement": "<short summary>"
}}

=== FULL DEBATE HISTORY ===
{history}
===========================
"""