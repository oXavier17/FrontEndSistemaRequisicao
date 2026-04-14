import { useState } from 'react';
import { Package, CheckCircle, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import MaterialForm from '../components/materials/MaterialForm';
import MaterialTable from '../components/materials/MaterialTable';
import CadastroSimples from '../components/materials/CadastroSimples';
import { useMateriais } from '../hooks/useMateriais';
import { useCategorias } from '../hooks/useCategorias';
import { useFornecedores } from '../hooks/useFornecedores';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

function getStatusKey(m) {
  const ratio = m.estoqueMin > 0 ? m.estoqueAtual / m.estoqueMin : 1;
  if (ratio <= 0.5) return 'critical';
  if (ratio < 1)    return 'low';
  return 'ok';
}

// Enum espelhado do back-end para resolver label na tabela
const UNIDADE_LABEL = {
  UN: 'un', CX: 'cx', KG: 'kg', L: 'L',
  M: 'm', RESMA: 'resma', PCT: 'pct', PAR: 'par',
};

const emptyMov = { materialId: '', tipo: 'entrada', quantidade: '', fornecedorId: '', preco: '', observacao: '' };

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
  width: '100%', transition: 'all 0.2s',
};
const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

export default function Materiais() {
  const {
    materiais, setMateriais, loading, erro, carregar,
    criar, editar, movimentar, alterarStatus,
    mostrarInativos: mostrarInativosMat,
    setMostrarInativos: setMostrarInativosMat,
  } = useMateriais();
  const {
    categorias, mostrarInativos: mostrarInativosCat,
    setMostrarInativos: setMostrarInativosCat,
    criar: criarCategoria, editar: editarCategoria,
    alterarStatus: alterarStatusCategoria
  } = useCategorias();
  const {
    fornecedores, mostrarInativos: mostrarInativosForn,
    setMostrarInativos: setMostrarInativosForn,
    criar: criarFornecedor, editar: editarFornecedor,
    alterarStatus: alterarStatusFornecedor
  } = useFornecedores();
  const { isAdmin, isFuncionario } = useAuth();

  const materiaisAtivos   = materiais.filter(m => m.status === 1);
  const categoriasAtivas  = categorias.filter(c => c.status === 1);
  const fornecedoresAtivos = fornecedores.filter(f => f.status === 1);

  if (!isAdmin && !isFuncionario) return <Navigate to="/" replace />;

  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  // Movimentação
  const [mov, setMov]                 = useState(emptyMov);
  const [salvandoMov, setSalvandoMov] = useState(false);
  const [erroMov, setErroMov]         = useState(null);
  const [sucessoMov, setSucessoMov]   = useState(null);

  const total   = materiais.length;
  const normais = materiais.filter(m => getStatusKey(m) === 'ok').length;
  const baixos  = materiais.filter(m => getStatusKey(m) === 'low' || getStatusKey(m) === 'critical').length;

  const setMov_ = (field, value) => { setMov(m => ({ ...m, [field]: value })); setErroMov(null); setSucessoMov(null); };

  const handleSave = async (form) => {
    try {
      setSalvando(true);
      setErroForm(null);
      if (editando) { await editar(editando.idMaterial, form); setEditando(null); }
      else { await criar(form); }
    } catch (e) { setErroForm(e.message); }
    finally { setSalvando(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    try {
      await excluir(id);
      if (editando?.idMaterial === id) setEditando(null);
    } catch (e) { alert('Erro ao excluir: ' + e.message); }
  };

  // Substitua o handleMovimentacao por:
  const handleMovimentacao = async () => {
    if (!mov.materialId || !mov.quantidade || Number(mov.quantidade) <= 0) {
      setErroMov('Selecione o material e informe uma quantidade válida.'); return;
    }
    if (mov.tipo === 'entrada' && !mov.fornecedorId) {
      setErroMov('Selecione o fornecedor para entrada de estoque.'); return;
    }
    if (mov.tipo === 'entrada' && (!mov.preco || Number(mov.preco) <= 0)) {
      setErroMov('Informe o preço unitário para entrada de estoque.'); return;
    }
    try {
      setSalvandoMov(true);
      setErroMov(null);
      setSucessoMov(null);

      await movimentar(mov); // ← chama o hook que chama a API e recarrega

      const material = materiais.find(m => m.idMaterial === Number(mov.materialId));
      setSucessoMov(`${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'} de "${material?.nome}" registrada!`);
      setMov(emptyMov);
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
          Erro ao carregar: <strong>{erro}</strong>
          <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Tentar novamente</button>
        </div>
      )}

      {/* Workspace — form + tabela */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        <MaterialForm
          editando={editando}
          onSave={handleSave}
          onCancel={() => setEditando(null)}
          categorias={categoriasAtivas}
          salvando={salvando}
          erroForm={erroForm}
          setErroForm={setErroForm}
        />
        <MaterialTable
          materiais={materiais}
          categorias={categoriasAtivas}
          onEdit={setEditando}
          onAlterarStatus={alterarStatus}
          mostrarInativos={mostrarInativosMat}
          onToggleInativos={() => setMostrarInativosMat(v => !v)}
        />
      </div>

      {/* Categorias + Fornecedores lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <CadastroSimples
          titulo="Categorias"
          cor="var(--accent)"
          itens={categorias}
          idKey="idCategoria"
          onCriar={criarCategoria}
          onEditar={editarCategoria}
          onAlterarStatus={alterarStatusCategoria}
          mostrarInativos={mostrarInativosCat}
          onToggleInativos={() => setMostrarInativosCat(v => !v)}
          placeholder="Ex: Papelaria, Informática..."
        />
        <CadastroSimples
          titulo="Fornecedores"
          cor="#10b981"
          itens={fornecedores}
          idKey="idFornecedor"
          onCriar={criarFornecedor}
          onEditar={editarFornecedor}
          onAlterarStatus={alterarStatusFornecedor}
          mostrarInativos={mostrarInativosForn}
          onToggleInativos={() => setMostrarInativosForn(v => !v)}
          placeholder="Ex: Distribuidora XYZ..."
        />
      </div>

      {/* Card de Movimentação */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}/>
            Movimentação de Estoque
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Registre entradas e saídas manualmente</span>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Linha 1 — Material + Tipo + Quantidade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 140px', gap: 12 }}>
            <Field label="Material *">
              <select value={mov.materialId} onChange={e => setMov_('materialId', e.target.value)}
                style={{ ...inputStyle, color: mov.materialId ? 'var(--text)' : 'var(--muted)' }}
                onFocus={focusStyle} onBlur={blurStyle}>
                <option value="" disabled>Selecione o material...</option>
                {materiaisAtivos.map(m => (
                  <option key={m.idMaterial} value={m.idMaterial}>
                    {m.nome} — estoque: {m.estoqueAtual} {UNIDADE_LABEL[m.unidade] ?? ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo *">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['entrada','saida'].map(t => (
                  <button key={t} type="button" onClick={() => { setMov_(  'tipo', t); }}
                    style={{ padding: '10px 6px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s', border: '1px solid',
                      background: mov.tipo === t ? t === 'entrada' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' : 'var(--surface2)',
                      borderColor: mov.tipo === t ? t === 'entrada' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' : 'var(--border)',
                      color: mov.tipo === t ? t === 'entrada' ? '#10b981' : '#ef4444' : 'var(--muted)',
                    }}>
                    {t === 'entrada' ? '▲ Entrada' : '▼ Saída'}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Quantidade *">
              <input type="number" min="1" value={mov.quantidade} placeholder="0"
                onChange={e => setMov_('quantidade', e.target.value)}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/>
            </Field>
          </div>

          {/* Linha 2 — campos extras que mudam conforme o tipo */}
          <div style={{ display: 'grid', gap: 12,
            gridTemplateColumns: mov.tipo === 'entrada' ? '1fr 160px 1fr' : '1fr',
          }}>

            {/* Fornecedor — só na entrada */}
            {mov.tipo === 'entrada' && (
              <Field label="Fornecedor *">
                <select value={mov.fornecedorId} onChange={e => setMov_('fornecedorId', e.target.value)}
                  style={{ ...inputStyle, color: mov.fornecedorId ? 'var(--text)' : 'var(--muted)' }}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="" disabled>Selecione o fornecedor...</option>
                  {fornecedoresAtivos.map(f => (
                    <option key={f.idFornecedor} value={f.idFornecedor}>{f.nome}</option>
                  ))}
                </select>
              </Field>
            )}

            {/* Preço — só na entrada */}
            {mov.tipo === 'entrada' && (
              <Field label="Preço Unitário *">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)', pointerEvents: 'none' }}>R$</span>
                  <input type="number" min="0" step="0.01" value={mov.preco} placeholder="0,00"
                    onChange={e => setMov_('preco', e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={focusStyle} onBlur={blurStyle}/>
                </div>
              </Field>
            )}

            {/* Observação — sempre visível */}
            <Field label="Observação">
              <input type="text" value={mov.observacao} placeholder="Ex: Compra mensal, reposição urgente..."
                onChange={e => setMov_('observacao', e.target.value)}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/>
            </Field>
          </div>

          {/* Erro / Sucesso */}
          {(erroMov || sucessoMov) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '10px 14px', fontSize: 13,
              background: erroMov ? 'rgba(239,68,68,0.08)'  : 'rgba(16,185,129,0.08)',
              border:     erroMov ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
              color:      erroMov ? '#ef4444' : '#10b981',
            }}>
              {erroMov ? <AlertCircle size={14}/> : '✓'} {erroMov ?? sucessoMov}
            </div>
          )}

          <div style={{ height: 1, background: 'var(--border)' }}/>

          {/* Botão */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleMovimentacao} disabled={salvandoMov}
              style={{ padding: '10px 24px', borderRadius: 10, border: 'none', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvandoMov ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
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
        </div>
      </div>

    </div>
  );
}