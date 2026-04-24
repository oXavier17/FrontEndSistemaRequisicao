import { useState } from 'react';
import { Save, AlertCircle, RefreshCw, Pencil, X, Power } from 'lucide-react';

export default function CadastroSimples({
  titulo, cor, itens, idKey,
  onCriar, onEditar, onAlterarStatus,
  placeholder,
  mostrarInativos, onToggleInativos,
}) {
  const [nome, setNome]           = useState('');
  const [editando, setEditando]   = useState(null);
  const [salvando, setSalvando]   = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [erro, setErro]           = useState(null);
  const [busca, setBusca]         = useState(''); // ← busca na lista

  const itensFiltrados = itens.filter(i =>
    i.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const inputStyle = {
    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '9px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  const handleSalvar = async () => {
    if (!nome.trim()) { setErro('Informe um nome.'); return; }
    try {
      setSalvando(true);
      setErro(null);
      if (editando) {
        await onEditar(editando.id, nome.trim());
        setEditando(null);
      } else {
        await onCriar(nome.trim());
      }
      setNome('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (item) => {
    setEditando({ id: item[idKey], nome: item.nome });
    setNome(item.nome);
    setErro(null);
  };

  const handleCancelar = () => { setEditando(null); setNome(''); setErro(null); };

  const handleAlterarStatus = async (id, statusAtual) => {
    const acao = statusAtual === 1 ? 'inativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${acao} este item?`)) return;
    try {
      setExcluindo(id);
      await onAlterarStatus(id);
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: cor }}/>
          {titulo}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onToggleInativos}
            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s',
              background: mostrarInativos ? 'rgba(245,158,11,0.1)' : 'var(--surface2)',
              border: `1px solid ${mostrarInativos ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
              color: mostrarInativos ? '#f59e0b' : 'var(--muted)',
            }}>
            {mostrarInativos ? 'Ver ativos' : 'Ver inativos'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{itens.length} registros</span>
        </div>
      </div>

      {/* Input de cadastro */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {editando && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--accent)' }}>
            <Pencil size={12}/> Editando: <strong>{editando.nome}</strong>
            <button onClick={handleCancelar} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
              <X size={13}/>
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={nome}
            onChange={e => { setNome(e.target.value); setErro(null); }}
            onKeyDown={e => e.key === 'Enter' && handleSalvar()}
            placeholder={editando ? `Novo nome para "${editando.nome}"` : placeholder}
            disabled={salvando} style={inputStyle}
            onFocus={focusStyle} onBlur={blurStyle}/>
          <button onClick={handleSalvar} disabled={salvando}
            style={{ padding: '9px 14px', borderRadius: 10, background: salvando ? 'var(--surface2)' : 'var(--accent)', border: 'none', color: salvando ? 'var(--muted)' : 'white', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', flexShrink: 0 }}>
            {salvando ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <Save size={13}/>}
            {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
        {erro && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
            <AlertCircle size={12}/> {erro}
          </div>
        )}
      </div>

      {/* Barra de busca na lista — só aparece com mais de 5 itens */}
      {itens.length > 5 && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={busca} onChange={e => setBusca(e.target.value)}
              placeholder={`Buscar em ${titulo.toLowerCase()}...`}
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', width: '100%' }}/>
            {busca && (
              <button onClick={() => setBusca('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
            )}
          </div>
        </div>
      )}

      {/* Lista com scroll interno */}
      <div style={{ overflowY: 'auto', maxHeight: 240, scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>

        {itens.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Nenhum registro ainda.
          </div>
        )}

        {itens.length > 0 && itensFiltrados.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Nenhum resultado para "{busca}".
          </div>
        )}

        {itensFiltrados.map((item, i) => {
          const ativo = item.status === 1 || item.status === undefined;
          const esteEditando = editando?.id === item[idKey];
          return (
            <div key={item[idKey]}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderBottom: i < itensFiltrados.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: ativo ? 1 : 0.5,
                background: esteEditando ? 'rgba(79,110,247,0.04)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!esteEditando) e.currentTarget.style.background='rgba(255,255,255,0.015)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = esteEditando ? 'rgba(79,110,247,0.04)' : 'transparent'; }}>

              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600, width: 20, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: esteEditando ? 'var(--accent)' : 'var(--text)' }}>
                {item.nome}
              </span>

              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600,
                background: ativo ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: ativo ? '#10b981' : '#ef4444',
              }}>
                {ativo ? 'Ativo' : 'Inativo'}
              </span>

              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Syne', marginRight: 4 }}>
                ID {item[idKey]}
              </span>

              {/* Editar */}
              <button onClick={() => esteEditando ? handleCancelar() : handleEditar(item)}
                style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${esteEditando ? 'rgba(79,110,247,0.3)' : 'transparent'}`, background: esteEditando ? 'rgba(79,110,247,0.1)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: esteEditando ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { if (!esteEditando) { e.currentTarget.style.background='rgba(79,110,247,0.1)'; e.currentTarget.style.borderColor='rgba(79,110,247,0.2)'; e.currentTarget.style.color='#4f6ef7'; } }}
                onMouseLeave={e => { if (!esteEditando) { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; } }}>
                {esteEditando ? <X size={12}/> : <Pencil size={12}/>}
              </button>

              {/* Ativar/Inativar */}
              <button onClick={() => handleAlterarStatus(item[idKey], item.status ?? 1)}
                disabled={excluindo === item[idKey]}
                title={ativo ? 'Inativar' : 'Ativar'}
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid transparent', background: 'none', cursor: excluindo === item[idKey] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = ativo ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';
                  e.currentTarget.style.borderColor = ativo ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)';
                  e.currentTarget.style.color = ativo ? '#ef4444' : '#10b981';
                }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                {excluindo === item[idKey]
                  ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/>
                  : <Power size={12}/>
                }
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}