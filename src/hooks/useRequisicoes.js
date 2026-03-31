import { useState, useEffect, useCallback } from 'react';
import requisicoesService from '../services/requisicoesService';

// Status: 1 Aberta, 2 Em Separação, 3 Pronta, 4 Entregue, 5 Cancelada
export const STATUS_MAP = {
  1: { label: 'Aberta',       color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)',  pill: 'pendente'  },
  2: { label: 'Em Separação', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', pill: 'transito'  },
  3: { label: 'Pronta',       color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', pill: 'transito'  },
  4: { label: 'Entregue',     color: '#10b981', bg: 'rgba(16,185,129,0.1)', pill: 'aprovado'  },
  5: { label: 'Cancelada',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  pill: 'rejeitado' },
};

// Mock enquanto o back não está pronto
const MOCK = [
  {
    idRequisicao: 38, status: 1, observacao: 'Urgente para apresentação',
    dataRequisicao: '2026-03-30T09:14:00', dataEnvio: null,
    nomeRequisitante: 'Maria A.', nomeDepartamento: 'TI',
    itens: [
      { idMaterial: 1, nomeMaterial: 'Papel A4 75g',   quantidade: 5,  nomeUnidade: 'resma' },
      { idMaterial: 3, nomeMaterial: 'Caneta Azul BIC', quantidade: 10, nomeUnidade: 'cx'    },
    ],
  },
  {
    idRequisicao: 37, status: 4, observacao: null,
    dataRequisicao: '2026-03-30T08:30:00', dataEnvio: '2026-03-30T10:00:00',
    nomeRequisitante: 'João S.', nomeDepartamento: 'RH',
    itens: [
      { idMaterial: 4, nomeMaterial: 'Grampeador 26/6', quantidade: 2, nomeUnidade: 'un' },
    ],
  },
  {
    idRequisicao: 36, status: 2, observacao: 'Para o setor financeiro',
    dataRequisicao: '2026-03-29T16:45:00', dataEnvio: null,
    nomeRequisitante: 'Carla L.', nomeDepartamento: 'Financeiro',
    itens: [
      { idMaterial: 6, nomeMaterial: 'Pasta AZ',        quantidade: 5,  nomeUnidade: 'un' },
      { idMaterial: 8, nomeMaterial: 'Post-it 76x76mm', quantidade: 3,  nomeUnidade: 'pct'},
    ],
  },
  {
    idRequisicao: 35, status: 5, observacao: 'Estoque insuficiente',
    dataRequisicao: '2026-03-29T14:20:00', dataEnvio: null,
    nomeRequisitante: 'Rafael P.', nomeDepartamento: 'TI',
    itens: [
      { idMaterial: 3, nomeMaterial: 'Toner HP 85A', quantidade: 3, nomeUnidade: 'un' },
    ],
  },
  {
    idRequisicao: 34, status: 4, observacao: null,
    dataRequisicao: '2026-03-28T11:00:00', dataEnvio: '2026-03-28T15:00:00',
    nomeRequisitante: 'Laura M.', nomeDepartamento: 'Jurídico',
    itens: [
      { idMaterial: 6, nomeMaterial: 'Pasta AZ',   quantidade: 10, nomeUnidade: 'un' },
      { idMaterial: 12, nomeMaterial: 'Lápis HB',  quantidade: 2,  nomeUnidade: 'cx' },
    ],
  },
];

const USE_MOCK = true;

export function useRequisicoes() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = USE_MOCK
        ? await Promise.resolve(MOCK)
        : await requisicoesService.listar();
      setRequisicoes(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizarStatus = async (id, novoStatus) => {
    if (USE_MOCK) {
      setRequisicoes(prev => prev.map(r => r.idRequisicao === id ? { ...r, status: novoStatus } : r));
      return;
    }
    const atualizada = await requisicoesService.atualizarStatus(id, novoStatus);
    setRequisicoes(prev => prev.map(r => r.idRequisicao === id ? atualizada : r));
  };

  const cancelar = async (id) => {
    if (USE_MOCK) {
      setRequisicoes(prev => prev.map(r => r.idRequisicao === id ? { ...r, status: 5 } : r));
      return;
    }
    await requisicoesService.cancelar(id);
    setRequisicoes(prev => prev.map(r => r.idRequisicao === id ? { ...r, status: 5 } : r));
  };

  return { requisicoes, loading, erro, carregar, atualizarStatus, cancelar };
}