import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materiais from './pages/Materiais';
import Requisicoes from './pages/Requisicoes';
import Usuarios from './pages/Usuarios';
import Departamentos from './pages/Departamentos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Fora do Layout — sem sidebar */}
        <Route path="/login" element={<Login />} />

        {/* Dentro do Layout — com sidebar */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/materiais"     element={<Materiais />} />
              <Route path="/requisicoes"   element={<Requisicoes />} />
              <Route path="/usuarios"      element={<Usuarios />} />
              <Route path="/departamentos" element={<Departamentos />} />
            </Routes>
          </Layout>
        }/>
      </Routes>
    </BrowserRouter>
  );
}