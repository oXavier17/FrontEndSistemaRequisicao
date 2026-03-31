import api from './api';

const requisicoesService = {
  listar:   ()         => api.get('/requisicoes').then(r => r.data),
  buscarPorId: (id)    => api.get(`/requisicoes/${id}`).then(r => r.data),
  criar:    (data)     => api.post('/requisicoes', data).then(r => r.data),
  atualizarStatus: (id, status) => api.patch(`/requisicoes/${id}/status`, { status }).then(r => r.data),
  cancelar: (id)       => api.patch(`/requisicoes/${id}/cancelar`).then(r => r.data),
};

export default requisicoesService;