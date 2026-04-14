import api from './api';

const departamentosService = {
  listar:        (todos = false) => api.get(`/departamentos?todos=${todos}`).then(r => r.data),
  criar:         (data)          => api.post('/departamentos', data).then(r => r.data),
  editar:        (id, data)      => api.put(`/departamentos/${id}`, data).then(r => r.data),
  alterarStatus: (id)            => api.patch(`/departamentos/${id}/status`).then(r => r.data),
};

export default departamentosService;