import { ClipboardList, Clock, Package, Users, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import MiniBar from '../components/ui/MiniBar';
import StatusPill from '../components/ui/StatusPill';
import { useDashboard } from '../hooks/useDashboard';

// Status do banco → chave do StatusPill
// 1 Aberta, 2 Em Separação, 3 Pronta, 4 Entregue, 5 Cancelada
function statusParaChave(status) {
  const map = { 1: 'pendente', 2: 'transito', 3: 'transito', 4: 'aprovado', 5: 'rejeitado' };
  return map[status] ?? 'pendente';
}

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

// Cores por posição para o gráfico de departamentos
const CORES_DEPTO = ['#4f6ef7','#10b981','#f59e0b','#7c3aed','#ef4444','#6b7280','#06b6d4','#f97316'];

export default function Dashboard() {
  const { dados, loading, erro, carregar } = useDashboard();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--muted)', fontSize: 14 }}>
        <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }}/>
        Carregando dashboard...
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '18px 20px', fontSize: 13, color: '#ef4444' }}>
        <AlertCircle size={16}/>
        Erro ao carregar dashboard: <strong>{erro}</strong>
        <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // Calcula o maior total para normalizar as barras de departamento
  const maxDepto = Math.max(...(dados?.requisicoesPorDepartamento?.map(d => d.total) ?? [1]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* GREETING */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Bom dia, <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Xavier</span> 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Aqui está um resumo do sistema hoje.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'var(--muted)' }}>
            📅 {hoje}
          </div>
          <button onClick={carregar}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
            <RefreshCw size={13}/>
            Atualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatChip icon={<ClipboardList size={18}/>} value={dados?.totalRequisicoes      ?? 0} label="Requisições Totais"     color="#4f6ef7" delay={0.05}/>
        <StatChip icon={<Clock size={18}/>}         value={dados?.requisicoesPendentes  ?? 0} label="Pendentes de Aprovação" color="#f59e0b" delay={0.10}/>
        <StatChip icon={<Package size={18}/>}       value={dados?.totalItensEstoque     ?? 0} label="Itens em Estoque"       color="#10b981" delay={0.15}/>
        <StatChip icon={<Users size={18}/>}         value={dados?.totalUsuariosAtivos   ?? 0} label="Usuários Ativos"        color="#7c3aed" delay={0.20}/>
      </div>

      {/* PAINEL PRINCIPAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* TABELA REQUISIÇÕES RECENTES */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.25s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
              Requisições Recentes
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Ver todas →</span>
          </div>

          {(!dados?.requisicoesMaisRecentes || dados.requisicoesMaisRecentes.length === 0) ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Nenhuma requisição encontrada.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ID','Requisitante','Departamento','Status','Data'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.requisicoesMaisRecentes.map(r => {
                  const initials = r.nomeRequisitante.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
                  return (
                    <tr key={r.idRequisicao}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.015)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'Syne', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                        #{String(r.idRequisicao).padStart(4,'0')}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text)' }}>{r.nomeRequisitante}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)' }}>
                        {r.nomeDepartamento}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <StatusPill status={statusParaChave(r.status)}/>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        {formatarData(r.dataRequisicao)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ESTOQUE CRÍTICO */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.28s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warning)' }}/>
              Estoque Crítico
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Gerenciar →</span>
          </div>

          {(!dados?.estoqueCritico || dados.estoqueCritico.length === 0) ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              ✅ Nenhum item crítico no momento.
            </div>
          ) : (
            dados.estoqueCritico.map((item, i) => {
              const ratio = item.estoqueMin > 0 ? item.estoqueAtual / item.estoqueMin : 1;
              const cor = ratio <= 0.5 ? '#ef4444' : ratio < 1 ? '#f59e0b' : '#10b981';
              return (
                <div key={item.idMaterial} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < dados.estoqueCritico.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📦</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</div>
                    <MiniBar value={item.estoqueAtual} min={item.estoqueMin}/>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: cor }}>{item.estoqueAtual}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{item.nomeUnidade}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LINHA DE BAIXO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* AÇÕES RÁPIDAS */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.32s both' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent2)' }}/>
            Ações Rápidas
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 16 }}>
            {[
              ['📦', 'Novo Material',    '/materiais'],
              ['👤', 'Novo Usuário',     '/usuarios'],
              ['📋', 'Nova Requisição',  '/requisicoes'],
              ['🏢', 'Departamento',     '/departamentos'],
            ].map(([emoji, label, path]) => (
              <div key={label}
                onClick={() => window.location.href = path}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-glow)'; e.currentTarget.style.transform='scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.transform='scale(1)'; }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* REQUISIÇÕES POR DEPARTAMENTO */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.36s both' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warning)' }}/>
            Req. por Departamento
          </div>

          {(!dados?.requisicoesPorDepartamento || dados.requisicoesPorDepartamento.length === 0) ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Nenhum dado disponível.
            </div>
          ) : (
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dados.requisicoesPorDepartamento.map((d, i) => {
                const pct = Math.round((d.total / maxDepto) * 100);
                return (
                  <div key={d.nomeDepartamento} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)', width: 80, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.nomeDepartamento}
                    </span>
                    <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: CORES_DEPTO[i % CORES_DEPTO.length], borderRadius: 6, transition: 'width 0.5s ease' }}/>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', width: 20, textAlign: 'right', flexShrink: 0 }}>{d.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}