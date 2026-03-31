import { Bell, User } from 'lucide-react';
import './Topbar.css';

export default function Topbar({ title }) {
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
        <div className="icon-btn">
          <Bell size={16} />
          <div className="notif-dot" />
        </div>
        <div className="icon-btn">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}