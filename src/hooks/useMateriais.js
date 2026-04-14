import { useState, useEffect, useCallback } from 'react';
import materiaisService from '../services/materiaisService';

export function useMateriais() {
  const [materiais, setMateriais]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState(null);
  const [mostrarInativosState, setMostrarInativosState] = useState(() => {
    return localStorage.getItem('materiais_mostrarInativos') === 'true';
  });

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await materiaisService.listar(mostrarInativosState);
      setMateriais(data);
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
    localStorage.setItem('materiais_mostrarInativos', String(novoValor));
  };

  const criar = async (form) => {
    const payload = {
      nome:        form.nome,
      estoqueAtual: 0,
      estoqueMin:  Number(form.minimo),
      categoriaId: Number(form.categoriaId),
      unidade:     form.unidade,
      status:      1,
    };
    const novo = await materiaisService.criar(payload);
    setMateriais(prev => [...prev, novo]);
  };

  const editar = async (id, form) => {
    const payload = {
      nome:        form.nome,
      estoqueMin:  Number(form.minimo),
      categoriaId: Number(form.categoriaId),
      unidade:     form.unidade,
    };
    const atualizado = await materiaisService.editar(id, payload);
    setMateriais(prev => prev.map(m => m.idMaterial === id ? atualizado : m));
  };

  const alterarStatus = async (id) => {
    await materiaisService.alterarStatus(id);
    await carregar();
  };

  const movimentar = async (dados) => {
    const resultado = await materiaisService.registrarMovimento({
      materialId:   Number(dados.materialId),
      tipo:         dados.tipo === 'entrada' ? 0 : 1,
      quantidade:   Number(dados.quantidade),
      fornecedorId: dados.fornecedorId ? Number(dados.fornecedorId) : null,
      preco:        dados.preco ? Number(dados.preco) : null,
      observacao:   dados.observacao || null,
    });
    await carregar();
    return resultado;
  };

  return {
    materiais, setMateriais, loading, erro, carregar,
    mostrarInativos: mostrarInativosState,
    setMostrarInativos,
    criar, editar, alterarStatus, movimentar,
  };
}