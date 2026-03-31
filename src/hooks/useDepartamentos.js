import { useState, useEffect, useCallback } from 'react';
import departamentosService from '../services/departamentosService';

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [erro, setErro]                   = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await departamentosService.listar();
      setDepartamentos(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (nome) => {
    const novo = await departamentosService.criar({ nome, status: 1 });
    setDepartamentos(prev => [...prev, novo]);
  };

  const editar = async (id, nome) => {
    const atualizado = await departamentosService.editar(id, { nome });
    setDepartamentos(prev => prev.map(d => d.idDepartamento === id ? atualizado : d));
  };

  const excluir = async (id) => {
    await departamentosService.excluir(id);
    setDepartamentos(prev => prev.filter(d => d.idDepartamento !== id));
  };

  return { departamentos, loading, erro, carregar, criar, editar, excluir };
}