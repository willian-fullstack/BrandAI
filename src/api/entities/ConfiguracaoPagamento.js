import api from '../base44Client';

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
  },
  
  // Alias para compatibilidade com o Admin.jsx
  list: async () => {
    return ConfiguracaoPagamento.getAll();
  }
}; 