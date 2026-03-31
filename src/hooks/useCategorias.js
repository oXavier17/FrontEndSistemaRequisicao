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

  return { categorias, loading, carregar };
}