import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const METRICS = ['logic', 'evidence', 'persuasiveness', 'rebuttal'];
const METRIC_LABELS = { logic: 'Logic', evidence: 'Evidence', persuasiveness: 'Persuasion', rebuttal: 'Rebuttal' };

function ScoreBar({ label, forVal, againstVal }) {
  const total = 10;
  return (
    <div style={styles.scoreRow}>
      <span style={styles.scoreLabel}>{label}</span>
      <div style={styles.barTrack}>
        <div style={styles.barLeft}>
          <div style={{
            ...styles.barFill,
            width: `${(forVal / total) * 100}%`,
            background: 'var(--for-color)',
          }} />
        </div>
        <div style={styles.barCenter}>
          <span style={{ ...styles.barNum, color: 'var(--for-color)' }}>{forVal}</span>
          <span style={styles.barSep}>·</span>
          <span style={{ ...styles.barNum, color: 'var(--against-color)' }}>{againstVal}</span>
        </div>
        <div style={styles.barRight}>
          <div style={{
            ...styles.barFill,
            width: `${(againstVal / total) * 100}%`,
            background: 'var(--against-color)',
          }} />
        </div>
      </div>
    </div>
  );
}

export default function ScoreCard({ round }) {
  const { scores, winner, reasoning, bestArgument, round: roundNum } = round;
  const forScores = scores?.for || {};
  const againstScores = scores?.against || {};

  const radarData = METRICS.map(m => ({
    metric: METRIC_LABELS[m],
    FOR: forScores[m] || 0,
    AGAINST: againstScores[m] || 0,
  }));

  const winnerIsFor = winner === 'FOR';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.roundLabel}>ROUND {roundNum} — JUDGE'S VERDICT</div>
        <div style={{
          ...styles.winnerBadge,
          color: winnerIsFor ? 'var(--for-color)' : 'var(--against-color)',
          borderColor: winnerIsFor ? 'var(--for-color)' : 'var(--against-color)',
          background: winnerIsFor ? 'var(--for-glow)' : 'var(--against-glow)',
        }}>
          {winnerIsFor ? 'ARIA WINS ROUND' : 'REX WINS ROUND'}
        </div>
      </div>

      <div style={styles.barLegend}>
        <span style={{ color: 'var(--for-color)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em' }}>⚔ ARIA</span>
        <span style={{ color: 'var(--against-color)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em' }}>REX 🛡</span>
      </div>
      <div style={styles.bars}>
        {METRICS.map(m => (
          <ScoreBar
            key={m}
            label={METRIC_LABELS[m]}
            forVal={forScores[m] || 0}
            againstVal={againstScores[m] || 0}
          />
        ))}
      </div>

      {/* Totals */}
      <div style={styles.totals}>
        <div style={{ ...styles.total, color: 'var(--for-color)' }}>
          <span style={styles.totalNum}>{forScores.total || 0}</span>
          <span style={styles.totalLabel}>ARIA TOTAL</span>
        </div>
        <div style={styles.totalDivider} />
        <div style={{ ...styles.total, color: 'var(--against-color)' }}>
          <span style={styles.totalNum}>{againstScores.total || 0}</span>
          <span style={styles.totalLabel}>REX TOTAL</span>
        </div>
      </div>

      {/* Radar chart */}
      <div style={styles.radarWrapper}>
        <ResponsiveContainer width="100%" height={180}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2a2a35" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b6b80', fontSize: 11, fontFamily: 'DM Mono' }} />
            <Radar name="FOR" dataKey="FOR" stroke="#e8a838" fill="#e8a838" fillOpacity={0.15} strokeWidth={2} />
            <Radar name="AGAINST" dataKey="AGAINST" stroke="#5b8ef0" fill="#5b8ef0" fillOpacity={0.15} strokeWidth={2} />
            <Tooltip
              contentStyle={{ background: '#111114', border: '1px solid #2a2a35', borderRadius: 4, fontFamily: 'DM Mono', fontSize: 12 }}
              labelStyle={{ color: '#e8e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Judge reasoning */}
      {reasoning && (
        <div style={styles.reasoning}>
          <span style={styles.quoteIcon}>"</span>
          {reasoning}
          <span style={styles.quoteIcon}>"</span>
        </div>
      )}

      {/* Best argument */}
      {bestArgument && bestArgument !== 'N/A' && (
        <div style={styles.bestArg}>
          <div style={styles.bestArgLabel}>⭐ BEST ARGUMENT THIS ROUND</div>
          <div style={styles.bestArgText}>{bestArgument}</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    animation: 'scaleIn 0.5s ease both',
    marginTop: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  roundLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.2em',
    color: 'var(--text-dim)',
  },
  winnerBadge: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    letterSpacing: '0.12em',
    border: '1px solid',
    padding: '4px 12px',
    borderRadius: 2,
  },
  barLegend: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bars: { marginBottom: 16 },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scoreLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    letterSpacing: '0.1em',
    width: 72,
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  barLeft: {
    flex: 1,
    height: 6,
    background: 'var(--bg-3)',
    borderRadius: 3,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  barRight: {
    flex: 1,
    height: 6,
    background: 'var(--bg-3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.8s ease',
  },
  barCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    minWidth: 36,
    justifyContent: 'center',
  },
  barNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 500,
  },
  barSep: {
    color: 'var(--text-dim)',
    fontSize: 10,
  },
  totals: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: '12px 0',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    marginBottom: 16,
  },
  total: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  totalNum: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    lineHeight: 1,
    letterSpacing: '0.05em',
  },
  totalLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: 'var(--text-dim)',
    letterSpacing: '0.15em',
  },
  totalDivider: {
    width: 1,
    height: 40,
    background: 'var(--border)',
  },
  radarWrapper: { marginBottom: 16 },
  reasoning: {
    fontFamily: 'var(--font-body)',
    fontStyle: 'italic',
    color: 'var(--text-mid)',
    fontSize: 15,
    lineHeight: 1.6,
    padding: '12px 16px',
    background: 'var(--bg-3)',
    borderRadius: 'var(--radius)',
    borderLeft: '3px solid var(--judge-color)',
    marginBottom: 12,
  },
  quoteIcon: {
    fontFamily: 'Georgia, serif',
    fontSize: 20,
    color: 'var(--text-dim)',
    margin: '0 4px',
  },
  bestArg: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 14px',
  },
  bestArgLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.15em',
    color: '#e8a838',
    marginBottom: 6,
  },
  bestArgText: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--text-mid)',
    lineHeight: 1.5,
  },
};
