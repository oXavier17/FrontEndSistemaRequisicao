import { useState, useEffect, useCallback } from 'react';
import departamentosService from '../services/departamentosService';

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [erro, setErro]                   = useState(null);
  const [mostrarInativosState, setMostrarInativosState] = useState(() => {
    return localStorage.getItem('departamentos_mostrarInativos') === 'true';
  });

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await departamentosService.listar(mostrarInativosState);
      setDepartamentos(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [mostrarInativosState]);

  useEffect(() => { carregar(); }, [carregar]);

  const setMostrarInativos = (valor) => {
    const novoValor = typeof valor === 'function' ? valor(mostrarInativosState) : valor;
    setMostrarInativosState(novoValor);
    localStorage.setItem('departamentos_mostrarInativos', String(novoValor));
  };

  const criar = async (nome) => {
    const novo = await departamentosService.criar({ nome });
    setDepartamentos(prev => [...prev, novo]);
  };

  const editar = async (id, nome) => {
    const atualizado = await departamentosService.editar(id, { nome });
    setDepartamentos(prev => prev.map(d => d.idDepartamento === id ? atualizado : d));
  };

  const alterarStatus = async (id) => {
    await departamentosService.alterarStatus(id);
    await carregar();
  };

  return {
  departamentos, loading, erro, carregar,
  mostrarInativos: mostrarInativosState,
  setMostrarInativos,
  criar, editar, alterarStatus,
};
}