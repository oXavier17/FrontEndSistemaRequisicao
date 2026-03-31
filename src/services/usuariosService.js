import api from './api';

const usuariosService = {
  listar:  ()          => api.get('/usuarios').then(r => r.data),
  criar:   (data)      => api.post('/usuarios', data).then(r => r.data),
  editar:  (id, data)  => api.put(`/usuarios/${id}`, data).then(r => r.data),
  excluir: (id)        => api.delete(`/usuarios/${id}`),
};

export default usuariosService;