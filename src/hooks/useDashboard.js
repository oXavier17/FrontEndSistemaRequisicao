import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

export function useDashboard() {
  const [dados, setDados]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await dashboardService.resumo();
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