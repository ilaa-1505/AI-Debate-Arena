import './index.css';
import { useDebate } from './hooks/useDebate';
import SetupScreen from './components/SetupScreen';
import DebateArena from './components/DebateArena';

export default function App() {
  const debate = useDebate();

  return (
    <div style={{ minHeight: '100vh' }}>
      {debate.phase === 'setup' ? (
        <SetupScreen
          topic={debate.topic}
          setTopic={debate.setTopic}
          rounds={debate.rounds}
          setRounds={debate.setRounds}
          onStart={debate.startDebate}
        />
      ) : (
        <DebateArena
          topic={debate.topic}
          rounds={debate.rounds}
          currentRound={debate.currentRound}
          activeAgent={debate.activeAgent}
          forText={debate.forText}
          againstText={debate.againstText}
          completedRounds={debate.completedRounds}
          verdict={debate.verdict}
          crowdMeter={debate.crowdMeter}
          phase={debate.phase}
          onReset={debate.reset}
        />
      )}

      {debate.error && (
        <div style={styles.errorToast}>
          ⚠ {debate.error}
          <button onClick={debate.reset} style={styles.errorBtn}>RESET</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  errorToast: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#2a1515',
    border: '1px solid #7a2020',
    color: '#f08080',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: '0.1em',
    padding: '12px 20px',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    zIndex: 1000,
    animation: 'fadeUp 0.3s ease both',
  },
  errorBtn: {
    background: 'none',
    border: '1px solid #7a2020',
    color: '#f08080',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    padding: '4px 8px',
    borderRadius: 2,
    cursor: 'pointer',
  },
};
