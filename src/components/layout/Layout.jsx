import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation, Outlet } from 'react-router-dom';
import './Layout.css';

const titles = {
  '/':              'Dashboard',
  '/materiais':     'Materiais',
  '/requisicoes':   'Requisições',
  '/usuarios':      'Usuários',
  '/departamentos': 'Departamentos',
  '/relatorios':    'Relatórios',
};

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main">
        <Topbar title={titles[pathname] ?? 'SisReq'} />

        <div className="content">
          <Outlet /> {/* 👈 AQUI renderiza as páginas */}
        </div>
      </main>
    </div>
  );
}