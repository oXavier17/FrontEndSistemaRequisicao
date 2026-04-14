import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// 🔐 Interceptor de REQUEST (envia token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🚨 Interceptor de RESPONSE (erros)
api.interceptors.response.use(
  response => response,
  error => {
    const msg =
      typeof error.response?.data === 'string'  ? error.response.data :
      error.response?.data?.message             ? error.response.data.message :
      error.message                             ? error.message :
      `Erro ${error.response?.status ?? 'desconhecido'}`;

    const isLoginRoute = window.location.pathname === '/login';

    // 🔥 Só redireciona se NÃO estiver no login
    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(msg));
  }
);

export default api;

//
// ✅ SERVICES PADRONIZADOS (AXIOS)
//

export const departamentosService = {
  listar:   () => api.get('/departamentos').then(r => r.data),
  criar:    (data) => api.post('/departamentos', data).then(r => r.data),
  editar:   (id, data) => api.put(`/departamentos/${id}`, data).then(r => r.data),
  excluir:  (id) => api.delete(`/departamentos/${id}`).then(r => r.data),
};

export const usuariosService = {
  listar:   () => api.get('/usuarios').then(r => r.data),
  criar:    (data) => api.post('/usuarios', data).then(r => r.data),
  editar:   (id, data) => api.put(`/usuarios/${id}`, data).then(r => r.data),
  excluir:  (id) => api.delete(`/usuarios/${id}`).then(r => r.data),
};

export const materiaisService = {
  listar:   () => api.get('/materiais').then(r => r.data),
  criar:    (data) => api.post('/materiais', data).then(r => r.data),
  editar:   (id, data) => api.put(`/materiais/${id}`, data).then(r => r.data),
  excluir:  (id) => api.delete(`/materiais/${id}`).then(r => r.data),
};

export const requisicaoService = {
  listar:   () => api.get('/requisicoes').then(r => r.data),
  criar:    (data) => api.post('/requisicoes', data).then(r => r.data),
  editar:   (id, data) => api.put(`/requisicoes/${id}`, data).then(r => r.data),
  cancelar: (id) => api.patch(`/requisicoes/${id}/cancelar`).then(r => r.data),
};