import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import authService from '../services/authService';

// Mude para false quando o back-end estiver pronto
const USE_MOCK = true;

const MOCK_USUARIO = {
  token: 'mock-jwt-token',
  usuario: { idUsuario: 1, nome: 'Xavier Admin', email: 'admin@empresa.com', tipo_perfil: 1 },
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState(null);

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '12px 16px', color: '#e8eaf0',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box',
  };
  const focusStyle = (e) => { e.target.style.borderColor='#4f6ef7'; e.target.style.boxShadow='0 0 0 3px rgba(79,110,247,0.15)'; e.target.style.background='rgba(79,110,247,0.05)'; };
  const blurStyle  = (e) => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.05)'; };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }

    try {
      setCarregando(true);
      setErro(null);

      const data = USE_MOCK
        ? await Promise.resolve(MOCK_USUARIO)
        : await authService.login(email, senha);

      authService.salvarSessao(data.token, data.usuario);
      navigate('/');
    } catch (e) {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0f14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Glow de fundo */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,110,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#13161e',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24, padding: 40,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        animation: 'fadeUp 0.4s ease both',
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16, boxShadow: '0 8px 24px rgba(79,110,247,0.3)' }}>
            📦
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: '#e8eaf0', margin: 0 }}>
            SisReq
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, textAlign: 'center' }}>
            Sistema de Requisição de Materiais
          </p>
        </div>

        {/* Título */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: '#e8eaf0', margin: '0 0 6px' }}>
            Bem-vindo de volta
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Faça login para acessar o sistema.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', letterSpacing: '0.03em' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErro(null); }}
              placeholder="seu@email.com"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
              disabled={carregando}
            />
          </div>

          {/* Senha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', letterSpacing: '0.03em' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(null); }}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={focusStyle}
                onBlur={blurStyle}
                disabled={carregando}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: 0 }}>
                {mostrarSenha ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444' }}>
              <AlertCircle size={14}/> {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              marginTop: 4,
              width: '100%', padding: '13px',
              borderRadius: 12, border: 'none',
              background: carregando ? '#1a1e29' : 'linear-gradient(135deg,#4f6ef7,#7c3aed)',
              color: carregando ? '#6b7280' : 'white',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
              cursor: carregando ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: carregando ? 'none' : '0 4px 16px rgba(79,110,247,0.3)',
            }}
            onMouseEnter={e => { if (!carregando) e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
            {carregando
              ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }}/> Entrando...</>
              : 'Entrar'
            }
          </button>

        </form>

        {/* Rodapé */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', marginTop: 28, marginBottom: 0 }}>
          SisReq © {new Date().getFullYear()} — Sistema de Requisição
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}