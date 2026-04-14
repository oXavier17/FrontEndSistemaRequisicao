import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Materiais from './pages/Materiais';
import Requisicoes from './pages/Requisicoes';
import Usuarios from './pages/Usuarios';
import Departamentos from './pages/Departamentos';

function RotaProtegida({ children, perfis }) {
  const token = authService.tokenSalvo();
  if (!token) return <Navigate to="/login" replace />;

  // Se passou perfis permitidos, verifica
  if (perfis) {
    const usuario = authService.usuarioLogado();
    if (!perfis.includes(usuario?.tipoPerfil)) {
      return <Navigate to="/requisicoes" replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Layout />
            </RotaProtegida>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="materiais" element={<Materiais />} />
          <Route path="requisicoes" element={<Requisicoes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="departamentos" element={<Departamentos />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}