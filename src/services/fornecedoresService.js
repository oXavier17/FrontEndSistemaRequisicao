import api from './api';

const fornecedoresService = {
  listar:        ()         => api.get('/fornecedores').then(r => r.data),
  criar:         (nome)     => api.post('/fornecedores', { nome }).then(r => r.data),
  editar:        (id, nome) => api.put(`/fornecedores/${id}`, { nome }).then(r => r.data),
  alterarStatus: (id)       => api.patch(`/fornecedores/${id}/status`).then(r => r.data),
};

export default fornecedoresService;