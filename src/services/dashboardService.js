import api from './api';

const dashboardService = {
  resumo: () => api.get('/dashboard/resumo').then(r => r.data),
};

export default dashboardService;