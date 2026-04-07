import { useState, useEffect, useCallback } from 'react';
import fornecedoresService from '../services/fornecedoresService';

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading]           = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fornecedoresService.listar();
      setFornecedores(data);
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (nome) => {
    const novo = await fornecedoresService.criar(nome);
    setFornecedores(prev => [...prev, novo]);
  };

  const editar = async (id, nome) => {
    const atualizado = await fornecedoresService.editar(id, nome);
    setFornecedores(prev => prev.map(f => f.idFornecedor === id ? atualizado : f));
  };

  const excluir = async (id) => {
    await fornecedoresService.excluir(id);
    setFornecedores(prev => prev.filter(f => f.idFornecedor !== id));
  };

  return { fornecedores, loading, carregar, criar, editar, excluir };
}