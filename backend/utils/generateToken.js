import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Obter o segredo JWT do ambiente ou usar um fallback seguro
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Gera um token JWT para autenticação
 * @param {string} id - ID do usuário
 * @returns {string} Token JWT
 */
const generateToken = (id) => {
  // Verificar se JWT_SECRET está definido
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET não está definido no ambiente');
    throw new Error('Configuração de segurança incompleta');
  }
  
  return jwt.sign({ id }, secret, {
    expiresIn: '1h', // Token expira em 1 hora em vez de 30 dias
  });
};

/**
 * Gera um refresh token para renovação de tokens de acesso
 * @param {string} id - ID do usuário
 * @returns {Object} Objeto contendo o refresh token e sua data de expiração
 */
export const generateRefreshToken = (id) => {
  // Gerar um token aleatório usando crypto
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // Data de expiração (7 dias)
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
  
  return {
    token: refreshToken,
    expiresAt: refreshTokenExpiry
  };
};

/**
 * Verifica se um token JWT é válido
 * @param {string} token - Token JWT a ser verificado
 * @returns {Object|null} Payload decodificado ou null se inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    return null;
  }
};

export default generateToken; 