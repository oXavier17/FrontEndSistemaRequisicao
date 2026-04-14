import api from './api';

const usuariosService = {
  listar:        (todos = false) => api.get(`/usuarios?todos=${todos}`).then(r => r.data),
  criar:         (data)          => api.post('/usuarios', data).then(r => r.data),
  editar:        (id, data)      => api.put(`/usuarios/${id}`, data).then(r => r.data),
  alterarStatus: (id)            => api.patch(`/usuarios/${id}/status`).then(r => r.data),
};

export default usuariosService;