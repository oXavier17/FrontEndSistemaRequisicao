import { useState, useEffect, useCallback } from 'react';
import usuariosService from '../services/usuariosService';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await usuariosService.listar();
      setUsuarios(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = async (form) => {
    // Monta o body no formato que o Spring Boot espera
    // baseado na sua tabela Usuario + subtabela por tipo_perfil
    const payload = {
      nome:        form.nome,
      cpf:         form.cpf,
      email:       form.email,
      senha:       form.senha,
      tipo_perfil: perfilParaInt(form.perfil),
      status:      true,
      // departamentoId só vai se for Funcionário ou Requisitante
      ...(form.departamentoId && { departamentoId: form.departamentoId }),
    };
    const novo = await usuariosService.criar(payload);
    setUsuarios(prev => [...prev, novo]);
  };

  const editar = async (id, form) => {
    const payload = {
      nome:        form.nome,
      cpf:         form.cpf,
      email:       form.email,
      tipo_perfil: perfilParaInt(form.perfil),
      // só envia senha se foi preenchida
      ...(form.senha && { senha: form.senha }),
      ...(form.departamentoId && { departamentoId: form.departamentoId }),
    };
    const atualizado = await usuariosService.editar(id, payload);
    setUsuarios(prev => prev.map(u => u.idUsuario === id ? atualizado : u));
  };

  const excluir = async (id) => {
    await usuariosService.excluir(id);
    setUsuarios(prev => prev.filter(u => u.idUsuario !== id));
  };

  return { usuarios, loading, erro, carregar, criar, editar, excluir };
}

// Converte label do front → int do banco
// 1 ADM, 2 FUNCIONARIO, 3 REQUISITANTE
export function perfilParaInt(perfil) {
  const map = { 'Administrador': 1, 'Funcionário': 2, 'Requisitante': 3 };
  return map[perfil] ?? 1;
}

// Converte int do banco → label do front
export function intParaPerfil(tipo) {
  const map = { 1: 'Administrador', 2: 'Funcionário', 3: 'Requisitante' };
  return map[tipo] ?? 'Administrador';
}