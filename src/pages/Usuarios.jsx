import { useState } from 'react';
import { Users, UserCheck, Pencil, Power, Save, Info, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import StatChip from '../components/ui/StatChip';
import { useUsuarios, intParaPerfil } from '../hooks/useUsuarios';
import { useDepartamentos } from '../hooks/useDepartamentos';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import BuscaDropdown from '../components/ui/BuscaDropdown';

const PERFIS = ['Administrador', 'Funcionário', 'Requisitante'];

const perfilStyle = {
  'Administrador': { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed', emoji: '👑' },
  'Funcionário':   { bg: 'rgba(79,110,247,0.1)',  color: '#4f6ef7', emoji: '👤' },
  'Requisitante':  { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', emoji: '📋' },
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.03em' }}>{label}</label>
    {children}
  </div>
);

const emptyForm = { nome: '', cpf: '', email: '', senha: '', perfil: '', departamentoId: '' };

function formatCPF(value) {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function Usuarios() {
  const { usuarios, loading, erro, carregar, criar, editar, alterarStatus, mostrarInativos, setMostrarInativos } = useUsuarios();
  const [alterando, setAlterando] = useState(null);
  const { departamentos } = useDepartamentos();
  const { isAdmin } = useAuth();

  if (!isAdmin) return <Navigate to="/" replace />;

  const [form, setForm]               = useState(emptyForm);
  const [editando, setEditando]       = useState(null);
  const [salvando, setSalvando]       = useState(false);
  const [erroForm, setErroForm]       = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [busca, setBusca]             = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('todos');
  const [deptoSelecionado, setDeptoSelecionado] = useState(null);

  const set = (field, value) => { setForm(f => ({ ...f, [field]: value })); setErroForm(null); };
  const temDepartamento = form.perfil === 'Funcionário' || form.perfil === 'Requisitante';

  const inputStyle = {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
    width: '100%', transition: 'all 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  const handleSave = async () => {
    if (!form.nome || !form.cpf || !form.email || !form.perfil) {
      setErroForm('Preencha todos os campos obrigatórios.'); return;
    }
    if (!editando && !form.senha) {
      setErroForm('Informe a senha.'); return;
    }
    if (temDepartamento && !form.departamentoId) {
      setErroForm('Selecione o departamento.'); return;
    }
    try {
      setSalvando(true);
      setErroForm(null);
      if (editando) {
        await editar(editando.idUsuario, form);
        setEditando(null);
      } else {
        await criar(form);
      }
      setDeptoSelecionado(null);
      setForm(emptyForm);
    } catch (e) {
      setErroForm(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEdit = (u) => {
    setEditando(u);
    setErroForm(null);
    const depto = departamentos.find(d => d.idDepartamento === u.departamentoId);
    setDeptoSelecionado(depto ? { id: depto.idDepartamento, label: depto.nome } : null);
    setForm({
      nome:           u.nome,
      cpf:            u.cpf,
      email:          u.email,
      senha:          '',
      perfil:         intParaPerfil(u.tipoPerfil),
      departamentoId: u.departamentoId ?? '',
    });
  };

  const handleAlterarStatus = async (u) => {
    const acao = u.status === 1 ? 'inativar' : 'ativar';
    if (!confirm(`Tem certeza que deseja ${acao} "${u.nome}"?`)) return;
    try {
      setAlterando(u.idUsuario);
      await alterarStatus(u.idUsuario);
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      setAlterando(null);
    }
  };

  const handleCancel = () => {
    setEditando(null);
    setForm(emptyForm);
    setErroForm(null);
    setDeptoSelecionado(null);
  };

  // Filtragem local
  const visiveis = usuarios
    .filter(u => filtroPerfil === 'todos' || intParaPerfil(u.tipoPerfil) === filtroPerfil)
    .filter(u =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
    );

  const total        = usuarios.length;
  const admins       = usuarios.filter(u => u.tipoPerfil === 1).length;
  const funcionarios = usuarios.filter(u => u.tipoPerfil === 2).length;
  const requisitantes= usuarios.filter(u => u.tipoPerfil === 3).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
            Gestão de <span style={{ background: 'linear-gradient(90deg,#4f6ef7,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Usuários</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Cadastre e gerencie os usuários e seus perfis de acesso.</p>
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
        <StatChip icon={<Users size={18}/>}     value={total}         label="Total de Usuários" color="#4f6ef7" delay={0.02}/>
        <StatChip icon={<UserCheck size={18}/>} value={admins}        label="Administradores"   color="#7c3aed" delay={0.06}/>
        <StatChip icon={<UserCheck size={18}/>} value={funcionarios}  label="Funcionários"      color="#4f6ef7" delay={0.10}/>
        <StatChip icon={<UserCheck size={18}/>} value={requisitantes} label="Requisitantes"     color="#10b981" delay={0.14}/>
      </div>

      {/* Erro global */}
      {erro && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={16}/>
          Erro ao carregar usuários: <strong>{erro}</strong>
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
              {editando ? 'Editar Usuário' : 'Novo Usuário'}
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>* obrigatórios</span>
          </div>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {editando && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(79,110,247,0.08)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--accent)' }}>
                <Info size={14}/>
                Editando: <strong>{editando.nome}</strong>
              </div>
            )}

            <Field label="Nome Completo *">
              <input style={inputStyle} value={form.nome} placeholder="Ex: Maria da Silva"
                onChange={e => set('nome', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
            </Field>

            <Field label="CPF *">
              <input style={inputStyle} value={form.cpf} placeholder="000.000.000-00"
                onChange={e => set('cpf', formatCPF(e.target.value))}
                onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
            </Field>

            <Field label="E-mail *">
              <input style={inputStyle} type="email" value={form.email} placeholder="usuario@empresa.com"
                onChange={e => set('email', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
            </Field>

            <Field label={editando ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, paddingRight: 40 }}
                  type={mostrarSenha ? 'text' : 'password'}
                  value={form.senha} placeholder="••••••••"
                  onChange={e => set('senha', e.target.value)}
                  onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}/>
                <button onClick={() => setMostrarSenha(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                  {mostrarSenha ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </Field>

            <Field label="Perfil *">
              <select style={inputStyle} value={form.perfil}
                onChange={e => set('perfil', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} disabled={salvando}>
                <option value="" disabled>Selecione o perfil...</option>
                {PERFIS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>

            {/* Departamento — select com dados reais da API */}
            {temDepartamento && (
              <Field label="Departamento *">
                <BuscaDropdown
                  placeholder="Digite para buscar departamento..."
                  itens={departamentos
                    .filter(d => d.status === 1)
                    .map(d => ({ id: d.idDepartamento, label: d.nome }))}
                  selecionado={deptoSelecionado}
                  onSelecionar={item => {
                    setDeptoSelecionado(item);
                    set('departamentoId', item.id);
                  }}
                  onLimpar={() => {
                    setDeptoSelecionado(null);
                    set('departamentoId', '');
                  }}
                />
              </Field>
            )}

            {/* Hint de perfil */}
            {form.perfil && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: perfilStyle[form.perfil]?.bg, border: `1px solid ${perfilStyle[form.perfil]?.color}30`, borderRadius: 10, padding: '10px 12px', fontSize: 12, color: perfilStyle[form.perfil]?.color }}>
                <span style={{ fontSize: 16 }}>{perfilStyle[form.perfil]?.emoji}</span>
                <span>
                  {form.perfil === 'Administrador' && 'Acesso total ao sistema.'}
                  {form.perfil === 'Funcionário'   && 'Pode gerenciar requisições e visualizar estoque.'}
                  {form.perfil === 'Requisitante'  && 'Pode criar e acompanhar suas próprias requisições.'}
                </span>
              </div>
            )}

            {/* Erro do form */}
            {erroForm && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ef4444' }}>
                <AlertCircle size={13}/> {erroForm}
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

        {/* ── TABELA ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.35s ease 0.12s both' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['todos', ...PERFIS].map(p => (
                <button key={p} onClick={() => setFiltroPerfil(p)}
                  style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s',
                    background: filtroPerfil === p ? 'var(--accent-glow)' : 'var(--surface2)',
                    border: `1px solid ${filtroPerfil === p ? 'rgba(79,110,247,0.3)' : 'var(--border)'}`,
                    color: filtroPerfil === p ? 'var(--accent)' : 'var(--muted)',
                  }}>
                  {p === 'todos' ? 'Todos' : p}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setMostrarInativos(v => !v)}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all 0.15s',
                  background: mostrarInativos ? 'rgba(245,158,11,0.1)' : 'var(--surface2)',
                  border: `1px solid ${mostrarInativos ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                  color: mostrarInativos ? '#f59e0b' : 'var(--muted)',
                }}>
                {mostrarInativos ? 'Ver apenas ativos' : 'Ver inativos'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou email..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'DM Sans', width: 180 }}/>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{visiveis.length} usuários</span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13 }}>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }}/> Carregando usuários...
            </div>
          )}

          {/* Vazio */}
          {!loading && usuarios.length === 0 && !erro && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Nenhum usuário cadastrado</div>
              <div style={{ fontSize: 13 }}>Use o formulário ao lado para adicionar o primeiro.</div>
            </div>
          )}

          {/* Tabela */}
          {!loading && visiveis.length > 0 && (
            <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: '460px', scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Usuário', 'CPF', 'E-mail', 'Perfil', 'Departamento', 'Status', 'Ações'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', fontSize: 11, fontWeight: 500,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: 'var(--muted)', padding: '11px 16px',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--surface)', // ← fundo sólido
                        whiteSpace: 'nowrap',
                        position: 'sticky', top: 0, zIndex: 1, // ← header fixo
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map(u => {
                    const perfilLabel = intParaPerfil(u.tipoPerfil);
                    const ps = perfilStyle[perfilLabel];
                    const initials = u.nome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
                    // Resolve nome do departamento pelo id
                    const depNome = departamentos.find(d => d.idDepartamento === u.departamentoId)?.nome ?? '—';

                    return (
                      <tr key={u.idUsuario}
                        style={{ opacity: u.status === 1 ? 1 : 0.5 }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.015)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${ps.color},${ps.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{u.nome}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Syne' }}>ID {u.idUsuario}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)', fontFamily: 'Syne', fontWeight: 600 }}>{u.cpf}</td>

                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text)' }}>{u.email}</td>

                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: ps.bg, color: ps.color }}>
                            {ps.emoji} {perfilLabel}
                          </span>
                        </td>

                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: depNome !== '—' ? 'var(--text)' : 'var(--muted)' }}>
                          {depNome}
                        </td>

                        {/* Status vindo do banco (bit) */}
                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                            background: u.status ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: u.status === 1 ? '#10b981' : '#ef4444' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}/>
                            {u.status === 1 ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>

                        <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleEdit(u)} title="Editar"
                              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(79,110,247,0.1)'; e.currentTarget.style.borderColor='rgba(79,110,247,0.2)'; e.currentTarget.style.color='#4f6ef7'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                              <Pencil size={13}/>
                            </button>
                            <button onClick={() => handleAlterarStatus(u)}
                              disabled={alterando === u.idUsuario}
                              title={u.status === 1 ? 'Inativar' : 'Ativar'}
                              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid transparent', background: 'none', cursor: alterando === u.idUsuario ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', transition: 'all 0.15s' }}
                              onMouseEnter={e => {
                                const ativo = u.status === 1;
                                e.currentTarget.style.background    = ativo ? 'rgba(239,68,68,0.1)'  : 'rgba(16,185,129,0.1)';
                                e.currentTarget.style.borderColor   = ativo ? 'rgba(239,68,68,0.2)'  : 'rgba(16,185,129,0.2)';
                                e.currentTarget.style.color         = ativo ? '#ef4444'              : '#10b981';
                              }}
                              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='var(--muted)'; }}>
                              {alterando === u.idUsuario
                                ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/>
                                : <Power size={13}/>
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Sem resultados na busca */}
          {!loading && usuarios.length > 0 && visiveis.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Nenhum usuário encontrado para esta busca.
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}