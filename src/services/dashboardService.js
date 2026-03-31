import api from './api';

const dashboardService = {
  resumo: () => api.get('/dashboard/resumo').then(r => r.data),
  // Retorno esperado do Spring Boot:
  // {
  //   totalRequisicoes: 38,
  //   requisicoesPendentes: 8,
  //   totalItensEstoque: 142,
  //   totalUsuariosAtivos: 24,
  //   requisicoesPorDepartamento: [
  //     { nomeDepartamento: "TI", total: 12 },
  //     ...
  //   ],
  //   estoqueCritico: [
  //     { idMaterial: 1, nome: "Papel A4", estoqueAtual: 3, estoqueMin: 20, nomeUnidade: "resma" },
  //     ...
  //   ],
  //   requisicoesMaisRecentes: [
  //     { idRequisicao: 38, nomeRequisitante: "Maria A.", nomeDepartamento: "TI", status: 1, dataRequisicao: "2026-03-30T09:14:00" },
  //     ...
  //   ]
  // }
};

export default dashboardService;