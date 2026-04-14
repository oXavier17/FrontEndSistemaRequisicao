import { useState, useEffect, useCallback } from 'react';
import categoriasService from '../services/categoriasService';

export function useCategorias() {
  const [categorias, setCategorias]       = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [loading, setLoading]             = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriasService.listar(mostrarInativos);
      setCategorias(data);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e.message);
    } finally {
      setLoading(false);
    }
  }, [mostrarInativos]);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (nome) => {
    const nova = await categoriasService.criar({ nome });
    setCategorias(prev => [...prev, nova]);
  };

  const editar = async (id, nome) => {
    const atualizada = await categoriasService.editar(id, { nome });
    setCategorias(prev => prev.map(c => c.idCategoria === id ? atualizada : c));
  };

  const alterarStatus = async (id) => {
    await categoriasService.alterarStatus(id);
    await carregar(); // Recarrega para refletir o novo status
  };

  const CategoriasAtivos = categorias.filter(m => m.ativo);

  return {
    categorias, loading, carregar,
    mostrarInativos, setMostrarInativos,
    criar, editar, alterarStatus, CategoriasAtivos
  };
}