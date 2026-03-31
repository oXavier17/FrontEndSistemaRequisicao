import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

// Enquanto a API não está pronta, usamos dados mock
const MOCK = {
  totalRequisicoes: 38,
  requisicoesPendentes: 8,
  totalItensEstoque: 142,
  totalUsuariosAtivos: 24,
  requisicoesPorDepartamento: [
    { nomeDepartamento: 'TI',         total: 12 },
    { nomeDepartamento: 'RH',         total: 8  },
    { nomeDepartamento: 'Financeiro', total: 7  },
    { nomeDepartamento: 'Jurídico',   total: 5  },
    { nomeDepartamento: 'Compras',    total: 4  },
    { nomeDepartamento: 'Logística',  total: 2  },
  ],
  estoqueCritico: [
    { idMaterial: 1, nome: 'Papel A4 75g',     estoqueAtual: 3,  estoqueMin: 20, nomeUnidade: 'resma'   },
    { idMaterial: 2, nome: 'Toner HP 85A',     estoqueAtual: 5,  estoqueMin: 10, nomeUnidade: 'un'      },
    { idMaterial: 3, nome: 'Caneta Azul BIC',  estoqueAtual: 24, estoqueMin: 30, nomeUnidade: 'cx'      },
    { idMaterial: 4, nome: 'Clipe Galvanizado',estoqueAtual: 1,  estoqueMin: 5,  nomeUnidade: 'cx'      },
    { idMaterial: 5, nome: 'Pen Drive 32GB',   estoqueAtual: 7,  estoqueMin: 10, nomeUnidade: 'un'      },
  ],
  requisicoesMaisRecentes: [
    { idRequisicao: 38, nomeRequisitante: 'Maria A.',  nomeDepartamento: 'TI',        status: 1, dataRequisicao: '2026-03-30T09:14:00' },
    { idRequisicao: 37, nomeRequisitante: 'João S.',   nomeDepartamento: 'RH',        status: 4, dataRequisicao: '2026-03-30T08:30:00' },
    { idRequisicao: 36, nomeRequisitante: 'Carla L.',  nomeDepartamento: 'Financeiro',status: 2, dataRequisicao: '2026-03-29T16:45:00' },
    { idRequisicao: 35, nomeRequisitante: 'Rafael P.', nomeDepartamento: 'TI',        status: 5, dataRequisicao: '2026-03-29T14:20:00' },
    { idRequisicao: 34, nomeRequisitante: 'Laura M.',  nomeDepartamento: 'Jurídico',  status: 4, dataRequisicao: '2026-03-28T11:00:00' },
  ],
};

// Quando o back-end estiver pronto, mude para false
const USE_MOCK = true;

export function useDashboard() {
  const [dados, setDados]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]     = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = USE_MOCK
        ? await Promise.resolve(MOCK)        // mock local
        : await dashboardService.resumo();   // API real
      setDados(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return { dados, loading, erro, carregar };
}