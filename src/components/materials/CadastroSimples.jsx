import { useState } from 'react';
import { Save, Trash2, AlertCircle, RefreshCw, Pencil, X } from 'lucide-react';

export default function CadastroSimples({
  titulo,
  cor,
  itens,
  idKey,
  onCriar,
  onEditar,
  onExcluir,
  placeholder,
}) {
  const [nome, setNome]           = useState('');
  const [editando, setEditando]   = useState(null); // { id, nome }
  const [salvando, setSalvando]   = useState(false);
  const [excluindo, setExcluindo] = useState(null);
  const [erro, setErro]           = useState(null);

  const inputStyle = {
    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '9px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none'; };

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

  const handleCancelar = () => {
    setEditando(null);
    setNome('');
    setErro(null);
  };

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      setExcluindo(id);
      await onExcluir(id);
      // Se estava editando o item excluído, limpa o form
      if (editando?.id === id) handleCancelar();
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: cor }}/>
          {titulo}
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{itens.length} cadastrados</span>
      </div>

      {/* Input */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Banner de edição */}
        {editando && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--accent)' }}>
            <Pencil size={12}/>
            Editando: <strong>{editando.nome}</strong>
            <button onClick={handleCancelar}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: 2, borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.color='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>
              <X size={13}/>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={nome}
            onChange={e => { setNome(e.target.value); setErro(null); }}
            onKeyDown={e => e.key === 'Enter' && handleSalvar()}
            placeholder={editando ? `Novo nome para "${editando.nome}"` : placeholder}
            disabled={salvando}
            style={{
              ...inputStyle,
              borderColor: editando ? 'rgba(79,110,247,0.3)' : 'var(--border)',
            }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <button onClick={handleSalvar} disabled={salvando}
            style={{ padding: '9px 14px', borderRadius: 10, background: salvando ? 'var(--surface2)' : 'var(--accent)', border: 'none', color: salvando ? 'var(--muted)' : 'white', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', flexShrink: 0 }}>
            {salvando
              ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/>
              : <Save size={13}/>
            }
            {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Adicionar'}
          </button>
        </div>

        {/* Erro */}
        {erro && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
            <AlertCircle size={12}/> {erro}
          </div>
        )}
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', maxHeight: 220 }}>
        {itens.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Nenhum registro ainda.
          </div>
        )}
        {itens.map((item, i) => {
          const esteEditando = editando?.id === item[idKey];
          return (
            <div key={item[idKey]}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < itens.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s',
                background: esteEditando ? 'rgba(79,110,247,0.04)' : 'transparent',
              }}
              onMouseEnter={e => { if (!esteEditando) e.currentTarget.style.background='rgba(255,255,255,0.015)'; }}
              onMouseLeave={e => { if (!esteEditando) e.currentTarget.style.background='transparent'; }}>

              {/* Número sequencial */}
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600, width: 20, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: esteEditando ? 'var(--accent)' : 'var(--text)' }}>
                {item.nome}
              </span>

              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Syne', marginRight: 4 }}>
                ID {item[idKey]}
              </span>

              {/* Botão editar */}
              <button onClick={() => esteEditando ? handleCancelar() : handleEditar(item)}
                title={esteEditando ? 'Cancelar edição' : 'Editar'}
                style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${esteEditando ? 'rgba(79,110,247,0.3)' : 'transparent'}`, background: esteEditando ? 'rgba(79,110,247,0.1)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: esteEditando ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { if (!esteEditando) { e.currentTarget.style.background='rgba(79,110,247,0.1)'; e.currentTarget.style.borderColor='rgba(79,110,247,0.2)'; e.currentTarget.style.color='#4f6ef7'; } }}
                onMouseLeave={e => { if (!esteEditando) { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; } }}>
                {esteEditando ? <X size={12}/> : <Pencil size={12}/>}
              </button>

              {/* Botão excluir */}
              <button onClick={() => handleExcluir(item[idKey])} disabled={excluindo === item[idKey]}
                title="Excluir"
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid transparent', background: 'none', cursor: excluindo === item[idKey] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                {excluindo === item[idKey]
                  ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/>
                  : <Trash2 size={12}/>
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