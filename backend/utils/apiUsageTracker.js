/**
 * Utilitário para monitorar o uso de APIs externas
 */

import ApiUsage from '../models/ApiUsage.js';

/**
 * Registrar uma chamada de API
 * @param {Object} usageData - Dados de uso da API
 * @param {string} usageData.api_name - Nome da API (ex: "openai", "dall-e")
 * @param {string} usageData.endpoint - Endpoint da API (ex: "/v1/chat/completions")
 * @param {string} [usageData.user_id] - ID do usuário que fez a chamada (opcional)
 * @param {number} [usageData.tokens_input] - Número de tokens de entrada
 * @param {number} [usageData.tokens_output] - Número de tokens de saída
 * @param {number} [usageData.cost] - Custo estimado da chamada
 * @param {boolean} usageData.success - Se a chamada foi bem-sucedida
 * @param {string} [usageData.error_message] - Mensagem de erro (se houver)
 * @param {number} usageData.response_time_ms - Tempo de resposta em milissegundos
 * @param {Object} [usageData.metadata] - Dados adicionais sobre a chamada
 * @returns {Promise<Object>} - Registro de uso criado
 */
export const trackApiUsage = async (usageData) => {
  try {
    const apiUsage = new ApiUsage(usageData);
    return await apiUsage.save();
  } catch (error) {
    console.error('Erro ao registrar uso de API:', error);
    // Não lançar erro para não interromper o fluxo principal
    return null;
  }
};

/**
 * Calcular o custo de uma chamada à API da OpenAI
 * @param {string} model - Modelo utilizado (ex: "gpt-4o", "dall-e-3")
 * @param {number} inputTokens - Número de tokens de entrada
 * @param {number} outputTokens - Número de tokens de saída
 * @returns {number} - Custo estimado em dólares
 */
export const calculateOpenAICost = (model, inputTokens, outputTokens) => {
  // Preços atualizados (maio/2024) - ajustar conforme necessário
  const prices = {
    'gpt-4o': {
      input: 0.000005, // $5 por 1M tokens
      output: 0.000015  // $15 por 1M tokens
    },
    'gpt-4': {
      input: 0.00001,  // $10 por 1M tokens
      output: 0.00003   // $30 por 1M tokens
    },
    'gpt-3.5-turbo': {
      input: 0.0000005, // $0.50 por 1M tokens
      output: 0.0000015  // $1.50 por 1M tokens
    },
    'dall-e-3': {
      // Custo por imagem, não por token
      '1024x1024': 0.040,
      '1024x1792': 0.080,
      '1792x1024': 0.080
    }
  };

  // Se for DALL-E, retornar o custo fixo por imagem
  if (model === 'dall-e-3') {
    return prices[model]['1024x1024']; // Preço padrão
  }

  // Para modelos de texto, calcular com base nos tokens
  const modelPrices = prices[model] || prices['gpt-3.5-turbo']; // Fallback para gpt-3.5-turbo
  const inputCost = inputTokens * modelPrices.input;
  const outputCost = outputTokens * modelPrices.output;
  
  return inputCost + outputCost;
};

/**
 * Estimar o número de tokens em um texto para a API da OpenAI
 * @param {string} text - Texto para estimar tokens
 * @returns {number} - Número estimado de tokens
 */
export const estimateTokens = (text) => {
  if (!text) return 0;
  
  // Estimativa simplificada: aproximadamente 4 caracteres por token para inglês
  // Para outros idiomas pode variar
  return Math.ceil(text.length / 4);
};

/**
 * Obter estatísticas de uso de API para um período
 * @param {Date} startDate - Data de início
 * @param {Date} endDate - Data de fim
 * @param {Object} [filterOptions] - Opções de filtro adicionais
 * @returns {Promise<Array>} - Estatísticas de uso
 */
export const getApiUsageStats = async (startDate, endDate, filterOptions = {}) => {
  return await ApiUsage.getUsageStats(filterOptions, startDate, endDate);
};

/**
 * Obter uso de API por usuário
 * @param {Date} startDate - Data de início
 * @param {Date} endDate - Data de fim
 * @returns {Promise<Array>} - Estatísticas de uso por usuário
 */
export const getUserApiUsage = async (startDate, endDate) => {
  return await ApiUsage.getUserUsage(startDate, endDate);
};

export default {
  trackApiUsage,
  calculateOpenAICost,
  estimateTokens,
  getApiUsageStats,
  getUserApiUsage
}; 