export default function ArgumentBubble({ agent, text, isActive, roundNum }) {
  const isFor = agent === 'FOR';
  const color = isFor ? 'var(--for-color)' : 'var(--against-color)';
  const glow = isFor ? 'var(--for-glow)' : 'var(--against-glow)';
  const name = isFor ? 'ARIA' : 'REX';
  const label = isFor ? 'FOR' : 'AGAINST';
  const animName = isFor ? 'slideInLeft' : 'slideInRight';

  if (!text && !isActive) return null;

  return (
    <div style={{
      ...styles.wrapper,
      flexDirection: isFor ? 'row' : 'row-reverse',
      animation: `${animName} 0.4s ease both`,
    }}>
      {/* Avatar */}
      <div style={{
        ...styles.avatar,
        borderColor: color,
        boxShadow: isActive ? `0 0 20px ${glow}` : 'none',
        animation: isActive
          ? `${isFor ? 'glow-pulse-for' : 'glow-pulse-against'} 1.5s ease infinite`
          : 'none',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color }}>
          {name[0]}
        </span>
        {isActive && <div style={styles.activeDot} />}
      </div>

      {/* Bubble */}
      <div style={{
        ...styles.bubble,
        border: `1px solid ${isActive ? color : 'var(--border)'}`,
        background: isActive
          ? `linear-gradient(135deg, var(--bg-2), ${glow})`
          : 'var(--bg-2)',
        boxShadow: isActive ? `0 4px 24px ${glow}` : 'none',
        alignSelf: isFor ? 'flex-start' : 'flex-end',
      }}>
        {/* Header */}
        <div style={styles.bubbleHeader}>
          <span style={{ ...styles.agentLabel, color }}>{name}</span>
          <span style={styles.agentRole}>{label}</span>
          {roundNum && (
            <span style={styles.roundTag}>RD {roundNum}</span>
          )}
          {isActive && (
            <span style={styles.liveTag}>● LIVE</span>
          )}
        </div>

        {/* Text */}
        <div style={styles.bubbleText}>
          {text || ''}
          {isActive && (
            <span style={styles.cursor}>|</span>
          )}
        </div>

        {/* Word count */}
        {text && (
          <div style={styles.wordCount}>
            {text.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '2px solid',
    background: 'var(--bg-3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    transition: 'box-shadow 0.3s',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    background: '#4ade80',
    borderRadius: '50%',
    border: '2px solid var(--bg)',
    animation: 'pulse 1s ease infinite',
  },
  bubble: {
    flex: 1,
    maxWidth: 'calc(100% - 56px)',
    borderRadius: 'var(--radius-lg)',
    padding: '14px 16px',
    transition: 'all 0.3s',
  },
  bubbleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  agentLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    letterSpacing: '0.1em',
  },
  agentRole: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    letterSpacing: '0.15em',
  },
  roundTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: 'var(--text-dim)',
    background: 'var(--bg-3)',
    padding: '2px 6px',
    borderRadius: 2,
    letterSpacing: '0.1em',
    marginLeft: 'auto',
  },
  liveTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: '#4ade80',
    letterSpacing: '0.1em',
    animation: 'pulse 1.5s ease infinite',
  },
  bubbleText: {
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    lineHeight: 1.65,
    color: 'var(--text)',
  },
  cursor: {
    display: 'inline-block',
    animation: 'cursor-blink 0.8s step-end infinite',
    color: 'var(--text-dim)',
    marginLeft: 1,
  },
  wordCount: {
    marginTop: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    letterSpacing: '0.1em',
  },
};
