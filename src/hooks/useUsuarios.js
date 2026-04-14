import { useState, useEffect, useCallback } from 'react';
import usuariosService from '../services/usuariosService';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarInativos, setMostrarInativos] = useState(() => {
    return localStorage.getItem('usuarios_mostrarInativos') === 'true';
  });
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await usuariosService.listar(mostrarInativos);
      setUsuarios(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [mostrarInativos]);

  useEffect(() => { carregar(); }, [carregar]);

  const toggleInativos = (valor) => {
    const novoValor = typeof valor === 'function' ? valor(mostrarInativos) : valor;
    setMostrarInativos(novoValor);
    localStorage.setItem('usuarios_mostrarInativos', String(novoValor));
  };

  const criar = async (form) => {
    const payload = {
      nome:          form.nome,
      cpf:           form.cpf,
      email:         form.email,
      senha:         form.senha,
      tipoPerfil:    perfilParaInt(form.perfil),
      departamentoId: form.departamentoId ? Number(form.departamentoId) : null,
    };
    const novo = await usuariosService.criar(payload);
    setUsuarios(prev => [...prev, novo]);
  };

  const editar = async (id, form) => {
    const payload = {
      nome:          form.nome,
      cpf:           form.cpf,
      email:         form.email,
      tipoPerfil:    perfilParaInt(form.perfil),
      departamentoId: form.departamentoId ? Number(form.departamentoId) : null,
      ...(form.senha && { senha: form.senha }),
    };
    const atualizado = await usuariosService.editar(id, payload);
    setUsuarios(prev => prev.map(u => u.idUsuario === id ? atualizado : u));
  };

  const alterarStatus = async (id) => {
    await usuariosService.alterarStatus(id);
    await carregar(); // Recarrega para refletir o novo status
  };

  return {
    usuarios, loading, erro, carregar,
    mostrarInativos,
    setMostrarInativos: toggleInativos, // ← usa o toggleInativos que persiste no localStorage
    criar, editar, alterarStatus,
  };
}

export function perfilParaInt(perfil) {
  const map = { 'Administrador': 1, 'Funcionário': 2, 'Requisitante': 3 };
  return map[perfil] ?? 1;
}

export function intParaPerfil(tipo) {
  const map = { 1: 'Administrador', 2: 'Funcionário', 3: 'Requisitante' };
  return map[tipo] ?? 'Administrador';
}