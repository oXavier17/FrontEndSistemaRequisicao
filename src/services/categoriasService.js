import api from './api';

const categoriasService = {
  listar:        (todos = false) => api.get(`/categorias?todos=${todos}`).then(r => r.data),
  criar:         (data)          => api.post('/categorias', data).then(r => r.data),
  editar:        (id, data)      => api.put(`/categorias/${id}`, data).then(r => r.data),
  alterarStatus: (id)            => api.patch(`/categorias/${id}/status`).then(r => r.data),
};
export default categoriasService;