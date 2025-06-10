import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware para proteger rotas - verifica se o usuário está autenticado
export const protect = async (req, res, next) => {
  let token;

  // Verificar se o token está no header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obter usuário do token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário está ativo
      if (!req.user.ativo) {
        res.status(401);
        throw new Error('Conta desativada');
      }

      next();
    } catch (error) {
      console.error('Erro de autenticação:', error);
      res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, token não fornecido' });
  }
};

// Middleware para verificar permissões de administrador
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Não autorizado como administrador' });
  }
};

// Middleware para verificar plano do usuário
export const checkPlan = (planoMinimo) => {
  return (req, res, next) => {
    const planos = ['free', 'basic', 'pro', 'enterprise'];
    
    // Administradores têm acesso a tudo
    if (req.user.role === 'admin') {
      return next();
    }
    
    const planoUsuarioIndex = planos.indexOf(req.user.plano);
    const planoMinimoIndex = planos.indexOf(planoMinimo);
    
    if (planoUsuarioIndex >= planoMinimoIndex) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Recurso não disponível no seu plano atual',
        planoAtual: req.user.plano,
        planoNecessario: planoMinimo
      });
    }
  };
};

// Middleware para verificar limites de uso
export const checkLimits = async (req, res, next) => {
  try {
    // Administradores não têm limites
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Verificar limite de conversas
    if (req.user.limite_conversas > 0 && req.user.conversas_totais >= req.user.limite_conversas) {
      return res.status(403).json({ 
        message: 'Limite de conversas atingido',
        limite: req.user.limite_conversas,
        atual: req.user.conversas_totais
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro ao verificar limites:', error);
    res.status(500).json({ message: 'Erro ao verificar limites de uso' });
  }
}; 