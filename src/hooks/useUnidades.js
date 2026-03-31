import { useState, useEffect, useCallback } from 'react';
import unidadesService from '../services/unidadesService';

export function useUnidades() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading]   = useState(true);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await unidadesService.listar();
      setUnidades(data);
    } catch (e) {
      console.error('Erro ao carregar unidades:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return { unidades, loading, carregar };
}