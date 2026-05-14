import { useState, useEffect } from 'react';

const PRESET_TOPICS = [
  "AI will replace software engineers",
  "IITs are overrated",
  "Startups beat big tech careers",
  "Remote work kills culture",
  "Social media does more harm than good",
  "Crypto will never replace currency",
  "College degrees are becoming worthless",
  "Hustle culture is toxic",
];

const API = '';

export default function SetupScreen({ topic, setTopic, rounds, setRounds, onStart }) {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);

  const handleStart = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    await onStart(topic, rounds);
    setLoading(false);
  };

  const fetchRandom = async () => {
    try {
      const res = await fetch(`api/topics/random`);
      const data = await res.json();
      setTopic(data.topic);
    } catch {
      setTopic(PRESET_TOPICS[Math.floor(Math.random() * PRESET_TOPICS.length)]);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.tag}>ARENA v1.0</div>
        <h1 style={styles.title}>AI DEBATE<br />ARENA</h1>
        <p style={styles.subtitle}>
          Two AI agents clash. One judge decides. Ideas live or die by logic.
        </p>
      </div>

      {/* Topic input */}
      <div style={styles.inputSection}>
        <label style={styles.label}>THE MOTION</label>
        <div style={styles.inputWrapper}>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter a debate topic..."
            style={styles.textarea}
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
          />
          <button onClick={fetchRandom} style={styles.randomBtn} title="Random topic">
            ⚡
          </button>
        </div>
      </div>

      {/* Preset topics */}
      <div style={styles.presetsSection}>
        <label style={styles.label}>OR PICK A BATTLE</label>
        <div style={styles.presets}>
          {PRESET_TOPICS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTopic(t)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...styles.preset,
                ...(topic === t ? styles.presetActive : {}),
                ...(hovered === i && topic !== t ? styles.presetHover : {}),
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Rounds selector */}
      <div style={styles.roundsSection}>
        <label style={styles.label}>ROUNDS</label>
        <div style={styles.roundPicker}>
          {[1, 2, 3, 4, 5].map(r => (
            <button
              key={r}
              onClick={() => setRounds(r)}
              style={{
                ...styles.roundBtn,
                ...(rounds === r ? styles.roundBtnActive : {}),
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Agent cards */}
      <div style={styles.agents}>
        <div style={{ ...styles.agentCard, ...styles.forCard }}>
          <div style={styles.agentEmoji}>⚔️</div>
          <div style={styles.agentName}>ARIA</div>
          <div style={styles.agentRole}>Argues FOR</div>
        </div>
        <div style={styles.vsText}>VS</div>
        <div style={{ ...styles.agentCard, ...styles.againstCard }}>
          <div style={styles.agentEmoji}>🛡️</div>
          <div style={styles.agentName}>REX</div>
          <div style={styles.agentRole}>Argues AGAINST</div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!topic.trim() || loading}
        style={{
          ...styles.startBtn,
          ...((!topic.trim() || loading) ? styles.startBtnDisabled : {}),
        }}
      >
        {loading ? 'STARTING...' : 'BEGIN THE DEBATE'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '60px 24px 80px',
    animation: 'fadeUp 0.6s ease both',
  },
  header: {
    textAlign: 'center',
    marginBottom: 52,
  },
  tag: {
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.2em',
    color: 'var(--text-dim)',
    border: '1px solid var(--border)',
    padding: '4px 12px',
    borderRadius: 2,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(56px, 10vw, 96px)',
    letterSpacing: '0.06em',
    lineHeight: 0.9,
    background: 'linear-gradient(135deg, #fff 30%, #888 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    color: 'var(--text-mid)',
    fontSize: 18,
  },
  inputSection: { marginBottom: 32 },
  label: {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.25em',
    color: 'var(--text-dim)',
    marginBottom: 10,
  },
  inputWrapper: { position: 'relative' },
  textarea: {
    width: '100%',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: 18,
    padding: '14px 52px 14px 16px',
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.2s',
    lineHeight: 1.5,
  },
  randomBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 20,
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  presetsSection: { marginBottom: 32 },
  presets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 2,
    color: 'var(--text-mid)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  presetHover: {
    borderColor: 'var(--border-bright)',
    color: 'var(--text)',
  },
  presetActive: {
    background: 'var(--bg-3)',
    border: '1px solid var(--for-color)',
    color: 'var(--for-color)',
  },
  roundsSection: { marginBottom: 40 },
  roundPicker: { display: 'flex', gap: 8 },
  roundBtn: {
    width: 44,
    height: 44,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-mid)',
    fontFamily: 'var(--font-mono)',
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  roundBtnActive: {
    background: 'var(--bg-3)',
    border: '1px solid var(--for-color)',
    color: 'var(--for-color)',
  },
  agents: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  agentCard: {
    flex: 1,
    padding: '20px 16px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    textAlign: 'center',
    background: 'var(--bg-2)',
  },
  forCard: {
    borderColor: 'var(--for-dim)',
    background: 'linear-gradient(135deg, var(--bg-2), rgba(232,168,56,0.05))',
  },
  againstCard: {
    borderColor: 'var(--against-dim)',
    background: 'linear-gradient(135deg, var(--bg-2), rgba(91,142,240,0.05))',
  },
  agentEmoji: { fontSize: 28, marginBottom: 8 },
  agentName: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.1em',
  },
  agentRole: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-dim)',
    letterSpacing: '0.15em',
    marginTop: 4,
  },
  vsText: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    color: 'var(--text-dim)',
    letterSpacing: '0.1em',
  },
  startBtn: {
    width: '100%',
    padding: '18px',
    background: 'var(--text)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.12em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  startBtnDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
};
