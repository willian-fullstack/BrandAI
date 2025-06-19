import axios from 'axios';

// Configurar a URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Criar uma instância do axios com a URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para enviar e receber cookies
});

// Token armazenado em memória (não persistente)
let inMemoryToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Função para tentar renovar o token
const refreshTokenIfNeeded = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post(`${API_URL}/users/refresh-token`, {}, { withCredentials: true });
    
    if (response.data.token) {
      inMemoryToken = response.data.token;
      processQueue(null, inMemoryToken);
      return inMemoryToken;
    }
    throw new Error('Token não recebido do servidor');
  } catch (error) {
    processQueue(error, null);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Interceptor para adicionar o token de autenticação às requisições
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
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
  async (error) => {
    const originalRequest = error.config;
    
    // Se o erro for 401 (não autorizado) e não estamos já tentando refreshar o token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;

      try {
        const token = await refreshTokenIfNeeded();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Limpar token e redirecionar para login
        inMemoryToken = null;
        sessionStorage.removeItem('userData');
        
        // Redirecionar para a página de login se não estiver nela
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response) {
      console.error('Erro na resposta da API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Sem resposta da API:', error.request);
    } else {
      console.error('Erro ao configurar requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Funções para autenticação
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    
    // Armazenar token em memória em vez de localStorage
    inMemoryToken = response.data.token;
    
    // Armazenar apenas dados não sensíveis do usuário em sessionStorage
    const userData = {
      _id: response.data._id,
      nome: response.data.nome,
      email: response.data.email,
      role: response.data.role,
      plano: response.data.plano,
      plano_atual: response.data.plano,
      avatar: response.data.avatar,
      status: response.data.status,
      creditos_restantes: response.data.creditos_disponiveis,
      creditos_ilimitados: response.data.creditos_ilimitados,
      agentes_liberados: response.data.agentes_liberados,
    };
    
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
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

export const logout = async () => {
  try {
    // Chamar endpoint de logout para invalidar o refresh token no servidor
    await api.post('/users/logout');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Sempre limpar os dados locais, mesmo se houver erro no servidor
    inMemoryToken = null;
    sessionStorage.removeItem('userData');
  }
};

export const getCurrentUser = () => {
  const userData = sessionStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = async () => {
  // Se já temos um token em memória, estamos autenticados
  if (inMemoryToken) {
    return true;
  }

  // Se não temos token em memória, mas temos dados do usuário, tentar renovar o token
  if (getCurrentUser()) {
    try {
      await refreshTokenIfNeeded();
      return true;
    } catch (error) {
      return false;
    }
  }

  return false;
};

export const isAdmin = () => {
  const userData = getCurrentUser();
  return userData && userData.role === 'admin';
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    
    // Atualizar dados do usuário no sessionStorage
    const currentUserData = getCurrentUser();
    const updatedUserData = { ...currentUserData, ...response.data };
    sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar perfil' };
  }
};

// Exportar a instância do axios para uso em outros módulos
export default api;
