import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import MiniBar from '../ui/MiniBar';

const filtros = [
  { key: 'todos',    label: 'Todos'  },
  { key: 'ok',       label: 'Normal' },
  { key: 'low',      label: 'Baixo'  },
  { key: 'critical', label: 'Crítico'},
];

function getStatus(m) {
  const ratio = m.estoqueMin > 0 ? m.estoqueAtual / m.estoqueMin : 1;
  if (ratio <= 0.5) return { key: 'critical', label: 'Crítico', color: '#ef4444' };
  if (ratio < 1)    return { key: 'low',      label: 'Baixo',   color: '#f59e0b' };
  return               { key: 'ok',       label: 'Normal',  color: '#10b981' };
}

const TH = ({ children }) => (
  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', padding: '11px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', whiteSpace: 'nowrap' }}>
    {children}
  </th>
);

export default function MaterialTable({ materiais, categorias, unidades, onEdit, onDelete }) {
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca]   = useState('');

  const filtrados = materiais
    .filter(m => filtro === 'todos' || getStatus(m).key === filtro)
    .filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

  // Resolve nome da categoria/unidade pelo id
  const nomeCategoria = (id) => categorias.find(c => c.idCategoria === id)?.nome ?? '—';
  const nomeUnidade   = (id) => unidades.find(u => u.idUnMed === id)?.nome ?? '—';

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.12s both' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {filtros.map(f => (
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
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar material..."
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', width: 140 }}/>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{filtrados.length} materiais</span>
        </div>
      </div>

      {/* Vazio */}
      {materiais.length === 0 && (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Nenhum material cadastrado</div>
          <div style={{ fontSize: 13 }}>Use o formulário ao lado para adicionar o primeiro.</div>
        </div>
      )}

      {/* Tabela */}
      {filtrados.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <TH>Material</TH>
              <TH>Categoria</TH>
              <TH>Estoque</TH>
              <TH>Unidade</TH>
              <TH>Preço Unit.</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(m => {
              const st    = getStatus(m);
              const preco = Number(m.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
              return (
                <tr key={m.idMaterial}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{m.nome}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Syne' }}>ID {m.idMaterial}</div>
                    </div>
                  </td>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: 'rgba(79,110,247,0.1)', color: '#4f6ef7' }}>
                      {nomeCategoria(m.categoriaId)}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: st.color }}>{m.estoqueAtual}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>/ mín {m.estoqueMin}</span>
                    </div>
                    <MiniBar value={m.estoqueAtual} min={m.estoqueMin}/>
                  </td>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                    {nomeUnidade(m.unMedId)}
                  </td>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>R$ {preco}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>por {nomeUnidade(m.unMedId)}</div>
                  </td>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: `${st.color}18`, color: st.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                      {st.label}
                    </span>
                  </td>

                  <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onEdit(m)} title="Editar"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(79,110,247,0.1)'; e.currentTarget.style.borderColor='rgba(79,110,247,0.2)'; e.currentTarget.style.color='#4f6ef7'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                        <Pencil size={13}/>
                      </button>
                      <button onClick={() => onDelete(m.idMaterial)} title="Excluir"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {materiais.length > 0 && filtrados.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Nenhum material encontrado.
        </div>
      )}
    </div>
  );
}