import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Chat from './Chat';
import Agentes from './Agentes';
import Planos from './Planos';
import Afiliados from './Afiliados';
import Conversas from './Conversas';
import Admin from './Admin';
import Login from './Login';
import Register from './Register';
import Diagnostico from './Diagnostico';
import Home from './Home';
import Loading from '@/components/ui/loading';
import { isAuthenticated, isAdmin } from '../api/base44Client';
import PropTypes from 'prop-types';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Definição de PropTypes para o componente ProtectedRoute
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

// Componente de rota de administrador
const AdminRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth && isAdmin());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Definição de PropTypes para o componente AdminRoute
AdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

// Componente principal com rotas
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="agentes" element={<Agentes />} />
          <Route path="planos" element={<Planos />} />
          <Route path="afiliados" element={<Afiliados />} />
          <Route path="conversas" element={<Conversas />} />
          <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
        
        {/* Rotas diretas que redirecionam para as rotas dentro de /app */}
        <Route path="/conversas" element={<ProtectedRoute><Navigate to="/app/conversas" replace /></ProtectedRoute>} />
        <Route path="/agentes" element={<ProtectedRoute><Navigate to="/app/agentes" replace /></ProtectedRoute>} />
        <Route path="/planos" element={<ProtectedRoute><Navigate to="/app/planos" replace /></ProtectedRoute>} />
        <Route path="/afiliados" element={<ProtectedRoute><Navigate to="/app/afiliados" replace /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Navigate to="/app/chat" replace /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Navigate to="/app/admin" replace /></AdminRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;