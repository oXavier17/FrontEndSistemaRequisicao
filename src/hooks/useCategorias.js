import { useState, useEffect, useCallback } from 'react';
import categoriasService from '../services/categoriasService';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriasService.listar();
      setCategorias(data);
    } catch (e) {
      console.error('Erro ao carregar categorias:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (nome) => {
    const nova = await categoriasService.criar(nome);
    setCategorias(prev => [...prev, nova]);
  };

  const editar = async (id, nome) => {
    const atualizada = await categoriasService.editar(id, nome);
    setCategorias(prev => prev.map(c => c.idCategoria === id ? atualizada : c));
  };

  const excluir = async (id) => {
    await categoriasService.excluir(id);
    setCategorias(prev => prev.filter(c => c.idCategoria !== id));
  };

  return { categorias, loading, carregar, criar, editar, excluir };
}