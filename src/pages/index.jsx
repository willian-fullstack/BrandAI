import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { isAuthenticated, isAdmin } from '../api/base44Client';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirecionar para login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente de rota de administrador
const AdminRoute = ({ children }) => {
  if (!isAuthenticated() || !isAdmin()) {
    // Redirecionar para login se não estiver autenticado ou não for admin
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente principal com rotas
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="agentes" element={<Agentes />} />
          <Route path="planos" element={<Planos />} />
          <Route path="afiliados" element={<Afiliados />} />
          <Route path="conversas" element={<Conversas />} />
          <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;