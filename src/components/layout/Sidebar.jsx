import { LayoutDashboard, ClipboardList, Package, Users, Building2, BarChart3, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/requisicoes', icon: ClipboardList,   label: 'Requisições', badge: 8 },
  { to: '/materiais',   icon: Package,         label: 'Materiais' },
  { to: '/usuarios',    icon: Users,           label: 'Usuários' },
  { to: '/departamentos', icon: Building2,     label: 'Departamentos' },
  { to: '/relatorios',  icon: BarChart3,       label: 'Relatórios' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-badge">
          <div className="logo-icon">📦</div>
          <div className="logo-text">
            SRM
            <span>Sistema de Requisição</span>
          </div>
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Painel do Admin</div>
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

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">XA</div>
          <div className="user-info">
            <div className="user-name">Xavier Admin</div>
            <div className="user-role">Administrador</div>
          </div>
          <div className="logout-btn" title="Sair">
            <LogOut size={15} />
          </div>
        </div>
      </div>
    </aside>
  );
}