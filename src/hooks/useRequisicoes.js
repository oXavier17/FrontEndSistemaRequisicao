import { useState, useEffect, useCallback } from 'react';
import requisicoesService from '../services/requisicoesService';

export const STATUS_MAP = {
  1: { label: 'Aberta',       color: '#4f6ef7', bg: 'rgba(79,110,247,0.1)'  },
  2: { label: 'Em Separação', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  3: { label: 'Pronta',       color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  4: { label: 'Entregue',     color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  5: { label: 'Cancelada',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
};

export function useRequisicoes() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await requisicoesService.listar();
      setRequisicoes(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (data) => {
    const nova = await requisicoesService.criar(data);
    setRequisicoes(prev => [nova, ...prev]);
  };

  const atualizarStatus = async (id, novoStatus) => {
    const atualizada = await requisicoesService.atualizarStatus(id, novoStatus);
    setRequisicoes(prev => prev.map(r => r.idRequisicao === id ? atualizada : r));
  };

  const cancelar = async (id) => {
    await atualizarStatus(id, 5);
  };

  // Editar quantidade de item — recarrega a requisição atualizada
  const editarQuantidade = async (reqId, matId, quantidade) => {
    const atualizada = await requisicoesService.editarQuantidade(reqId, matId, quantidade);
    setRequisicoes(prev => prev.map(r => r.idRequisicao === reqId ? atualizada : r));
  };

  return { requisicoes, loading, erro, carregar, criar, atualizarStatus, cancelar, editarQuantidade };
}