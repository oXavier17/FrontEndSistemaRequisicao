import { useState, useEffect, useCallback } from 'react';
import fornecedoresService from '../services/fornecedoresService';

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [loading, setLoading]           = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fornecedoresService.listar(mostrarInativos);
      setFornecedores(data);
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e.message);
    } finally {
      setLoading(false);
    }
  }, [mostrarInativos]);

  useEffect(() => {carregar()}, [carregar]);

  const criar = async (nome) => {
    const novo = await fornecedoresService.criar(nome);
    setFornecedores(prev => [...prev, novo]);
  };

  const editar = async (id, nome) => {
    const atualizado = await fornecedoresService.editar(id, nome);
    setFornecedores(prev => prev.map(f => f.idFornecedor === id ? atualizado : f));
  };

  const alterarStatus = async (id) => {
    await fornecedoresService.alterarStatus(id);
    await carregar(); // Recarrega para refletir o novo status
  };

  const fornecedoresAtivos = fornecedores.filter(m => m.ativo);

  return { fornecedores, loading, carregar, mostrarInativos, setMostrarInativos, criar, editar, alterarStatus, fornecedoresAtivos };
}