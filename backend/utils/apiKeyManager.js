/**
 * Utilitário para gerenciar chaves de API, incluindo rotação de chaves
 * Este módulo fornece funções para obter, validar e rotacionar chaves de API
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Mapa para armazenar cache de chaves
const apiKeyCache = new Map();

/**
 * Obter chave de API da configuração ou banco de dados
 * @param {string} keyName - Nome da chave (ex: "OPENAI_API_KEY")
 * @param {boolean} fromEnvOnly - Se true, busca apenas no .env
 * @returns {Promise<string>} - Chave de API
 */
export const getApiKey = async (keyName, fromEnvOnly = false) => {
  // Se estiver no cache, retornar do cache
  if (apiKeyCache.has(keyName)) {
    return apiKeyCache.get(keyName);
  }

  // Primeira opção: variável de ambiente
  let apiKey = process.env[keyName];
  
  // Segunda opção (se não forçado apenas .env): banco de dados
  if (!apiKey && !fromEnvOnly) {
    try {
      // Verificar se o modelo ConfiguracaoIA existe
      if (mongoose.models.ConfiguracaoIA) {
        const ConfiguracaoIA = mongoose.models.ConfiguracaoIA;
        const config = await ConfiguracaoIA.findOne({});
        
        if (config) {
          // O nome da chave pode ser armazenado em diferentes formatos no banco
          if (keyName === 'OPENAI_API_KEY' && config.gpt_api_key) {
            apiKey = config.gpt_api_key;
          }
          // Adicionar outros mapeamentos conforme necessário
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar chave ${keyName} no banco de dados:`, error);
    }
  }
  
  // Armazenar no cache e retornar
  if (apiKey) {
    apiKeyCache.set(keyName, apiKey);
    return apiKey;
  }
  
  // Se não encontrar, retornar null
  return null;
};

/**
 * Validar se uma chave de API está funcionando
 * @param {string} keyName - Nome da chave (ex: "OPENAI_API_KEY")
 * @returns {Promise<boolean>} - Se a chave é válida
 */
export const validateApiKey = async (keyName) => {
  const apiKey = await getApiKey(keyName);
  
  if (!apiKey) {
    return false;
  }
  
  // Verificar com base no tipo de chave
  if (keyName === 'OPENAI_API_KEY') {
    try {
      const axios = (await import('axios')).default;
      
      // Fazer uma chamada simples para a API da OpenAI
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error(`Chave ${keyName} inválida:`, error.message);
      return false;
    }
  }
  
  // Implementar validação para outros tipos de chaves conforme necessário
  
  return true; // Assumir válida se não tiver validação específica
};

/**
 * Rotacionar para uma nova chave de API
 * @param {string} keyName - Nome da chave (ex: "OPENAI_API_KEY")
 * @param {string} newApiKey - Nova chave de API
 * @returns {Promise<boolean>} - Se a rotação foi bem-sucedida
 */
export const rotateApiKey = async (keyName, newApiKey) => {
  try {
    // Validar a nova chave
    if (keyName === 'OPENAI_API_KEY') {
      const axios = (await import('axios')).default;
      
      try {
        // Testar a nova chave
        const response = await axios.get('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${newApiKey}`
          }
        });
        
        if (response.status !== 200) {
          return false;
        }
      } catch (error) {
        console.error(`Nova chave ${keyName} inválida:`, error.message);
        return false;
      }
    }
    
    // Atualizar no banco de dados se o modelo existir
    if (mongoose.models.ConfiguracaoIA) {
      const ConfiguracaoIA = mongoose.models.ConfiguracaoIA;
      
      if (keyName === 'OPENAI_API_KEY') {
        await ConfiguracaoIA.findOneAndUpdate(
          {}, 
          { gpt_api_key: newApiKey },
          { upsert: true }
        );
      }
      // Implementar para outros tipos de chaves conforme necessário
    }
    
    // Atualizar no cache
    apiKeyCache.set(keyName, newApiKey);
    
    return true;
  } catch (error) {
    console.error(`Erro ao rotacionar chave ${keyName}:`, error);
    return false;
  }
};

/**
 * Limpar o cache de chaves
 */
export const clearApiKeyCache = () => {
  apiKeyCache.clear();
};

export default {
  getApiKey,
  validateApiKey,
  rotateApiKey,
  clearApiKeyCache
}; 