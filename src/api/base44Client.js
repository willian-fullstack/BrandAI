import axios from 'axios';

// Configurar a URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Criar uma instância do axios com a URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação às requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Lidar com erro 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      // Limpar dados de autenticação e redirecionar para login
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      
      // Redirecionar para a página de login se não estiver nela
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Funções para autenticação
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    
    // Salvar token e dados do usuário no localStorage
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao fazer login' };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao registrar usuário' };
  }
};

export const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('userToken');
};

export const isAdmin = () => {
  const userData = getCurrentUser();
  return userData && userData.role === 'admin';
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    
    // Atualizar dados do usuário no localStorage
    localStorage.setItem('userData', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar perfil' };
  }
};

// Exportar a instância do axios para uso em outros módulos
export default api;
