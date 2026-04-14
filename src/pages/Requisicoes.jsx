import { useState } from 'react';
import { ClipboardList, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Package, Plus, Save, X, Pencil } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import { useRequisicoes, STATUS_MAP } from '../hooks/useRequisicoes';
import { useMateriais } from '../hooks/useMateriais';
import { useAuth } from '../hooks/useAuth';

function formatarData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoje.toDateString())  return `Hoje, ${hora}`;
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return d.toLocaleDateString('pt-BR') + `, ${hora}`;
}

const FILTROS = [
  { key: 'todos', label: 'Todas'        },
  { key: '1',     label: 'Abertas'      },
  { key: '2',     label: 'Em Separação' },
  { key: '3',     label: 'Prontas'      },
  { key: '4',     label: 'Entregues'    },
  { key: '5',     label: 'Canceladas'   },
];

function proximosStatus(statusAtual) {
  const map = {
    1: [{ status: 2, label: 'Iniciar Separação' }, { status: 5, label: 'Cancelar' }],
    2: [{ status: 3, label: 'Marcar como Pronta'  }, { status: 5, label: 'Cancelar' }],
    3: [{ status: 4, label: 'Confirmar Entrega'   }],
    4: [],
    5: [],
  };
  return map[statusAtual] ?? [];
}

const emptyForm = { observacao: '' };

export default function Requisicoes() {
  const { requisicoes, loading, erro, carregar, atualizarStatus, cancelar, criar: criarRequisicao, editarQuantidade } = useRequisicoes();
  const { materiais } = useMateriais();
  const { usuario, isAdmin, isFuncionario, isRequisitante } = useAuth();

  // ── Estados da tabela ──
  const [filtro, setFiltro]           = useState('todos');
  const [busca, setBusca]             = useState('');
  const [expandida, setExpandida]     = useState(null);
  const [atualizando, setAtualizando] = useState(null);

  // ── Estados do form de nova requisição ──
  const [form, setForm]         = useState(emptyForm);
  const [itens, setItens]       = useState([]); // [{ materialId, nomeMaterial, quantidade, nomeUnidade }]
  const [matSel, setMatSel]     = useState('');
  const [qtdSel, setQtdSel]     = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  // ── Estados de edição de quantidade na tabela ──
  const [editandoItem, setEditandoItem] = useState(null); // { reqId, materialId, quantidade }

  // ──────────────────────────────────────────────
  // Filtragem da tabela
  // ──────────────────────────────────────────────
  const visiveis = requisicoes
    .filter(r => {
      if (isRequisitante) return r.requisitanteId === usuario.idUsuario; // ← só as suas
      return true; // Admin e Funcionário veem todas
    })
    .filter(r => filtro === 'todos' || String(r.status) === filtro)
    .filter(r =>
      String(r.idRequisicao).includes(busca) ||
      r.nomeRequisitante?.toLowerCase().includes(busca.toLowerCase()) ||
      r.nomeDepartamento?.toLowerCase().includes(busca.toLowerCase())
    );

  const total     = visiveis.length;
  const abertas   = visiveis.filter(r => r.status === 1).length;
  const andamento = visiveis.filter(r => r.status === 2 || r.status === 3).length;
  const entregues = visiveis.filter(r => r.status === 4).length;

  // ──────────────────────────────────────────────
  // Form — adicionar item à lista
  // ──────────────────────────────────────────────
  const handleAdicionarItem = () => {
    if (!matSel || !qtdSel || Number(qtdSel) <= 0) {
      setErroForm('Selecione o material e informe uma quantidade válida.'); return;
    }
    if (itens.find(i => i.materialId === Number(matSel))) {
      setErroForm('Este material já foi adicionado.'); return;
    }
    const mat = materiais.find(m => m.idMaterial === Number(matSel));
    setItens(prev => [...prev, {
      materialId:   mat.idMaterial,
      nomeMaterial: mat.nome,
      quantidade:   Number(qtdSel),
      nomeUnidade:  mat.nomeUnidade ?? '',
    }]);
    setMatSel('');
    setQtdSel('');
    setErroForm(null);
  };

  const handleRemoverItem = (materialId) => {
    setItens(prev => prev.filter(i => i.materialId !== materialId));
  };

  const handleLimparForm = () => {
    setForm(emptyForm);
    setItens([]);
    setMatSel('');
    setQtdSel('');
    setErroForm(null);
  };

  const handleCriar = async () => {
    if (itens.length === 0) {
      setErroForm('Adicione pelo menos um material.'); return;
    }
    try {
      setSalvando(true);
      setErroForm(null);

      await criarRequisicao({
        requisitanteId: usuario.idUsuario, // ← usa o id do usuário logado
        observacao: form.observacao || null,
        itens: itens.map(i => ({
          idMaterial: i.materialId,
          quantidade: i.quantidade,
        })),
      });
      handleLimparForm();
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

  // ──────────────────────────────────────────────
  // Ações da tabela
  // ──────────────────────────────────────────────
  const handleStatus = async (id, novoStatus) => {
    // 1. Se o novo status for "Cancelado" (5), pede confirmação
    if (novoStatus === 5) {
      const confirmou = window.confirm("Tem certeza que deseja cancelar esta requisição? Esta ação não pode ser desfeita.");
      if (!confirmou) return; // Interrompe se o usuário clicar em "Cancelar" no aviso
    }

    try {
      setAtualizando(id);
      
      // 2. Se for cancelamento, usa a função cancelar do hook, senão usa atualizarStatus
      if (novoStatus === 5) {
        await cancelar(id);
      } else {
        await atualizarStatus(id, novoStatus);
      }

    } catch (e) {
      alert('Erro ao atualizar: ' + e.message);
    } finally {
      setAtualizando(null);
    }
  };

  const handleSalvarQtd = async (reqId, materialId) => {
    if (!editandoItem?.quantidade || Number(editandoItem.quantidade) <= 0) return;

    try {
      await editarQuantidade(reqId, materialId, Number(editandoItem.quantidade));
      setEditandoItem(null);
    } catch (e) {
      alert("Erro ao atualizar quantidade: " + e.message);
    }
  };

  // ──────────────────────────────────────────────
  // Estilos compartilhados
  // ──────────────────────────────────────────────
  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '9px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    transition: 'all 0.2s', width: '100%',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none'; };

  const TH = ({ children }) => (
    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', padding: '11px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* ── CABEÇALHO ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Gestão de <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Requisições</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Abra e gerencie todas as requisições de materiais.</p>
        </div>
        <button onClick={carregar} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
          Atualizar
        </button>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatChip icon={<ClipboardList size={18}/>} value={total}     label="Total"        color="#4f6ef7" delay={0.02}/>
        <StatChip icon={<ClipboardList size={18}/>} value={abertas}   label="Abertas"      color="#f59e0b" delay={0.06}/>
        <StatChip icon={<ClipboardList size={18}/>} value={andamento} label="Em Andamento" color="#7c3aed" delay={0.10}/>
        <StatChip icon={<ClipboardList size={18}/>} value={entregues} label="Entregues"    color="#10b981" delay={0.14}/>
      </div>

      {/* ── FORM NOVA REQUISIÇÃO (largura total) ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.1s both' }}>

        {/* Header do form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
            Nova Requisição
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{itens.length} {itens.length === 1 ? 'item adicionado' : 'itens adicionados'}</span>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Linha: seletor de material + quantidade + botão */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 12, alignItems: 'end' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Material *</label>
              <select value={matSel}
                onChange={e => { setMatSel(e.target.value); setErroForm(null); }}
                style={{ ...inputStyle, color: matSel ? 'var(--text)' : 'var(--muted)' }}
                onFocus={focusStyle} onBlur={blurStyle}>
                <option value="" disabled>Selecione o material...</option>
                {materiais
                  .filter(m => !itens.find(i => i.materialId === m.idMaterial))
                  .map(m => (
                    <option key={m.idMaterial} value={m.idMaterial}>
                      {m.nome} — estoque: {m.estoqueAtual}
                    </option>
                  ))
                }
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Quantidade *</label>
              <input type="number" min="1" value={qtdSel} placeholder="0"
                onChange={e => { setQtdSel(e.target.value); setErroForm(null); }}
                onKeyDown={e => e.key === 'Enter' && handleAdicionarItem()}
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}/>
            </div>

            <button onClick={handleAdicionarItem}
              style={{ padding: '9px 16px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s', whiteSpace: 'nowrap', marginTop: 22 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text)'; }}>
              <Plus size={14}/> Adicionar
            </button>
          </div>

          {/* Lista de itens adicionados */}
          {itens.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Itens da requisição</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {itens.map(item => (
                  <div key={item.materialId} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
                    <Package size={14} color="var(--muted)" style={{ flexShrink: 0 }}/>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.nomeMaterial}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600 }}>
                      {item.quantidade} {item.nomeUnidade}
                    </span>
                    <button onClick={() => handleRemoverItem(item.materialId)}
                      style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s', flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#ef4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                      <X size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observação */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Observação <span style={{ fontWeight: 400 }}>(opcional)</span></label>
            <textarea value={form.observacao}
              onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
              placeholder="Ex: Urgente para apresentação na sexta..."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={focusStyle} onBlur={blurStyle}/>
          </div>

          {/* Erro */}
          {erroForm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
              <AlertCircle size={13}/> {erroForm}
            </div>
          )}

          <div style={{ height: 1, background: 'var(--border)' }}/>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={handleLimparForm} disabled={salvando}
              style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>
              Limpar
            </button>
            <button onClick={handleCriar} disabled={salvando || itens.length === 0}
              style={{ padding: '10px 24px', borderRadius: 10, background: salvando || itens.length === 0 ? 'var(--surface2)' : 'var(--accent)', border: 'none', color: salvando || itens.length === 0 ? 'var(--muted)' : 'white', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvando || itens.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s' }}>
              {salvando
                ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Abrindo...</>
                : <><Save size={13}/> Abrir Requisição</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── ERRO GLOBAL ── */}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={16}/>
          Erro ao carregar requisições: <strong>{erro}</strong>
          <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Tentar novamente</button>
        </div>
      )}

      {/* ── TABELA ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.2s both' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTROS.map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)}
                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s',
                  background: filtro === f.key ? 'var(--accent-glow)' : 'var(--surface2)',
                  border: `1px solid ${filtro === f.key ? 'rgba(79,110,247,0.3)' : 'var(--border)'}`,
                  color: filtro === f.key ? 'var(--accent)' : 'var(--muted)',
                }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por ID, nome..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', width: 160 }}/>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{visiveis.length} requisições</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13 }}>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }}/> Carregando requisições...
          </div>
        )}

        {/* Vazio */}
        {!loading && requisicoes.length === 0 && !erro && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Nenhuma requisição encontrada</div>
            <div style={{ fontSize: 13 }}>Use o formulário acima para abrir a primeira.</div>
          </div>
        )}

        {/* Tabela */}
        {!loading && visiveis.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <TH>ID</TH>
                <TH>Requisitante</TH>
                <TH>Departamento</TH>
                <TH>Itens</TH>
                <TH>Data</TH>
                <TH>Status</TH>
                <TH>Ações</TH>
                <TH></TH>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(r => {
                const st       = STATUS_MAP[r.status];
                const initials = r.nomeRequisitante
                  ? r.nomeRequisitante.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
                  : '??';
                const aberta   = expandida === r.idRequisicao;
                const emAcao   = atualizando === r.idRequisicao;
                const proximos = proximosStatus(r.status);

                return (
                  <>
                    <tr key={r.idRequisicao}
                      style={{ transition: 'background 0.15s', background: aberta ? 'rgba(79,110,247,0.04)' : 'transparent' }}
                      onMouseEnter={e => { if (!aberta) e.currentTarget.style.background='rgba(255,255,255,0.015)'; }}
                      onMouseLeave={e => { if (!aberta) e.currentTarget.style.background='transparent'; }}>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)', fontSize: 12, fontFamily: 'Syne', color: 'var(--muted)', fontWeight: 600 }}>
                        #{String(r.idRequisicao).padStart(4,'0')}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${st.color},${st.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.nomeRequisitante}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)', fontSize: 13, color: 'var(--muted)' }}>
                        {r.nomeDepartamento}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 9px', fontSize: 12, color: 'var(--muted)' }}>
                          <Package size={11}/> {r.itens?.length ?? 0} {r.itens?.length === 1 ? 'item' : 'itens'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
                        {formatarData(r.dataRequisicao)}
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: st.bg, color: st.color }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                          {st.label}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>

                          {/* ADMIN / FUNCIONÁRIO */}
                          {(isAdmin || isFuncionario) && (
                            proximos.length === 0
                              ? <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>
                              : proximos.map(p => (
                                  <button
                                    key={p.status}
                                    onClick={() => handleStatus(r.idRequisicao, p.status)}
                                    disabled={emAcao}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 8,
                                      fontSize: 11,
                                      fontWeight: 500,
                                      cursor: emAcao ? 'not-allowed' : 'pointer',
                                      fontFamily: 'DM Sans',
                                      transition: 'all 0.15s',
                                      whiteSpace: 'nowrap',
                                      background: p.status === 5 ? 'rgba(239,68,68,0.08)' : 'rgba(79,110,247,0.08)',
                                      border: p.status === 5 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(79,110,247,0.2)',
                                      color: p.status === 5 ? '#ef4444' : 'var(--accent)',
                                      opacity: emAcao ? 0.5 : 1,
                                    }}
                                  >
                                    {emAcao ? '...' : p.label}
                                  </button>
                                ))
                          )}

                          {/* REQUISITANTE */}
                          {isRequisitante && r.status === 1 && (
                            <button
                              onClick={() => handleStatus(r.idRequisicao, 5)}
                              disabled={emAcao}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 500,
                                cursor: emAcao ? 'not-allowed' : 'pointer',
                                fontFamily: 'DM Sans',
                                background: 'rgba(239,68,68,0.08)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#ef4444',
                                opacity: emAcao ? 0.5 : 1,
                              }}
                            >
                              Cancelar
                            </button>
                          )}

                          {isRequisitante && r.status !== 1 && (
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>
                          )}

                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <button onClick={() => { setExpandida(prev => prev === r.idRequisicao ? null : r.idRequisicao); setEditandoItem(null); }}
                          style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: aberta ? 'var(--accent-glow)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: aberta ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s' }}>
                          {aberta ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                        </button>
                      </td>
                    </tr>

                    {/* ── LINHA EXPANDIDA ── */}
                    {aberta && (
                      <tr key={`${r.idRequisicao}-detalhe`}>
                        <td colSpan={8} style={{ borderBottom: '1px solid var(--border)', background: 'rgba(79,110,247,0.03)', padding: '0 16px 16px 64px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' }}>

                            {/* Itens com edição de quantidade */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                                Itens da Requisição
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {r.itens?.map(item => {
                                  const esteEditando = editandoItem?.reqId === r.idRequisicao && editandoItem?.materialId === item.idMaterial;
                                  return (
                                    <div key={item.idMaterial} style={{ display: 'flex', alignItems: 'center', gap: 10, background: esteEditando ? 'rgba(79,110,247,0.06)' : 'var(--surface2)', border: `1px solid ${esteEditando ? 'rgba(79,110,247,0.25)' : 'var(--border)'}`, borderRadius: 10, padding: '8px 14px', transition: 'all 0.15s' }}>
                                      <Package size={14} color="var(--muted)" style={{ flexShrink: 0 }}/>
                                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.nomeMaterial}</span>

                                      {/* Modo visualização */}
                                      {!esteEditando && (
                                        <>
                                          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600 }}>
                                            {item.quantidade} {item.nomeUnidade}
                                          </span>
                                          {/* Botão editar quantidade — só em requisições abertas ou em separação */}
                                          {(r.status === 1 || r.status === 2) && (
                                            <button
                                              onClick={() => setEditandoItem({ reqId: r.idRequisicao, materialId: item.idMaterial, quantidade: String(item.quantidade) })}
                                              title="Editar quantidade"
                                              style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s', flexShrink: 0 }}
                                              onMouseEnter={e => { e.currentTarget.style.background='rgba(79,110,247,0.1)'; e.currentTarget.style.borderColor='rgba(79,110,247,0.2)'; e.currentTarget.style.color='#4f6ef7'; }}
                                              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                                              <Pencil size={11}/>
                                            </button>
                                          )}
                                        </>
                                      )}

                                      {/* Modo edição */}
                                      {esteEditando && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <input
                                            type="number" min="1"
                                            value={editandoItem.quantidade}
                                            onChange={e => setEditandoItem(prev => ({ ...prev, quantidade: e.target.value }))}
                                            onKeyDown={e => { if (e.key === 'Enter') handleSalvarQtd(r.idRequisicao, item.idMaterial); if (e.key === 'Escape') setEditandoItem(null); }}
                                            autoFocus
                                            style={{ width: 70, background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 8, padding: '4px 8px', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: 13, outline: 'none', textAlign: 'center' }}
                                          />
                                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{item.nomeUnidade}</span>
                                          {/* Salvar */}
                                          <button onClick={() => handleSalvarQtd(r.idRequisicao, item.idMaterial)}
                                            style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                                            <Save size={11}/>
                                          </button>
                                          {/* Cancelar */}
                                          <button onClick={() => setEditandoItem(null)}
                                            style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                                            <X size={11}/>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Detalhes */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                                Detalhes
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Abertura</div>
                                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatarData(r.dataRequisicao)}</div>
                                </div>
                                {r.dataEnvio && (
                                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Envio</div>
                                    <div style={{ fontSize: 13, color: 'var(--text)' }}>{formatarData(r.dataEnvio)}</div>
                                  </div>
                                )}
                                {r.observacao && (
                                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Observação</div>
                                    <div style={{ fontSize: 13, color: 'var(--text)' }}>{r.observacao}</div>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && requisicoes.length > 0 && visiveis.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Nenhuma requisição encontrada para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}