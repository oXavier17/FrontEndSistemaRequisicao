import api from './api';

const unidadesService = {
  listar: () => api.get('/unidades').then(r => r.data),
  criar:  (nome) => api.post('/unidades', { nome }).then(r => r.data),
};

export default unidadesService;