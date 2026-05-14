import { useState, useRef, useCallback } from 'react';

const API = '';

export function useDebate() {
  const [phase, setPhase] = useState('setup');
  const [topic, setTopic] = useState('');
  const [rounds, setRounds] = useState(3);
  const [sessionId, setSessionId] = useState(null);

  // Live streaming text per agent
  const [forText, setForText] = useState('');
  const [againstText, setAgainstText] = useState('');

  // Which agent is currently speaking
  const [activeAgent, setActiveAgent] = useState(null);

  // Completed rounds
  const [completedRounds, setCompletedRounds] = useState([]);

  // Current round number
  const [currentRound, setCurrentRound] = useState(0);

  // Final verdict
  const [verdict, setVerdict] = useState(null);

  // Error
  const [error, setError] = useState(null);

  // Crowd meter: -100 (against) to +100 (for)
  const [crowdMeter, setCrowdMeter] = useState(0);

  const evsRef = useRef(null);

  const startDebate = useCallback(async (topicOverride, roundsOverride) => {
    const t = topicOverride || topic;
    const r = roundsOverride || rounds;
    if (!t.trim()) return;

    setError(null);
    setForText('');
    setAgainstText('');
    setCompletedRounds([]);
    setVerdict(null);
    setCurrentRound(0);
    setActiveAgent(null);
    setCrowdMeter(0);

    try {
      const res = await fetch(`/api/debate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t, rounds: r }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to start debate');

      const sid = data.session_id;
      setSessionId(sid);
      setPhase('running');

      // Open SSE stream
      const evs = new EventSource(`/api/debate/run/${sid}`);
      evsRef.current = evs;

      let currentForText = '';
      let currentAgainstText = '';

      evs.addEventListener('agent_start', (e) => {
        const { agent, round } = JSON.parse(e.data);
        setActiveAgent(agent);
        if (round > 0) setCurrentRound(round);
        if (agent === 'FOR') {
          currentForText = '';
          setForText('');
        }
        if (agent === 'AGAINST') {
          currentAgainstText = '';
          setAgainstText('');
        }
      });

      evs.addEventListener('token', (e) => {
        const { agent, token } = JSON.parse(e.data);
        if (agent === 'FOR') {
          currentForText += token;
          setForText(currentForText);
        } else if (agent === 'AGAINST') {
          currentAgainstText += token;
          setAgainstText(currentAgainstText);
        }
      });

      evs.addEventListener('agent_end', (e) => {
        const { agent, text } = JSON.parse(e.data);
        if (agent === 'FOR') setForText(text);
        if (agent === 'AGAINST') setAgainstText(text);
      });

      evs.addEventListener('round_score', (e) => {
        const { round, scores } = JSON.parse(e.data);
        setActiveAgent(null);

        const forTotal = scores?.for?.total ?? 0;
        const againstTotal = scores?.against?.total ?? 0;
        const diff = forTotal - againstTotal;

        // Shift crowd meter based on round result
        setCrowdMeter(prev => {
          const shift = diff * 2.5;
          return Math.max(-100, Math.min(100, prev + shift));
        });

        setCompletedRounds(prev => [...prev, {
          round,
          forText: currentForText,
          againstText: currentAgainstText,
          scores,
          winner: scores?.round_winner,
          bestArgument: scores?.best_argument,
          reasoning: scores?.reasoning,
        }]);
      });

      evs.addEventListener('verdict', (e) => {
        const { verdict: v } = JSON.parse(e.data);
        setVerdict(v);
      });

      evs.addEventListener('done', () => {
        setPhase('complete');
        setActiveAgent(null);
        evs.close();
      });

      evs.addEventListener('error', (e) => {
        try {
          const { message } = JSON.parse(e.data);
          setError(message);
        } catch {
          setError('Connection error');
        }
        setPhase('error');
        evs.close();
      });

      evs.onerror = () => {
        if (evs.readyState === EventSource.CLOSED) return;
        setError('Lost connection to server');
        setPhase('error');
        evs.close();
      };

    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }, [topic, rounds]);

  const reset = useCallback(() => {
    if (evsRef.current) evsRef.current.close();
    setPhase('setup');
    setTopic('');
    setRounds(3);
    setSessionId(null);
    setForText('');
    setAgainstText('');
    setActiveAgent(null);
    setCompletedRounds([]);
    setCurrentRound(0);
    setVerdict(null);
    setError(null);
    setCrowdMeter(0);
  }, []);

  return {
    phase, topic, setTopic, rounds, setRounds,
    sessionId, forText, againstText,
    activeAgent, completedRounds, currentRound,
    verdict, error, crowdMeter,
    startDebate, reset,
  };
}
