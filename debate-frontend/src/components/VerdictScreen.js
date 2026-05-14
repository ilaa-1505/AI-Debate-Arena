export default function VerdictScreen({ verdict, completedRounds, topic, onReset }) {
  if (!verdict) return null;

  const winnerIsFor = verdict.winner === 'FOR';
  const winnerName = winnerIsFor ? 'ARIA' : 'REX';
  const winnerLabel = winnerIsFor ? 'FOR' : 'AGAINST';
  const winnerColor = winnerIsFor ? 'var(--for-color)' : 'var(--against-color)';
  const winnerGlow = winnerIsFor ? 'rgba(232,168,56,0.2)' : 'rgba(91,142,240,0.2)';

  const forTotal = verdict.final_score?.for || 0;
  const againstTotal = verdict.final_score?.against || 0;
  const totalPossible = completedRounds.length * 40;

  return (
    <div style={styles.container}>
      {/* Trophy */}
      <div style={styles.trophySection}>
        <div style={{ ...styles.trophyGlow, background: `radial-gradient(circle, ${winnerGlow}, transparent 70%)` }} />
        <div style={styles.trophy}>🏆</div>
        <div style={{ ...styles.winnerName, color: winnerColor }}>
          {winnerName}
        </div>
        <div style={styles.winnerSubtitle}>
          WINS THE DEBATE
        </div>
        <div style={styles.winnerRole}>Argued {winnerLabel}: "{topic}"</div>
      </div>

      {/* Final score bar */}
      <div style={styles.finalScoreSection}>
        <div style={styles.scoreHeader}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.bigScore, color: 'var(--for-color)' }}>{forTotal}</div>
            <div style={styles.bigScoreLabel}>ARIA</div>
          </div>
          <div style={styles.scoreDivider}>vs</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.bigScore, color: 'var(--against-color)' }}>{againstTotal}</div>
            <div style={styles.bigScoreLabel}>REX</div>
          </div>
        </div>
        <div style={styles.finalBar}>
          <div style={{
            ...styles.finalBarFor,
            width: `${totalPossible > 0 ? (forTotal / totalPossible) * 100 : 50}%`,
          }} />
          <div style={{
            ...styles.finalBarAgainst,
            width: `${totalPossible > 0 ? (againstTotal / totalPossible) * 100 : 50}%`,
          }} />
        </div>
      </div>

      {/* Turning point */}
      {verdict.turning_point && (
        <div style={styles.turningPoint}>
          <div style={styles.sectionLabel}>⚡ TURNING POINT</div>
          <p style={styles.turningText}>{verdict.turning_point}</p>
        </div>
      )}

      {/* Two columns: winning args + losing weaknesses */}
      <div style={styles.columns}>
        <div style={styles.column}>
          <div style={{ ...styles.colLabel, color: winnerColor }}>
            {winnerName}'S STRONGEST ARGUMENTS
          </div>
          {(verdict.winning_arguments || []).map((arg, i) => (
            <div key={i} style={styles.argItem}>
              <span style={{ ...styles.argNum, color: winnerColor }}>{i + 1}</span>
              <p style={styles.argText}>{arg}</p>
            </div>
          ))}
        </div>
        <div style={styles.column}>
          <div style={{ ...styles.colLabel, color: 'var(--text-dim)' }}>
            MISSED OPPORTUNITIES
          </div>
          {(verdict.losing_weaknesses || []).map((w, i) => (
            <div key={i} style={styles.weakItem}>
              <span style={styles.weakNum}>✗</span>
              <p style={styles.argText}>{w}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing statement */}
      {verdict.closing_statement && (
        <div style={styles.closing}>
          <span style={styles.closingQuote}>"</span>
          {verdict.closing_statement}
          <span style={styles.closingQuote}>"</span>
          <div style={styles.closingAttrib}>— The Judge</div>
        </div>
      )}

      {/* Debate again button */}
      <button onClick={onReset} style={styles.resetBtn}>
        DEBATE AGAIN
      </button>
    </div>
  );
}

const styles = {
  container: {
    animation: 'fadeUp 0.7s ease both',
    paddingBottom: 40,
  },
  trophySection: {
    textAlign: 'center',
    position: 'relative',
    padding: '40px 0 32px',
  },
  trophyGlow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 300,
    height: 200,
    pointerEvents: 'none',
  },
  trophy: {
    fontSize: 64,
    marginBottom: 12,
    animation: 'scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
    display: 'block',
  },
  winnerName: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(48px, 10vw, 80px)',
    letterSpacing: '0.1em',
    lineHeight: 1,
  },
  winnerSubtitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    letterSpacing: '0.3em',
    color: 'var(--text-dim)',
    marginTop: 8,
    marginBottom: 12,
  },
  winnerRole: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    color: 'var(--text-mid)',
    fontSize: 15,
    maxWidth: 400,
    margin: '0 auto',
  },
  finalScoreSection: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    marginBottom: 20,
  },
  scoreHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  bigScore: {
    fontFamily: 'var(--font-display)',
    fontSize: 52,
    lineHeight: 1,
    letterSpacing: '0.05em',
  },
  bigScoreLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    letterSpacing: '0.2em',
    marginTop: 4,
  },
  scoreDivider: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    color: 'var(--text-dim)',
    fontSize: 18,
  },
  finalBar: {
    display: 'flex',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
    background: 'var(--bg-3)',
  },
  finalBarFor: {
    height: '100%',
    background: 'var(--for-color)',
    borderRadius: '5px 0 0 5px',
    transition: 'width 1.2s ease',
  },
  finalBarAgainst: {
    height: '100%',
    background: 'var(--against-color)',
    borderRadius: '0 5px 5px 0',
    transition: 'width 1.2s ease',
  },
  turningPoint: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--verdict-color)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.2em',
    color: 'var(--text-dim)',
    marginBottom: 8,
  },
  turningText: {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    color: 'var(--text-mid)',
    lineHeight: 1.6,
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 20,
  },
  column: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
  },
  colLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    marginBottom: 14,
  },
  argItem: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  argNum: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    lineHeight: 1.2,
    flexShrink: 0,
  },
  argText: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--text-mid)',
    lineHeight: 1.55,
  },
  weakItem: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  weakNum: {
    color: '#e05555',
    fontSize: 14,
    flexShrink: 0,
    marginTop: 2,
  },
  closing: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    fontSize: 17,
    color: 'var(--text-mid)',
    textAlign: 'center',
    lineHeight: 1.7,
    padding: '20px 24px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 32,
  },
  closingQuote: {
    fontFamily: 'Georgia, serif',
    fontSize: 28,
    color: 'var(--text-dim)',
    margin: '0 6px',
  },
  closingAttrib: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-dim)',
    letterSpacing: '0.15em',
    marginTop: 10,
  },
  resetBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-mid)',
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    letterSpacing: '0.12em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
