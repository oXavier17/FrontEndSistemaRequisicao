import api from './api';

const departamentosService = {
  listar:  ()          => api.get('/departamentos').then(r => r.data),
  criar:   (data)      => api.post('/departamentos', data).then(r => r.data),
  editar:  (id, data)  => api.put(`/departamentos/${id}`, data).then(r => r.data),
  excluir: (id)        => api.delete(`/departamentos/${id}`),
};

export default departamentosService;