import api from './api';

const materiaisService = {
  listar:             (todos = false) => api.get(`/materiais?todos=${todos}`).then(r => r.data),
  criar:              (data)          => api.post('/materiais', data).then(r => r.data),
  editar:             (id, data)      => api.put(`/materiais/${id}`, data).then(r => r.data),
  alterarStatus:      (id)            => api.patch(`/materiais/${id}/status`).then(r => r.data),
  registrarMovimento: (data)          => api.post('/movimentos', data).then(r => r.data),
};

export default materiaisService;