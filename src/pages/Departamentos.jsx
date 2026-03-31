import { useState } from 'react';
import { Building2, Pencil, Trash2, Save, Info, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import { useDepartamentos } from '../hooks/useDepartamentos';

export default function Departamentos() {
  const { departamentos, loading, erro, carregar, criar, editar, excluir } = useDepartamentos();

  const [nome, setNome]         = useState('');
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    width: '100%', transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

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

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este departamento?')) return;
    try {
      await excluir(id);
      if (editando?.idDepartamento === id) handleCancel();
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    }
  };

  const handleCancel = () => { setEditando(null); setNome(''); setErroForm(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Gestão de <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Departamentos</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Cadastre e gerencie os departamentos da organização.</p>
        </div>

        {/* Botão recarregar */}
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

      {/* Erro global de carregamento */}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={16}/>
          <span>Erro ao carregar departamentos: <strong>{erro}</strong></span>
          <button onClick={carregar} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Tentar novamente</button>
        </div>
      )}

      {/* Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── FORM ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 0, animation: 'fadeUp 0.35s ease 0.05s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
              {editando ? 'Editar Departamento' : 'Novo Departamento'}
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>* obrigatório</span>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Banner edição */}
            {editando && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent)' }}>
                <Info size={14}/>
                Editando: <strong>{editando.nome}</strong>
              </div>
            )}

            {/* Campo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>Nome do Departamento *</label>
              <input
                style={inputStyle}
                value={nome}
                placeholder="Ex: Recursos Humanos"
                onChange={e => { setNome(e.target.value); setErroForm(null); }}
                onFocus={focusStyle}
                onBlur={blurStyle}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                disabled={salvando}
              />
            </div>

            {/* Erro do form */}
            {erroForm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
                <AlertCircle size={13}/>
                {erroForm}
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)' }}/>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCancel} disabled={salvando}
                style={{ flex: 1, padding: 10, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer' }}>
                Limpar
              </button>
              <button onClick={handleSave} disabled={salvando}
                style={{ flex: 2, padding: 10, borderRadius: 10, background: salvando ? 'var(--surface2)' : 'var(--accent)', border: 'none', color: salvando ? 'var(--muted)' : 'white', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}>
                {salvando
                  ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Salvando...</>
                  : <><Save size={14}/>{editando ? 'Salvar Alterações' : 'Cadastrar'}</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── LISTA ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.12s both' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }}/>
              Departamentos Cadastrados
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{departamentos.length} registros</span>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }}/>
                Carregando departamentos...
              </div>
            </div>
          )}

          {/* Vazio */}
          {!loading && departamentos.length === 0 && !erro && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Nenhum departamento cadastrado</div>
              <div style={{ fontSize: 13 }}>Use o formulário ao lado para adicionar o primeiro.</div>
            </div>
          )}

          {/* Itens */}
          {!loading && departamentos.map((dep, i) => (
            <div key={dep.idDepartamento}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < departamentos.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.015)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>

              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(79,110,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={18} color="var(--accent)"/>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{dep.nome}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 600 }}>ID {dep.idDepartamento}</span>
                  <span>·</span>
                  {/* Badge de status vindo do banco */}
                  <span style={{ color: dep.status === 1 ? 'var(--success)' : 'var(--danger)' }}>
                    {dep.status === 1 ? '● Ativo' : '● Inativo'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => handleEdit(dep)} title="Editar"
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(79,110,247,0.1)'; e.currentTarget.style.borderColor='rgba(79,110,247,0.2)'; e.currentTarget.style.color='#4f6ef7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                  <Pencil size={14}/>
                </button>
                <button onClick={() => handleDelete(dep.idDepartamento)} title="Excluir"
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animação do spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}