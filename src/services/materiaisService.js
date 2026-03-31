import api from './api';

const materiaisService = {
  listar:  ()          => api.get('/materiais').then(r => r.data),
  criar:   (data)      => api.post('/materiais', data).then(r => r.data),
  editar:  (id, data)  => api.put(`/materiais/${id}`, data).then(r => r.data),
  excluir: (id)        => api.delete(`/materiais/${id}`),
};

export default materiaisService;