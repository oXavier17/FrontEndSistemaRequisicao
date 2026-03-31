import { useState, useEffect, useCallback } from 'react';
import materiaisService from '../services/materiaisService';

export function useMateriais() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await materiaisService.listar();
      setMateriais(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (form) => {
    const payload = {
      nome:        form.nome,
      estoqueAtual: Number(form.estoque),
      estoqueMin:   Number(form.minimo),
      categoriaId:  Number(form.categoriaId),
      unMedId:      Number(form.unMedId),
      preco:        Number(form.preco),
      status:       1,
    };
    const novo = await materiaisService.criar(payload);
    setMateriais(prev => [...prev, novo]);
  };

  const editar = async (id, form) => {
    const payload = {
      nome:         form.nome,
      estoqueAtual: Number(form.estoque),
      estoqueMin:   Number(form.minimo),
      categoriaId:  Number(form.categoriaId),
      unMedId:      Number(form.unMedId),
      preco:        Number(form.preco),
    };
    const atualizado = await materiaisService.editar(id, payload);
    setMateriais(prev => prev.map(m => m.idMaterial === id ? atualizado : m));
  };

  const excluir = async (id) => {
    await materiaisService.excluir(id);
    setMateriais(prev => prev.filter(m => m.idMaterial !== id));
  };

  return { materiais, loading, erro, carregar, criar, editar, excluir };
}