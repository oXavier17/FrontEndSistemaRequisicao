import api from './api';

const categoriasService = {
  listar: () => api.get('/categorias').then(r => r.data),
  criar:  (nome) => api.post('/categorias', { nome }).then(r => r.data),
};

export default categoriasService;