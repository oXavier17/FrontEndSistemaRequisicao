import { useState, useEffect, useCallback } from 'react';
import materiaisService from '../services/materiaisService';

const USE_MOCK = true;

export function useMateriais() {
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = USE_MOCK ? await Promise.resolve([]) : await materiaisService.listar();
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
      nome:         form.nome,
      estoqueAtual: 0,
      estoqueMin:   Number(form.minimo),
      categoriaId:  Number(form.categoriaId),
      unidade:      form.unidade,   // ← enum string: 'UN', 'CX', 'KG'...
      status:       1,
      // sem preço aqui — vai na movimentação
    };
    const novo = USE_MOCK
      ? { idMaterial: Date.now(), ...payload }
      : await materiaisService.criar(payload);
    setMateriais(prev => [...prev, novo]);
  };

  const editar = async (id, form) => {
    const payload = {
      nome:        form.nome,
      estoqueMin:  Number(form.minimo),
      categoriaId: Number(form.categoriaId),
      unidade:     form.unidade,
    };
    const atualizado = USE_MOCK
      ? { ...materiais.find(m => m.idMaterial === id), ...payload }
      : await materiaisService.editar(id, payload);
    setMateriais(prev => prev.map(m => m.idMaterial === id ? atualizado : m));
  };

  const excluir = async (id) => {
    if (!USE_MOCK) await materiaisService.excluir(id);
    setMateriais(prev => prev.filter(m => m.idMaterial !== id));
  };

  return { materiais, setMateriais, loading, erro, carregar, criar, editar, excluir };
}