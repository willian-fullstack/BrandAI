import api from './base44Client';

// Funções para gerenciar integrações
export const getMinhasIntegracoes = async () => {
  try {
    const response = await api.get('/integrations/minhas');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar integrações' };
  }
};

export const getIntegracaoById = async (id) => {
  try {
    const response = await api.get(`/integrations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar integração' };
  }
};

export const criarIntegracao = async (data) => {
  try {
    const response = await api.post('/integrations', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao criar integração' };
  }
};

export const atualizarIntegracao = async (id, data) => {
  try {
    const response = await api.put(`/integrations/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao atualizar integração' };
  }
};

export const excluirIntegracao = async (id) => {
  try {
    const response = await api.delete(`/integrations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao excluir integração' };
  }
};

export const testarIntegracao = async (id) => {
  try {
    const response = await api.post(`/integrations/${id}/testar`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao testar integração' };
  }
};

// Integração para invocar modelos de linguagem (LLM)
export const InvokeLLM = async (params = {}) => {
  try {
    console.log('InvokeLLM - Parâmetros:', JSON.stringify({
      prompt: params.prompt?.substring(0, 50) + '...',
      file_urls: params.file_urls || []
    }));
    
    // Usar a rota de integrations que existe no backend
    const response = await api.post('/integrations/invoke-llm', params);
    return response.data;
  } catch (error) {
    console.error("Erro ao invocar LLM:", error);
    throw error.response?.data || { message: 'Erro ao invocar o modelo de linguagem' };
  }
};

// Integração para gerar imagens com IA
export const GenerateImage = async (prompt, options = {}) => {
  try {
    const response = await api.post('/ia/generate-image', { prompt, ...options });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao gerar imagem' };
  }
};

// Integração para upload de arquivos
export const UploadFile = async ({ file }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/integrations/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao fazer upload do arquivo' };
  }
};

// Integração para transcrição de áudio
export const TranscribeAudio = async (audioFile, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    // Adicionar opções como campos de formulário
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });
    
    const response = await api.post('/ia/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao transcrever áudio' };
  }
};

// Integração para análise de documentos
export const AnalyzeDocument = async (documentFile, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('document', documentFile);
    
    // Adicionar opções como campos de formulário
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });
    
    const response = await api.post('/ia/analyze-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao analisar documento' };
  }
};

// Função para buscar informações da web
export const SearchWeb = async (query, options = {}) => {
  try {
    const response = await api.get('/integrations/search', {
      params: {
        query,
        ...options
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao buscar informações na web' };
  }
};

// Função para integração com calendário
export const CalendarIntegration = {
  getEvents: async (startDate, endDate) => {
    try {
      const response = await api.get('/integrations/calendar', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar eventos do calendário' };
    }
  },
  
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/integrations/calendar', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar evento no calendário' };
    }
  },
  
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/integrations/calendar/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar evento no calendário' };
    }
  },
  
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/integrations/calendar/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao excluir evento do calendário' };
    }
  }
};

// Integração para webhooks
export const RegisterWebhook = async (url, events, secret = null) => {
  try {
    const response = await api.post('/integrations/webhook', { url, events, secret });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao registrar webhook' };
  }
};

// Integração para upload de documentos de treinamento para agentes de IA
export const UploadTrainingDocument = async (agenteId, formData) => {
  try {
    const response = await api.post(`/integrations/upload-training/${agenteId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao fazer upload do documento de treinamento' };
  }
};






