import { useState } from 'react';
import { Building2, Pencil, Power, Save, Info, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import { useDepartamentos } from '../hooks/useDepartamentos';

export default function Departamentos() {
  const {
    departamentos, loading, erro, carregar,
    criar, editar, alterarStatus,
    mostrarInativos, setMostrarInativos,
  } = useDepartamentos();

  const [nome, setNome]           = useState('');
  const [editando, setEditando]   = useState(null);
  const [salvando, setSalvando]   = useState(false);
  const [alterando, setAlterando] = useState(null);
  const [erroForm, setErroForm]   = useState(null);
  const [busca, setBusca] = useState('');

  const deptosFiltrados = departamentos.filter(d =>
    d.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // --- Estilos Auxiliares ---
  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    width: '100%', transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  // --- Handlers de Ação ---
  const handleAlterarStatus = async (dep) => {
    const acao = dep.status === 1 ? 'inativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${acao} "${dep.nome}"?`)) return;
    try {
      setAlterando(dep.idDepartamento);
      await alterarStatus(dep.idDepartamento);
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setAlterando(null);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) { setErroForm('Informe o nome do departamento.'); return; }
    try {
      setSalvando(true);
      setErroForm(null);
      if (editando) {
        await editar(editando.idDepartamento, nome.trim());
        setEditando(null);
      } else {
        await criar(nome.trim());
      }
      setNome('');
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEdit = (dep) => {
    setEditando(dep);
    setNome(dep.nome);
    setErroForm(null);
  };

  const handleCancel = () => { 
    setEditando(null); 
    setNome(''); 
    setErroForm(null); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Gestão de <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Departamentos</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Cadastre e gerencie os departamentos da organização.</p>
        </div>

        <button onClick={carregar} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)'; }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
          Atualizar
        </button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px', gap: 14 }}>
        <StatChip icon={<Building2 size={18}/>} value={departamentos.length} label="Total de Departamentos" color="#4f6ef7" delay={0.02}/>
      </div>

      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={16}/>
          <span>Erro ao carregar: <strong>{erro}</strong></span>
          <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Tentar novamente</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* FORMULÁRIO */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
              {editando ? 'Editar Departamento' : 'Novo Departamento'}
            </div>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {editando && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent)' }}>
                <Info size={14}/> Editando: <strong>{editando.nome}</strong>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Nome do Departamento *</label>
              <input
                style={inputStyle}
                value={nome}
                placeholder="Ex: Recursos Humanos"
                onChange={e => { setNome(e.target.value); setErroForm(null); }}
                onFocus={focusStyle} onBlur={blurStyle}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                disabled={salvando}
              />
            </div>

            {erroForm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
                <AlertCircle size={13}/> {erroForm}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button onClick={handleCancel} disabled={salvando}
                style={{ flex: 1, padding: 10, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>
                Limpar
              </button>
              <button onClick={handleSave} disabled={salvando}
                style={{ flex: 2, padding: 10, borderRadius: 10, background: salvando ? 'var(--surface2)' : 'var(--accent)', border: 'none', color: salvando ? 'var(--muted)' : 'white', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {salvando ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <Save size={14}/>}
                {editando ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>

        {/* LISTAGEM */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header da Listagem */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
              Departamentos Cadastrados
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setMostrarInativos(v => !v)}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s',
                  background: mostrarInativos ? 'rgba(245,158,11,0.1)' : 'var(--surface2)',
                  border: `1px solid ${mostrarInativos ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                  color: mostrarInativos ? '#f59e0b' : 'var(--muted)',
                }}>
                {mostrarInativos ? 'Ver ativos' : 'Ver inativos'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{deptosFiltrados.length} registros</span>
            </div>
          </div>

          {/* Barra de Busca (Aparece se houver muitos registros) */}
          {(departamentos.length > 5 || busca) && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input value={busca} onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar departamento..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', width: '100%' }}/>
                {busca && (
                  <button onClick={() => setBusca('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, padding: 0 }}>✕</button>
                )}
              </div>
            </div>
          )}

          {/* Container com Scroll */}
          <div style={{ overflowY: 'auto', maxHeight: '450px', scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
            {loading && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13 }}>
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/> Carregando departamentos...
              </div>
            )}

            {!loading && deptosFiltrados.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                {busca ? 'Nenhum resultado para a busca.' : 'Nenhum departamento encontrado.'}
              </div>
            )}

            {!loading && deptosFiltrados.map((dep, i) => {
              const ativo = dep.status === 1;
              return (
                <div key={dep.idDepartamento}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.01)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderBottom: i < deptosFiltrados.length - 1 ? '1px solid var(--border)' : 'none', opacity: ativo ? 1 : 0.6, transition: 'background 0.2s' }}>
                  
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: ativo ? 'rgba(79,110,247,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={16} color={ativo ? 'var(--accent)' : 'var(--muted)'}/>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{dep.nome}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>ID {String(dep.idDepartamento).padStart(3, '0')}</span>
                      <span style={{ color: ativo ? '#10b981' : '#ef4444' }}>● {ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleEdit(dep)} title="Editar"
                      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)'; }}>
                      <Pencil size={14}/>
                    </button>
                    <button onClick={() => handleAlterarStatus(dep)} disabled={alterando === dep.idDepartamento} title={ativo ? "Desativar" : "Ativar"}
                      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: ativo ? '#ef4444' : '#10b981', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = ativo ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {alterando === dep.idDepartamento ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/> : <Power size={14}/>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}