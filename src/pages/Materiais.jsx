import { useState } from 'react';
import { Package, CheckCircle, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import MaterialForm from '../components/materials/MaterialForm';
import MaterialTable from '../components/materials/MaterialTable';
import { useMateriais } from '../hooks/useMateriais';
import { useCategorias } from '../hooks/useCategorias';
import { useUnidades } from '../hooks/useUnidades';

function getStatusKey(m) {
  const ratio = m.estoqueMin > 0 ? m.estoqueAtual / m.estoqueMin : 1;
  if (ratio <= 0.5) return 'critical';
  if (ratio < 1)    return 'low';
  return 'ok';
}

export default function Materiais() {
  const { materiais, loading, erro, carregar, criar, editar, excluir } = useMateriais();
  const { categorias } = useCategorias();
  const { unidades }   = useUnidades();

  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  const total   = materiais.length;
  const normais = materiais.filter(m => getStatusKey(m) === 'ok').length;
  const baixos  = materiais.filter(m => getStatusKey(m) === 'low' || getStatusKey(m) === 'critical').length;

  const handleSave = async (form) => {
    try {
      setSalvando(true);
      setErroForm(null);
      if (editando) {
        await editar(editando.idMaterial, form);
        setEditando(null);
      } else {
        await criar(form);
      }
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    try {
      await excluir(id);
      if (editando?.idMaterial === id) setEditando(null);
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Gestão de <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Materiais</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Cadastre, edite e monitore o estoque de todos os materiais.</p>
        </div>
        <button onClick={carregar} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <StatChip icon={<Package size={18}/>}       value={total}   label="Total de Materiais" color="#4f6ef7" delay={0.02}/>
        <StatChip icon={<CheckCircle size={18}/>}   value={normais} label="Estoque Normal"     color="#10b981" delay={0.06}/>
        <StatChip icon={<AlertTriangle size={18}/>} value={baixos}  label="Estoque Baixo"      color="#f59e0b" delay={0.10}/>
      </div>

      {/* Erro global */}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={16}/>
          Erro ao carregar materiais: <strong>{erro}</strong>
          <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Tentar novamente</button>
        </div>
      )}

      {/* Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        <MaterialForm
          editando={editando}
          onSave={handleSave}
          onCancel={() => setEditando(null)}
          categorias={categorias}
          unidades={unidades}
          salvando={salvando}
          erroForm={erroForm}
          setErroForm={setErroForm}
        />
        <MaterialTable
          materiais={materiais}
          categorias={categorias}
          unidades={unidades}
          onEdit={setEditando}
          onDelete={handleDelete}
        />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}