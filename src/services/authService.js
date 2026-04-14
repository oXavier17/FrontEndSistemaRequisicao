import api from './api';

const authService = {
  login: (email, senha) =>
    api.post('/auth/login', { email, senha }).then(r => r.data),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  salvarSessao: (token, usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  },

  usuarioLogado: () => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  },

  tokenSalvo: () => localStorage.getItem('token'),
};

export default authService;