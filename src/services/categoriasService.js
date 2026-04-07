import api from './api';

const categoriasService = {
  listar:  ()          => api.get('/categorias').then(r => r.data),
  criar:   (nome)      => api.post('/categorias', { nome }).then(r => r.data),
  editar:  (id, nome)  => api.put(`/categorias/${id}`, { nome }).then(r => r.data),
  excluir: (id)        => api.delete(`/categorias/${id}`),
};

export default categoriasService;