import { Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './Topbar.css';

export default function Topbar({ title }) {
  const { tema, toggleTema } = useTheme();

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>

      <div className="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Pesquisar..." />
      </div>

      <div className="topbar-actions">

        {/* Toggle de tema */}
        <div className="icon-btn" onClick={toggleTema} title={tema === 'dark' ? 'Modo claro' : 'Modo escuro'}
          style={{ cursor: 'pointer' }}>
          {tema === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
        </div>

        {/* Perfil */}
        <div className="icon-btn" title="Perfil">
          <User size={16} />
        </div>

      </div>
    </header>
  );
}