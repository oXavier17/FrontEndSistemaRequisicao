import axios from 'axios';

// Instância configurada uma vez, usada em todo o projeto
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 segundos — evita ficar travado
});

// Interceptor de REQUEST — roda antes de toda requisição
// Quando tiver login, é aqui que você injeta o token JWT:
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Interceptor de RESPONSE — roda depois de toda resposta
// Centraliza o tratamento de erros globais
api.interceptors.response.use(
  response => response,          // 2xx — retorna normal
  error => {
    const msg = error.response?.data?.message  // mensagem do Spring Boot
      ?? error.response?.data                  // body como texto
      ?? error.message;                        // erro de rede
    return Promise.reject(new Error(msg));
  }
);

export default api;

export const departamentosService = {
  listar:   ()          => request('/departamentos'),
  criar:    (data)      => request('/departamentos', { method: 'POST', body: JSON.stringify(data) }),
  editar:   (id, data)  => request(`/departamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  excluir:  (id)        => request(`/departamentos/${id}`, { method: 'DELETE' }),
};

export const usuariosService = {
  listar:   ()          => request('/usuarios'),
  criar:    (data)      => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  editar:   (id, data)  => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  excluir:  (id)        => request(`/usuarios/${id}`, { method: 'DELETE' }),
};

export const materiaisService = {
  listar:   ()          => request('/materiais'),
  criar:    (data)      => request('/materiais', { method: 'POST', body: JSON.stringify(data) }),
  editar:   (id, data)  => request(`/materiais/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  excluir:  (id)        => request(`/materiais/${id}`, { method: 'DELETE' }),
};

export const requisicaoService = {
  listar:   ()          => request('/requisicoes'),
  criar:    (data)      => request('/requisicoes', { method: 'POST', body: JSON.stringify(data) }),
  editar:   (id, data)  => request(`/requisicoes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelar: (id)        => request(`/requisicoes/${id}/cancelar`, { method: 'PATCH' }),
};