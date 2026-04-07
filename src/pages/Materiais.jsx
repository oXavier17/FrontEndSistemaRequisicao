import { useState } from 'react';
import { Package, CheckCircle, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import MaterialForm from '../components/materials/MaterialForm';
import MaterialTable from '../components/materials/MaterialTable';
import CadastroSimples from '../components/materials/CadastroSimples';
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
  const { materiais, setMateriais, loading, erro, carregar, criar, editar, excluir } = useMateriais();
  const { categorias, criar: criarCategoria, editar: editarCategoria, excluir: excluirCategoria } = useCategorias();
  const { unidades,   criar: criarUnidade,   editar: editarUnidade,   excluir: excluirUnidade   } = useUnidades();

  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  // Movimentação
  const [mov, setMov]             = useState({ materialId: '', tipo: 'entrada', quantidade: '' });
  const [salvandoMov, setSalvandoMov] = useState(false);
  const [erroMov, setErroMov]         = useState(null);
  const [sucessoMov, setSucessoMov]   = useState(null);

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

  const handleMovimentacao = async () => {
    if (!mov.materialId || !mov.quantidade || Number(mov.quantidade) <= 0) {
      setErroMov('Selecione o material e informe uma quantidade válida.'); return;
    }
    try {
      setSalvandoMov(true);
      setErroMov(null);
      setSucessoMov(null);

      const qtd = Number(mov.quantidade);

      // Mock local — substituir por API quando back estiver pronto
      // ex: await api.post(`/materiais/${mov.materialId}/movimentacao`, { tipo: mov.tipo, quantidade: qtd })
      setMateriais(prev => prev.map(m => {
        if (m.idMaterial !== Number(mov.materialId)) return m;
        const novoEstoque = mov.tipo === 'entrada'
          ? m.estoqueAtual + qtd
          : Math.max(0, m.estoqueAtual - qtd);
        return { ...m, estoqueAtual: novoEstoque };
      }));

      const material = materiais.find(m => m.idMaterial === Number(mov.materialId));
      setSucessoMov(`${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'} de ${qtd} unidade(s) de "${material?.nome}" registrada com sucesso.`);
      setMov({ materialId: '', tipo: 'entrada', quantidade: '' });
    } catch (e) {
      setErroMov(e.message);
    } finally {
      setSalvandoMov(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

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

      {/* Workspace — form + tabela */}
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

      {/* Cards de Categoria e Unidade lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <CadastroSimples
          titulo="Categorias"
          cor="var(--accent)"
          itens={categorias}
          idKey="idCategoria"
          onCriar={criarCategoria}
          onEditar={editarCategoria}
          onExcluir={excluirCategoria}
          placeholder="Ex: Papelaria, Informática..."
        />
        <CadastroSimples
          titulo="Unidades de Medida"
          cor="#10b981"
          itens={unidades}
          idKey="idUnMed"
          onCriar={criarUnidade}
          onEditar={editarUnidade}
          onExcluir={excluirUnidade}
          placeholder="Ex: un, cx, kg, resma..."
        />
      </div>

      {/* Card de Movimentação */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.2s both' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}/>
            Movimentação de Estoque
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Registre entradas e saídas manualmente</span>
        </div>

        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 200px 160px auto', gap: 12, alignItems: 'end' }}>

          {/* Material */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Material *</label>
            <select
              value={mov.materialId}
              onChange={e => { setMov(m => ({ ...m, materialId: e.target.value })); setErroMov(null); setSucessoMov(null); }}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: mov.materialId ? 'var(--text)' : 'var(--muted)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', width: '100%' }}>
              <option value="" disabled>Selecione o material...</option>
              {materiais.map(m => (
                <option key={m.idMaterial} value={m.idMaterial}>
                  {m.nome} — estoque: {m.estoqueAtual} {unidades.find(u => u.idUnMed === m.unMedId)?.nome ?? ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Tipo *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {['entrada','saida'].map(t => (
                <button key={t} type="button" onClick={() => setMov(m => ({ ...m, tipo: t }))}
                  style={{ padding: '10px 8px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s', border: '1px solid',
                    background: mov.tipo === t ? t === 'entrada' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' : 'var(--surface2)',
                    borderColor: mov.tipo === t ? t === 'entrada' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' : 'var(--border)',
                    color: mov.tipo === t ? t === 'entrada' ? '#10b981' : '#ef4444' : 'var(--muted)',
                  }}>
                  {t === 'entrada' ? '▲ Entrada' : '▼ Saída'}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Quantidade *</label>
            <input type="number" min="1" value={mov.quantidade}
              onChange={e => { setMov(m => ({ ...m, quantidade: e.target.value })); setErroMov(null); setSucessoMov(null); }}
              placeholder="0"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', width: '100%' }}
              onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; }}
              onBlur={e  => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none'; }}
            />
          </div>

          {/* Botão */}
          <button onClick={handleMovimentacao} disabled={salvandoMov}
            style={{ padding: '10px 20px', borderRadius: 10, border: 'none', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvandoMov ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
              background: salvandoMov ? 'var(--surface2)' : mov.tipo === 'entrada' ? '#10b981' : '#ef4444',
              color: salvandoMov ? 'var(--muted)' : 'white',
              boxShadow: salvandoMov ? 'none' : mov.tipo === 'entrada' ? '0 4px 12px rgba(16,185,129,0.25)' : '0 4px 12px rgba(239,68,68,0.25)',
            }}
            onMouseEnter={e => { if (!salvandoMov) e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
            {salvandoMov
              ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Registrando...</>
              : mov.tipo === 'entrada' ? '▲ Registrar Entrada' : '▼ Registrar Saída'
            }
          </button>
        </div>

        {(erroMov || sucessoMov) && (
          <div style={{ margin: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '10px 14px', fontSize: 13,
            background: erroMov ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
            border: erroMov ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
            color: erroMov ? '#ef4444' : '#10b981',
          }}>
            {erroMov ? <AlertCircle size={14}/> : '✓'} {erroMov ?? sucessoMov}
          </div>
        )}
      </div>

    </div>
  );
}