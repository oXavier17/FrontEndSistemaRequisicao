import api from './api';

const movimentosService = {
  listar: () => api.get('/movimentos').then(r => r.data),
};

export default movimentosService;