import { useState } from 'react';
import { ClipboardList, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import { useRequisicoes, STATUS_MAP } from '../hooks/useRequisicoes';

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

// Ações disponíveis por status atual
function proximosStatus(statusAtual) {
  const map = {
    1: [{ status: 2, label: 'Iniciar Separação' }, { status: 5, label: 'Cancelar' }],
    2: [{ status: 3, label: 'Marcar como Pronta'  }, { status: 5, label: 'Cancelar' }],
    3: [{ status: 4, label: 'Confirmar Entrega'   }],
    4: [], // Entregue — finalizado
    5: [], // Cancelada — finalizado
  };
  return map[statusAtual] ?? [];
}

export default function Requisicoes() {
  const { requisicoes, loading, erro, carregar, atualizarStatus, cancelar } = useRequisicoes();

  const [filtro, setFiltro]           = useState('todos');
  const [busca, setBusca]             = useState('');
  const [expandida, setExpandida]     = useState(null); // id da requisição expandida
  const [atualizando, setAtualizando] = useState(null); // id em atualização

  const visíveis = requisicoes
    .filter(r => filtro === 'todos' || String(r.status) === filtro)
    .filter(r =>
      String(r.idRequisicao).includes(busca) ||
      r.nomeRequisitante.toLowerCase().includes(busca.toLowerCase()) ||
      r.nomeDepartamento.toLowerCase().includes(busca.toLowerCase())
    );

  const total      = requisicoes.length;
  const abertas    = requisicoes.filter(r => r.status === 1).length;
  const andamento  = requisicoes.filter(r => r.status === 2 || r.status === 3).length;
  const entregues  = requisicoes.filter(r => r.status === 4).length;
  const canceladas = requisicoes.filter(r => r.status === 5).length;

  const handleStatus = async (id, novoStatus) => {
    try {
      setAtualizando(id);
      if (novoStatus === 5) await cancelar(id);
      else await atualizarStatus(id, novoStatus);
    } catch (e) {
      alert('Erro ao atualizar: ' + e.message);
    } finally {
      setAtualizando(null);
    }
  };

  const toggleExpandir = (id) => setExpandida(prev => prev === id ? null : id);

  const TH = ({ children }) => (
    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', padding: '11px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Gestão de <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Requisições</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Acompanhe e gerencie todas as requisições de materiais.</p>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatChip icon={<ClipboardList size={18}/>} value={total}     label="Total"          color="#4f6ef7" delay={0.02}/>
        <StatChip icon={<ClipboardList size={18}/>} value={abertas}   label="Abertas"        color="#f59e0b" delay={0.06}/>
        <StatChip icon={<ClipboardList size={18}/>} value={andamento} label="Em Andamento"   color="#7c3aed" delay={0.10}/>
        <StatChip icon={<ClipboardList size={18}/>} value={entregues} label="Entregues"      color="#10b981" delay={0.14}/>
      </div>

      {/* Erro */}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={16}/>
          Erro ao carregar requisições: <strong>{erro}</strong>
          <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Tentar novamente</button>
        </div>
      )}

      {/* Tabela */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.15s both' }}>

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
            <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{visíveis.length} requisições</span>
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
            <div style={{ fontSize: 13 }}>As requisições criadas pelos requisitantes aparecerão aqui.</div>
          </div>
        )}

        {/* Tabela */}
        {!loading && visíveis.length > 0 && (
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
              {visíveis.map(r => {
                const st        = STATUS_MAP[r.status];
                const initials  = r.nomeRequisitante.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
                const aberta    = expandida === r.idRequisicao;
                const emAção    = atualizando === r.idRequisicao;
                const proximos  = proximosStatus(r.status);

                return (
                  <>
                    <tr key={r.idRequisicao}
                      style={{ transition: 'background 0.15s', background: aberta ? 'rgba(79,110,247,0.04)' : 'transparent' }}
                      onMouseEnter={e => { if (!aberta) e.currentTarget.style.background='rgba(255,255,255,0.015)'; }}
                      onMouseLeave={e => { if (!aberta) e.currentTarget.style.background='transparent'; }}>

                      {/* ID */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)', fontSize: 12, fontFamily: 'Syne', color: 'var(--muted)', fontWeight: 600 }}>
                        #{String(r.idRequisicao).padStart(4,'0')}
                      </td>

                      {/* Requisitante */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${st.color},${st.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.nomeRequisitante}</span>
                        </div>
                      </td>

                      {/* Departamento */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)', fontSize: 13, color: 'var(--muted)' }}>
                        {r.nomeDepartamento}
                      </td>

                      {/* Qtd itens */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 9px', fontSize: 12, color: 'var(--muted)' }}>
                          <Package size={11}/> {r.itens?.length ?? 0} {r.itens?.length === 1 ? 'item' : 'itens'}
                        </span>
                      </td>

                      {/* Data */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
                        {formatarData(r.dataRequisicao)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: st.bg, color: st.color }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                          {st.label}
                        </span>
                      </td>

                      {/* Ações de status */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {proximos.length === 0 && (
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>—</span>
                          )}
                          {proximos.map(p => (
                            <button key={p.status} onClick={() => handleStatus(r.idRequisicao, p.status)} disabled={emAção}
                              style={{
                                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: emAção ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s', whiteSpace: 'nowrap',
                                background: p.status === 5 ? 'rgba(239,68,68,0.08)' : 'rgba(79,110,247,0.08)',
                                border: `1px solid ${p.status === 5 ? 'rgba(239,68,68,0.2)' : 'rgba(79,110,247,0.2)'}`,
                                color: p.status === 5 ? '#ef4444' : 'var(--accent)',
                                opacity: emAção ? 0.5 : 1,
                              }}>
                              {emAção ? '...' : p.label}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Expandir */}
                      <td style={{ padding: '14px 16px', borderBottom: aberta ? 'none' : '1px solid var(--border)' }}>
                        <button onClick={() => toggleExpandir(r.idRequisicao)}
                          style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: aberta ? 'var(--accent-glow)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: aberta ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s' }}>
                          {aberta ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                        </button>
                      </td>
                    </tr>

                    {/* LINHA EXPANDIDA — itens da requisição */}
                    {aberta && (
                      <tr key={`${r.idRequisicao}-detalhe`}>
                        <td colSpan={8} style={{ borderBottom: '1px solid var(--border)', background: 'rgba(79,110,247,0.03)', padding: '0 16px 16px 64px' }}>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>

                            {/* Itens */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
                                Itens da Requisição
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {r.itens?.map(item => (
                                  <div key={item.idMaterial} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                                    <Package size={14} color="var(--muted)"/>
                                    <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{item.nomeMaterial}</span>
                                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600 }}>{item.quantidade} {item.nomeUnidade}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Observação + datas */}
                            <div style={{ minWidth: 220 }}>
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

        {/* Sem resultados na busca */}
        {!loading && requisicoes.length > 0 && visíveis.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Nenhuma requisição encontrada para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}