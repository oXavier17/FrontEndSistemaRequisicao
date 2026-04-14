import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Building2,
  BarChart3,
  LogOut
} from 'lucide-react';

import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';
import './Sidebar.css';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const navigate = useNavigate();
  //const usuario = authService.usuarioLogado();
  const { isAdmin, isFuncionario, isRequisitante, usuario } = useAuth();

  const [requisicoesPendentes, setRequisicoesPendentes] = useState(null);

  useEffect(() => {
    api.get('/requisicoes')
      .then(r => {
        const abertas = r.data.filter(req => req.status === 1).length;
        setRequisicoesPendentes(abertas > 0 ? abertas : null);
      })
      .catch(() => setRequisicoesPendentes(null));
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/',               icon: LayoutDashboard, label: 'Dashboard',      show: isAdmin || isFuncionario },
    { to: '/requisicoes',    icon: ClipboardList,   label: 'Requisições',    show: true,          badge: requisicoesPendentes },
    { to: '/materiais',      icon: Package,         label: 'Materiais',      show: isAdmin || isFuncionario },
    { to: '/usuarios',       icon: Users,           label: 'Usuários',       show: isAdmin },
    { to: '/departamentos',  icon: Building2,       label: 'Departamentos',  show: isAdmin || isFuncionario },
    { to: '/relatorios',     icon: BarChart3,       label: 'Relatórios',     show: isAdmin || isFuncionario },
  ].filter(item => item.show);

  return (
    <aside className="sidebar">
      
      {/* LOGO */}
      <div className="logo-area">
        <div className="logo-badge">
          <div className="logo-icon">📦</div>
          <div className="logo-text">
            SisReq
            <span>Sistema de Requisição</span>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="nav-section">
        <div className="nav-label">Painel</div>

        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} className="nav-icon" />
            {label}
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER / USUÁRIO */}
      <div className="sidebar-footer">
        <div className="user-card">
          
          <div className="avatar">
            {usuario?.nome?.slice(0,2).toUpperCase() ?? 'US'}
          </div>

          <div className="user-info">
            <div className="user-name">
              {usuario?.nome ?? 'Usuário'}
            </div>

            <div className="user-role">
              {usuario?.tipoPerfil === 1 ? 'Administrador' :
               usuario?.tipoPerfil === 2 ? 'Funcionário' :
               'Requisitante'}
            </div>
          </div>

          <div
            className="logout-btn"
            title="Sair"
            onClick={handleLogout}
          >
            <LogOut size={15} />
          </div>

        </div>
      </div>

    </aside>
  );
}