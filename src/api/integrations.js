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

// Invocar modelo de linguagem para processar texto
export const InvokeLLM = async (params) => {
  try {
    const response = await api.post('/integrations/invoke-llm', params);
    return response.data;
  } catch (error) {
    console.error('Erro ao invocar LLM:', error);
    throw error;
  }
};

// Gerar imagem usando IA
export const GenerateImageService = async (params) => {
  try {
    console.log('Chamando serviço de geração de imagem com parâmetros:', params);
    
    // Configurar FormData se houver arquivo de imagem de referência
    if (params.reference_image) {
      const formData = new FormData();
      
      // Adicionar imagem de referência
      formData.append('reference_image', params.reference_image);
      
      // Adicionar demais parâmetros como strings
      formData.append('prompt', params.prompt);
      formData.append('size', params.size || '1024x1024');
      
      if (params.agente_id) {
        formData.append('agente_id', params.agente_id);
      }
      
      if (params.use_documents !== undefined) {
        formData.append('use_documents', params.use_documents.toString());
      }
      
      if (params.text_overlay) {
        formData.append('text_overlay', params.text_overlay);
        formData.append('text_position', params.text_position || 'bottom');
      }
      
      console.log('Enviando formData com imagem de referência');
      
      const response = await api.post('/integrations/generate-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // Caso não tenha imagem de referência, enviar como JSON normal
      console.log('Enviando JSON para geração de imagem');
      
      const response = await api.post('/integrations/generate-image', params);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    alert('Erro ao gerar imagem: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'));
    throw error;
  }
};

// Obter histórico de imagens geradas
export const GetGeneratedImages = async (limit = 10) => {
  try {
    const response = await api.get(`/integrations/generated-images?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter imagens geradas:', error);
    throw error;
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

export default {
  InvokeLLM,
  GenerateImageService,
  GetGeneratedImages
};






