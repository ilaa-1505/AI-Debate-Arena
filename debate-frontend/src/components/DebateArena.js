import { useEffect, useRef } from 'react';
import ArgumentBubble from './ArgumentBubble';
import ScoreCard from './ScoreCard';
import CrowdMeter from './CrowdMeter';
import VerdictScreen from './VerdictScreen';

export default function DebateArena({
  topic, rounds, currentRound, activeAgent,
  forText, againstText, completedRounds,
  verdict, crowdMeter, phase, onReset,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    const threshold = 200; // px — if user is within this from bottom, keep scrolling
    const distanceFromBottom = document.documentElement.scrollHeight
      - window.scrollY
      - window.innerHeight;
    if (distanceFromBottom <= threshold) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [forText, againstText, completedRounds, verdict]);

  const isComplete = phase === 'complete';
  const isRunning = phase === 'running';

  // Compute running totals
  const forRunning = completedRounds.reduce((s, r) => s + (r.scores?.for?.total || 0), 0);
  const againstRunning = completedRounds.reduce((s, r) => s + (r.scores?.against?.total || 0), 0);

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button onClick={onReset} style={styles.backBtn}>← NEW DEBATE</button>
        </div>
        <div style={styles.topCenter}>
          <div style={styles.topicLabel}>THE MOTION</div>
          <div style={styles.topicText}>"{topic}"</div>
        </div>
        <div style={styles.topRight}>
          <div style={styles.roundIndicator}>
            {isComplete ? 'FINAL' : isRunning ? `RD ${currentRound}/${rounds}` : 'READY'}
          </div>
        </div>
      </div>

      {/* Running score strip */}
      {completedRounds.length > 0 && (
        <div style={styles.scoreStrip}>
          <div style={{ color: 'var(--for-color)', ...styles.stripScore }}>
            <span style={styles.stripName}>ARIA</span>
            <span style={styles.stripNum}>{forRunning}</span>
          </div>
          <div style={styles.stripDivider} />
          <div style={{ color: 'var(--against-color)', ...styles.stripScore }}>
            <span style={styles.stripNum}>{againstRunning}</span>
            <span style={styles.stripName}>REX</span>
          </div>
        </div>
      )}

      {/* Crowd meter */}
      {(isRunning || isComplete) && completedRounds.length > 0 && (
        <div style={styles.meterSection}>
          <div style={styles.meterLabel}>CROWD SENTIMENT</div>
          <CrowdMeter value={crowdMeter} />
        </div>
      )}

      {/* Main debate feed */}
      <div style={styles.feed}>
        {completedRounds.map((round, idx) => (
          <div key={idx} style={styles.roundBlock}>
            {/* Round header */}
            <div style={styles.roundHeader}>
              <div style={styles.roundLine} />
              <span style={styles.roundHeaderText}>ROUND {round.round}</span>
              <div style={styles.roundLine} />
            </div>

            {/* FOR argument */}
            <ArgumentBubble
              agent="FOR"
              text={round.forText}
              isActive={false}
              roundNum={round.round}
            />

            {/* AGAINST argument */}
            <ArgumentBubble
              agent="AGAINST"
              text={round.againstText}
              isActive={false}
              roundNum={round.round}
            />

            {/* Score card */}
            <ScoreCard round={round} />
          </div>
        ))}

        {/* Live round in progress — only show if this round isn't in completedRounds yet */}
        {isRunning && currentRound > completedRounds.length && (
          <div style={styles.roundBlock}>
            <div style={styles.roundHeader}>
              <div style={styles.roundLine} />
              <span style={styles.roundHeaderText}>ROUND {currentRound}</span>
              <div style={styles.roundLine} />
            </div>

            {/* FOR live */}
            {(activeAgent === 'FOR' || (forText && activeAgent !== null)) && (
              <ArgumentBubble
                agent="FOR"
                text={forText}
                isActive={activeAgent === 'FOR'}
                roundNum={currentRound}
              />
            )}

            {/* AGAINST live */}
            {(activeAgent === 'AGAINST' || (againstText && (activeAgent === 'JUDGE' || activeAgent === 'VERDICT'))) && (
              <ArgumentBubble
                agent="AGAINST"
                text={againstText}
                isActive={activeAgent === 'AGAINST'}
                roundNum={currentRound}
              />
            )}

            {/* Judge thinking */}
            {activeAgent === 'JUDGE' && (
              <div style={styles.judgingBar}>
                <div style={styles.judgingDots}>
                  <span style={{ ...styles.dot, animationDelay: '0ms' }} />
                  <span style={{ ...styles.dot, animationDelay: '200ms' }} />
                  <span style={{ ...styles.dot, animationDelay: '400ms' }} />
                </div>
                <span style={styles.judgingText}>THE JUDGE IS DELIBERATING</span>
              </div>
            )}
          </div>
        )}

        {/* Verdict agent thinking */}
        {activeAgent === 'VERDICT' && (
          <div style={styles.judgingBar}>
            <div style={styles.judgingDots}>
              <span style={{ ...styles.dot, animationDelay: '0ms' }} />
              <span style={{ ...styles.dot, animationDelay: '200ms' }} />
              <span style={{ ...styles.dot, animationDelay: '400ms' }} />
            </div>
            <span style={styles.judgingText}>DELIVERING FINAL VERDICT</span>
          </div>
        )}

        {/* Final verdict */}
        {isComplete && verdict && (
          <>
            <div style={styles.roundHeader}>
              <div style={styles.roundLine} />
              <span style={{ ...styles.roundHeaderText, color: 'var(--verdict-color)' }}>FINAL VERDICT</span>
              <div style={styles.roundLine} />
            </div>
            <VerdictScreen
              verdict={verdict}
              completedRounds={completedRounds}
              topic={topic}
              onReset={onReset}
            />
          </>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '0 16px 80px',
    animation: 'fadeIn 0.4s ease both',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid var(--border)',
    marginBottom: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  topLeft: { flexShrink: 0 },
  topCenter: { flex: 1, textAlign: 'center', minWidth: 0 },
  topRight: { flexShrink: 0 },
  backBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    padding: '6px 10px',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  topicLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.25em',
    color: 'var(--text-dim)',
    marginBottom: 4,
  },
  topicText: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    fontSize: 15,
    color: 'var(--text-mid)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roundIndicator: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    letterSpacing: '0.1em',
    color: 'var(--text-dim)',
  },
  scoreStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: '8px 0',
    marginBottom: 8,
  },
  stripScore: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  stripName: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    color: 'var(--text-dim)',
  },
  stripNum: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.05em',
  },
  stripDivider: {
    width: 1,
    height: 28,
    background: 'var(--border)',
  },
  meterSection: {
    marginBottom: 20,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
  },
  meterLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.25em',
    color: 'var(--text-dim)',
    marginBottom: 6,
  },
  feed: { display: 'flex', flexDirection: 'column', gap: 4 },
  roundBlock: { marginBottom: 24 },
  roundHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0 16px',
  },
  roundLine: {
    flex: 1,
    height: 1,
    background: 'var(--border)',
  },
  roundHeaderText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.25em',
    color: 'var(--text-dim)',
    flexShrink: 0,
  },
  judgingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--judge-color)',
    borderRadius: 'var(--radius)',
    marginTop: 8,
    animation: 'fadeIn 0.3s ease both',
  },
  judgingDots: { display: 'flex', gap: 4 },
  dot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--judge-color)',
    animation: 'pulse 1s ease infinite',
  },
  judgingText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.2em',
    color: 'var(--judge-color)',
  },
};