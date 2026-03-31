export default function MiniBar({ value, min }) {
  const ratio = min > 0 ? value / min : 1;
  const pct = Math.min(100, Math.round(ratio * 100));
  const color = ratio <= 0.5 ? '#ef4444' : ratio < 1 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ width: '100%', height: 4, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden', marginTop: 5 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
    </div>
  );
}