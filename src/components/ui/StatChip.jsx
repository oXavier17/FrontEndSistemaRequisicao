export default function StatChip({ icon, value, label, color, delay = 0 }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '16px 18px', display: 'flex',
      alignItems: 'center', gap: 14,
      animation: `fadeUp 0.3s ease ${delay}s both`,
      transition: 'border-color 0.2s', cursor: 'default'
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}