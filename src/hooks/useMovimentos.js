import { useState, useCallback } from 'react';
import movimentosService from '../services/movimentosService';

export function useMovimentos() {
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading]       = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await movimentosService.listar();
      setMovimentos(data);
    } catch (e) {
      console.error('Erro ao carregar movimentos:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { movimentos, loading, carregar };
}