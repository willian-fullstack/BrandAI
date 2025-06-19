/**
 * Utilitário para gerenciar chaves de API, incluindo rotação de chaves
 * Este módulo fornece funções para obter, validar e rotacionar chaves de API
 * com criptografia e segurança aprimorada
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Estrutura para armazenar cache de chaves com tempo de expiração
const apiKeyCache = {
  keys: new Map(),
  // Define o tempo de vida do cache em milissegundos (30 minutos)
  ttl: 30 * 60 * 1000,
  
  // Método para definir uma chave no cache com timestamp
  set: function(key, value) {
    this.keys.set(key, {
      value,
      timestamp: Date.now()
    });
  },
  
  // Método para obter uma chave, verificando se expirou
  get: function(key) {
    const item = this.keys.get(key);
    if (!item) return null;
    
    // Verificar se o item expirou
    if (Date.now() - item.timestamp > this.ttl) {
      this.keys.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  // Método para limpar o cache
  clear: function() {
    this.keys.clear();
  }
};

/**
 * Criptografa uma chave de API para armazenamento seguro
 * @param {string} apiKey - Chave de API a ser criptografada
 * @returns {string} - Chave criptografada
 */
const encryptApiKey = (apiKey) => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY não definida no ambiente');
  }
  
  try {
    // Criar um IV aleatório
    const iv = crypto.randomBytes(16);
    
    // Criar cipher usando a chave de criptografia do ambiente e o IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Criptografar a chave
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retornar IV e texto criptografado concatenados (IV:encrypted)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar chave de API:', error);
    throw error;
  }
};

/**
 * Descriptografa uma chave de API
 * @param {string} encryptedApiKey - Chave de API criptografada
 * @returns {string} - Chave original
 */
const decryptApiKey = (encryptedApiKey) => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY não definida no ambiente');
  }
  
  try {
    // Separar IV e texto criptografado
    const [ivHex, encryptedText] = encryptedApiKey.split(':');
    
    // Converter IV de hex para buffer
    const iv = Buffer.from(ivHex, 'hex');
    
    // Criar decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Descriptografar
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar chave de API:', error);
    throw error;
  }
};

/**
 * Obter chave de API da configuração ou banco de dados
 * @param {string} keyName - Nome da chave (ex: "OPENAI_API_KEY")
 * @param {boolean} fromEnvOnly - Se true, busca apenas no .env
 * @returns {Promise<string>} - Chave de API
 */
export const getApiKey = async (keyName, fromEnvOnly = false) => {
  // Se estiver no cache, retornar do cache
  const cachedKey = apiKeyCache.get(keyName);
  if (cachedKey) {
    return cachedKey;
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
            // Descriptografar a chave armazenada
            try {
              apiKey = decryptApiKey(config.gpt_api_key);
            } catch (error) {
              // Se falhar na descriptografia, pode ser que a chave ainda não esteja criptografada
              console.warn(`Falha ao descriptografar chave ${keyName}, usando como texto simples`);
              apiKey = config.gpt_api_key;
            }
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
        // Criptografar a chave antes de armazenar
        const encryptedKey = encryptApiKey(newApiKey);
        
        await ConfiguracaoIA.findOneAndUpdate(
          {}, 
          { gpt_api_key: encryptedKey },
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

/**
 * Migrar chaves existentes para o formato criptografado
 * @returns {Promise<boolean>} - Se a migração foi bem-sucedida
 */
export const migrateToEncryptedKeys = async () => {
  try {
    if (!mongoose.models.ConfiguracaoIA) {
      return false;
    }
    
    const ConfiguracaoIA = mongoose.models.ConfiguracaoIA;
    const config = await ConfiguracaoIA.findOne({});
    
    if (!config) {
      return false;
    }
    
    let updated = false;
    
    // Verificar e migrar chave OpenAI
    if (config.gpt_api_key && !config.gpt_api_key.includes(':')) {
      // A chave não parece estar criptografada (não contém o separador IV:encrypted)
      const encryptedKey = encryptApiKey(config.gpt_api_key);
      config.gpt_api_key = encryptedKey;
      updated = true;
    }
    
    // Adicionar outras chaves conforme necessário
    
    if (updated) {
      await config.save();
      console.log('Chaves de API migradas para formato criptografado');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao migrar chaves para formato criptografado:', error);
    return false;
  }
};

export default {
  getApiKey,
  validateApiKey,
  rotateApiKey,
  clearApiKeyCache,
  migrateToEncryptedKeys
}; 