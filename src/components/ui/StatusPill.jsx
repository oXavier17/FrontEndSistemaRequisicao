const styles = {
  pendente:  { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  aprovado:  { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  rejeitado: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  transito:  { bg: 'rgba(79,110,247,0.1)',  color: '#4f6ef7' },
};

export default function StatusPill({ status }) {
  const labels = { pendente: 'Pendente', aprovado: 'Aprovado', rejeitado: 'Rejeitado', transito: 'Em trânsito' };
  const s = styles[status] || styles.pendente;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.color
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {labels[status]}
    </span>
  );
}