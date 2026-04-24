import { useState, useEffect } from 'react';
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
import { useMovimentos } from '../hooks/useMovimentos';
import BuscaDropdown from '../components/ui/BuscaDropdown';

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
  const { movimentos, loading: loadingMov, carregar: carregarMov } = useMovimentos();
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
  const [buscaFornecedor, setBuscaFornecedor]       = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  // Movimentação
  const [mov, setMov]                 = useState(emptyMov);
  const [salvandoMov, setSalvandoMov] = useState(false);
  const [erroMov, setErroMov]         = useState(null);
  const [sucessoMov, setSucessoMov]   = useState(null);
  const [buscaMaterial, setBuscaMaterial] = useState('');
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  const total   = materiais.length;
  const normais = materiais.filter(m => getStatusKey(m) === 'ok').length;
  const baixos  = materiais.filter(m => getStatusKey(m) === 'low' || getStatusKey(m) === 'critical').length;

  const setMov_ = (field, value) => { setMov(m => ({ ...m, [field]: value })); setErroMov(null); setSucessoMov(null); };

  const materiaisFiltrados = materiais.filter(m =>
    m.status === 1 &&
    (m.nome ?? '').toLowerCase().includes(buscaMaterial.toLowerCase())
  ).slice(0, 8);
  
  useEffect(() => {
    carregarMov();
  }, [carregarMov]);

  const handleSave = async (form) => {
    try {
      setSalvando(true);
      setErroForm(null);

      // 1. VALIDAÇÃO DE NOME DUPLICADO
      // Comparamos em minúsculas para evitar "Papel" vs "papel"
      const nomeExiste = materiais.some(m => 
        m.nome.toLowerCase().trim() === form.nome.toLowerCase().trim() && 
        (!editando || m.idMaterial !== editando.idMaterial) // Se estiver editando, ignora o próprio material
      );

      if (nomeExiste) {
        setErroForm("Já existe um material cadastrado com este nome.");
        return; // Interrompe a execução
      }

      if (editando) {
        await editar(editando.idMaterial, form);
        setEditando(null);
      } else {
        await criar(form);
        // Opcional: setSucessoForm("Material cadastrado com sucesso!");
      }
      
      // Se chegou aqui, deu certo. 
      // Para limpar as caixas, o MaterialForm deve reagir ao fim do salvando ou resetar internamente.
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

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

      // ← Guarda o nome ANTES de limpar
      const material = materiais.find(m => m.idMaterial === Number(mov.materialId));

      await movimentar(mov);
      await carregarMov();

      // ← Limpa tudo depois do sucesso
      setMov(emptyMov);
      setBuscaMaterial('');
      setMaterialSelecionado(null);
      setFornecedorSelecionado(null);

      setSucessoMov(`${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'} de "${material?.nome}" registrada!`);
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
              <div style={{ position: 'relative' }}>

                {/* Input de busca */}
                <input
                  type="text"
                  value={buscaMaterial}
                  placeholder="Digite para buscar material..."
                  onChange={e => {
                    const value = e.target.value;
                    setBuscaMaterial(value);
                    setDropdownAberto(true);

                    if (!value) {
                      setMaterialSelecionado(null);
                      setMov_('materialId', '');
                    } else {
                      setMaterialSelecionado(null);
                      setMov_('materialId', '');
                    }
                  }}
                  onFocus={e => {
                    focusStyle(e);
                    setDropdownAberto(true);
                  }}
                  onBlur={e => {
                    blurStyle(e);
                    setTimeout(() => setDropdownAberto(false), 150);
                  }}
                  style={{
                    ...inputStyle,
                    // Borda verde se selecionado, normal se não
                    borderColor: materialSelecionado ? 'rgba(16,185,129,0.4)' : 'var(--border)',
                    paddingRight: materialSelecionado ? 36 : 14,
                  }}
                />

                {/* Ícone de check quando selecionado */}
                {materialSelecionado && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontSize: 14 }}>
                    ✓
                  </span>
                )}

                {/* Dropdown de sugestões */}
                {dropdownAberto && buscaMaterial && materiaisFiltrados.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, marginTop: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                  }}>
                    {materiaisFiltrados.map(m => {
                      const ratio = m.estoqueMin > 0 ? m.estoqueAtual / m.estoqueMin : 1;
                      const cor = ratio <= 0.5 ? '#ef4444' : ratio < 1 ? '#f59e0b' : '#10b981';
                      return (
                        <div key={m.idMaterial}
                          onMouseDown={() => {
                            // onMouseDown ao invés de onClick para não conflitar com o onBlur
                            setMaterialSelecionado(m);
                            setBuscaMaterial(m.nome);
                            setMov_('materialId', m.idMaterial);
                            setDropdownAberto(false);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s',
                            borderBottom: '1px solid var(--border)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(79,110,247,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{m.nome}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                              {m.categoriaNome} · ID {m.idMaterial}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: cor, fontFamily: 'Syne' }}>
                              {m.estoqueAtual}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>
                              {m.unidade}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Sem resultados */}
                    {materiaisFiltrados.length === 0 && buscaMaterial && (
                      <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                        Nenhum material encontrado.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info do material selecionado */}
              {materialSelecionado && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '6px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: '#10b981' }}>
                    Estoque atual: <strong>{materialSelecionado.estoqueAtual} {materialSelecionado.unidade}</strong>
                  </span>
                  <button
                    onClick={() => { setMaterialSelecionado(null); setBuscaMaterial(''); setMov_('materialId', ''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>
                    ✕ Limpar
                  </button>
                </div>
              )}
            </Field>

            <Field label="Tipo *">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['entrada','saida'].map(t => (
                  <button key={t} type="button"
                    onClick={() => {
                      setMov(prev => ({
                        ...prev,
                        tipo: t,
                        // Limpa campos de entrada ao trocar para saída
                        ...(t === 'saida' && { fornecedorId: '', preco: '' }),
                      }));
                      setErroMov(null);
                      setSucessoMov(null);
                      if (t === 'saida') {
                        setFornecedorSelecionado(null);
                      }
                    }}
                    style={{
                      padding: '10px 6px', borderRadius: 10, fontSize: 12,
                      fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans',
                      transition: 'all 0.15s', border: '1px solid',
                      background: mov.tipo === t
                        ? t === 'entrada' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
                        : 'var(--surface2)',
                      borderColor: mov.tipo === t
                        ? t === 'entrada' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'
                        : 'var(--border)',
                      color: mov.tipo === t
                        ? t === 'entrada' ? '#10b981' : '#ef4444'
                        : 'var(--muted)',
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
                <BuscaDropdown
                  placeholder="Digite para buscar fornecedor..."
                  itens={fornecedores.map(f => ({
                    id:       f.idFornecedor,
                    label:    f.nome,
                    sublabel: `ID ${f.idFornecedor}`,
                  }))}
                  selecionado={fornecedorSelecionado}
                  onSelecionar={item => {
                    setFornecedorSelecionado(item);
                    setMov_('fornecedorId', item.id);
                  }}
                  onLimpar={() => {
                    setFornecedorSelecionado(null);
                    setMov_('fornecedorId', '');
                  }}
                />
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
                maxLength={150}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/>
                <div style={{ fontSize: 11, color: mov.observacao.length > 130 ? '#f59e0b' : 'var(--muted)', textAlign: 'right', marginTop: 4 }}>
                  {mov.observacao.length}/150
                </div>
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
      {/* HISTÓRICO DE MOVIMENTAÇÕES */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed' }}/>
            Histórico de Movimentações
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{movimentos.length} registros</span>
            <button onClick={carregarMov} disabled={loadingMov}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
              <RefreshCw size={12} style={{ animation: loadingMov ? 'spin 1s linear infinite' : 'none' }}/>
              Atualizar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loadingMov && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13 }}>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/> Carregando histórico...
          </div>
        )}

        {/* Vazio */}
        {!loadingMov && movimentos.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 13 }}>Nenhuma movimentação registrada ainda.</div>
          </div>
        )}

        {/* Tabela com scroll interno — substitua o div overflowX atual */}
        {!loadingMov && movimentos.length > 0 && (
          <div style={{
            overflowY: 'auto',
            overflowX: 'auto',
            maxHeight: '400px',          // ← altura máxima com scroll
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tipo', 'Material', 'Qtd', 'Fornecedor', 'Req. Vinculada', 'Preço Unit.', 'Observação', 'Data'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', fontSize: 11, fontWeight: 500,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'var(--muted)', padding: '11px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--surface)', // ← fundo sólido para não vazar
                      whiteSpace: 'nowrap',
                      position: 'sticky', top: 0, zIndex: 1, // ← header fixo
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movimentos.map(m => (
                  <tr key={m.idMovimento}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                    {/* Tipo */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: m.tipo === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: m.tipo === 0 ? '#10b981' : '#ef4444',
                      }}>
                        {m.tipo === 0 ? '▲ Entrada' : '▼ Saída'}
                      </span>
                    </td>

                    {/* Material */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                      {m.materialNome}
                    </td>

                    {/* Quantidade */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'Syne', fontSize: 14, fontWeight: 700,
                      color: m.tipo === 0 ? '#10b981' : '#ef4444',
                    }}>
                      {m.tipo === 0 ? '+' : '-'}{m.quantidade}
                    </td>

                    {/* Fornecedor */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: m.fornecedorNome ? 'var(--text)' : 'var(--muted)' }}>
                      {m.fornecedorNome ?? '—'}
                    </td>

                    {/* Requisição vinculada */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      {m.requisicaoId
                        ? <span style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                            #{String(m.requisicaoId).padStart(4, '0')}
                          </span>
                        : <span style={{ fontSize: 13, color: 'var(--muted)' }}>—</span>
                      }
                    </td>

                    {/* Preço */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: m.preco ? 'var(--text)' : 'var(--muted)' }}>
                      {m.preco
                        ? `R$ ${Number(m.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : '—'
                      }
                    </td>

                    {/* Observação */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: m.observacao ? 'var(--text)' : 'var(--muted)', maxWidth: 220 }}>
                      <span
                        style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        title={m.observacao ?? ''} // ← tooltip com texto completo ao passar o mouse
                      >
                        {m.observacao ?? '—'}
                      </span>
                    </td>

                    {/* Data */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {m.dataMovimento
                        ? new Date(m.dataMovimento).toLocaleString('pt-BR')
                        : '—'
                      }
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}