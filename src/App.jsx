import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Materiais from './pages/Materiais';
import Requisicoes from './pages/Requisicoes';
import Usuarios from './pages/Usuarios';
import Departamentos from './pages/Departamentos';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                 element={<Dashboard />} />
          <Route path="/materiais"        element={<Materiais />} />
          <Route path="/requisicoes"      element={<Requisicoes />} />
          <Route path="/usuarios"         element={<Usuarios />} />
          <Route path="/departamentos"    element={<Departamentos />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}