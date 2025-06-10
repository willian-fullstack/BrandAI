import jwt from 'jsonwebtoken';

/**
 * Gera um token JWT para autenticação
 * @param {string} id - ID do usuário
 * @returns {string} Token JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expira em 30 dias
  });
};

export default generateToken; 