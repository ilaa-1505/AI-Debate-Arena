export default function CrowdMeter({ value }) {
  const pct = (value + 100) / 2;

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>🛡 REX</span>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pct}%` }} />
        <div style={{ ...styles.thumb, left: `${pct}%` }} />
        <div style={styles.center} />
      </div>
      <span style={styles.label}>ARIA ⚔️</span>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 0',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.1em',
    color: 'var(--text-dim)',
    flexShrink: 0,
  },
  track: {
    flex: 1,
    height: 8,
    background: 'linear-gradient(to right, var(--against-dim), var(--bg-3), var(--for-dim))',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    background: 'linear-gradient(to right, rgba(91,142,240,0.3), rgba(232,168,56,0.3))',
    borderRadius: 4,
    transition: 'width 1s ease',
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 14,
    height: 14,
    background: 'var(--text)',
    borderRadius: '50%',
    border: '2px solid var(--bg)',
    boxShadow: '0 0 8px rgba(255,255,255,0.3)',
    transition: 'left 1s ease',
    zIndex: 2,
  },
  center: {
    position: 'absolute',
    left: '50%',
    top: '-4px',
    transform: 'translateX(-50%)',
    width: 1,
    height: 16,
    background: 'var(--border-bright)',
  },
};
