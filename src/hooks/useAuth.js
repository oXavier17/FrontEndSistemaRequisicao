import { useEffect, useState } from 'react';
import authService from '../services/authService';

export function useAuth() {
  const [usuario, setUsuario] = useState(authService.usuarioLogado());

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsuario(null);
      return;
    }

  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario"); // se você salva
    setUsuario(null);
  };

  return {
    usuario,
    isAdmin:        usuario?.tipoPerfil === 1,
    isFuncionario:  usuario?.tipoPerfil === 2,
    isRequisitante: usuario?.tipoPerfil === 3,
    idUsuario:      usuario?.idUsuario,
    logout,
  };
}