import api from './api';

const requisicoesService = {
  listar:          ()              => api.get('/requisicoes').then(r => r.data),
  criar:           (data)          => api.post('/requisicoes', data).then(r => r.data),
  atualizarStatus: (id, status)    => api.patch(`/requisicoes/${id}/status`, { status }).then(r => r.data),
  editarQuantidade: (reqId, matId, quantidade) =>
    api.patch(`/requisicoes/${reqId}/itens/${matId}`, { quantidade }).then(r => r.data),
};

export default requisicoesService;