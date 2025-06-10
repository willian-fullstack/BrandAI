import api from './base44Client';

// Funções para Conversa
export const Conversa = {
  getAll: async () => {
    try {
      const response = await api.get('/conversas');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar conversas' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/conversas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar conversa' };
    }
  },
  
  create: async (conversaData) => {
    try {
      const response = await api.post('/conversas', conversaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar conversa' };
    }
  },
  
  update: async (id, conversaData) => {
    try {
      const response = await api.put(`/conversas/${id}`, conversaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar conversa' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/conversas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir conversa' };
    }
  },
  
  filter: async (filtros, orderBy = '-created_date', limit = 100) => {
    try {
      const response = await api.get('/conversas', { 
        params: { ...filtros, orderBy, limit } 
      });
      return response.data.conversas || [];
    } catch (error) {
      console.error('Erro ao filtrar conversas:', error);
      return [];
    }
  },
  
  addMessage: async (id, messageData) => {
    try {
      const response = await api.post(`/conversas/${id}/mensagens`, messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao adicionar mensagem' };
    }
  }
};

// Funções para AgenteConfig
export const AgenteConfig = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/agente-config', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configurações de agentes' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/agente-config/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configuração de agente' };
    }
  },
  
  create: async (agenteData) => {
    try {
      const response = await api.post('/agente-config', agenteData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar configuração de agente' };
    }
  },
  
  update: async (codigo, agenteData) => {
    try {
      console.log('Atualizando agente com código:', codigo);
      console.log('Dados enviados para atualização:', JSON.stringify(agenteData));
      
      // Garantir que estamos enviando apenas os campos necessários
      const dadosParaEnviar = {
        ...agenteData,
        codigo: codigo // Garantir que o código está correto
      };
      
      // Remover campos que podem causar problemas
      delete dadosParaEnviar._id;
      delete dadosParaEnviar.id;
      delete dadosParaEnviar.__v;
      
      // Usar o código como identificador (não o id)
      const response = await api.put(`/agente-config/${codigo}`, dadosParaEnviar);
      console.log('Resposta da atualização do agente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar agente:', error.response?.data || error);
      throw error.response?.data || { message: 'Erro ao atualizar configuração de agente' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/agente-config/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir configuração de agente' };
    }
  },
  
  deleteDocumento: async (codigo, documentoId) => {
    try {
      const response = await api.delete(`/agente-config/${codigo}/documento/${documentoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir documento de treinamento' };
    }
  }
};

// Funções para Indicacao
export const Indicacao = {
  getAll: async () => {
    try {
      const response = await api.get('/indicacoes');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar indicações' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/indicacoes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar indicação' };
    }
  },
  
  create: async (indicacaoData) => {
    try {
      const response = await api.post('/indicacoes', indicacaoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar indicação' };
    }
  },
  
  update: async (id, indicacaoData) => {
    try {
      const response = await api.put(`/indicacoes/${id}`, indicacaoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar indicação' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/indicacoes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir indicação' };
    }
  },
  
  filter: async (filtros, orderBy = '-created_date', limit = 100) => {
    try {
      const response = await api.get('/indicacoes/filter', { 
        params: { ...filtros, orderBy, limit } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao filtrar indicações' };
    }
  }
};

// Funções para ConfiguracaoIA
export const ConfiguracaoIA = {
  getAll: async () => {
    try {
      const response = await api.get('/configuracao-ia');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configurações de IA' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/configuracao-ia/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configuração de IA' };
    }
  },
  
  create: async (configData) => {
    try {
      const response = await api.post('/configuracao-ia', configData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar configuração de IA' };
    }
  },
  
  update: async (id, configData) => {
    try {
      const response = await api.put(`/configuracao-ia/${id}`, configData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar configuração de IA' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/configuracao-ia/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir configuração de IA' };
    }
  }
};

// Funções para ConfiguracaoPlanos
export const ConfiguracaoPlanos = {
  getAll: async () => {
    try {
      const response = await api.get('/configuracao-planos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configurações de planos' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/configuracao-planos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configuração de plano' };
    }
  },
  
  create: async (planoData) => {
    try {
      const response = await api.post('/configuracao-planos', planoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar configuração de plano' };
    }
  },
  
  update: async (id, planoData) => {
    try {
      const response = await api.put(`/configuracao-planos/${id}`, planoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar configuração de plano' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/configuracao-planos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir configuração de plano' };
    }
  }
};

// Funções para ConfiguracaoPagamento
export const ConfiguracaoPagamento = {
  getAll: async () => {
    try {
      const response = await api.get('/configuracao-pagamento');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configurações de pagamento' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/configuracao-pagamento/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar configuração de pagamento' };
    }
  },
  
  create: async (configData) => {
    try {
      const response = await api.post('/configuracao-pagamento', configData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar configuração de pagamento' };
    }
  },
  
  update: async (id, configData) => {
    try {
      const response = await api.put(`/configuracao-pagamento/${id}`, configData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar configuração de pagamento' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/configuracao-pagamento/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir configuração de pagamento' };
    }
  }
};

// auth sdk:
export const User = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar usuários' };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar usuário' };
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar perfil' };
    }
  },
  
  update: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar usuário' };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir usuário' };
    }
  },
  
  me: async () => {
    try {
      // Primeiro, tenta obter os dados do localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        // Se existir, retorna os dados
        return JSON.parse(userData);
      } else {
        // Se não existir, busca do servidor
        const response = await api.get('/users/profile');
        // Atualiza o localStorage com os dados mais recentes
        localStorage.setItem('userData', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar dados do usuário' };
    }
  },
  
  updateMyUserData: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      // Atualiza o localStorage com os dados atualizados
      const currentUserData = localStorage.getItem('userData');
      if (currentUserData) {
        const parsedData = JSON.parse(currentUserData);
        localStorage.setItem('userData', JSON.stringify({
          ...parsedData,
          ...response.data
        }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar dados do usuário' };
    }
  }
};