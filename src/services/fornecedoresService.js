import api from './api';

const fornecedoresService = {
  listar:  ()          => api.get('/fornecedores').then(r => r.data),
  criar:   (nome)      => api.post('/fornecedores', { nome }).then(r => r.data),
  editar:  (id, nome)  => api.put(`/fornecedores/${id}`, { nome }).then(r => r.data),
  excluir: (id)        => api.delete(`/fornecedores/${id}`),
};

export default fornecedoresService;