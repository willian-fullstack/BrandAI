import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';

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

// Middleware para operações administrativas críticas
// Requer verificação adicional para operações sensíveis
export const criticalAdminOperation = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    // Verificar se o cabeçalho de confirmação está presente
    const confirmationHeader = req.headers['admin-operation-confirmation'];
    
    if (!confirmationHeader) {
      return res.status(403).json({
        message: 'Operação crítica requer confirmação adicional',
        requiresConfirmation: true,
        operationId: generateOperationId(req),
      });
    }
    
    // Verificar se o token de confirmação é válido
    try {
      const jwtSecret = process.env.JWT_SECRET;
      const decoded = jwt.verify(confirmationHeader, jwtSecret);
      
      // Verificar se o token é para a operação correta
      if (decoded.operationId !== generateOperationId(req)) {
        return res.status(403).json({
          message: 'Token de confirmação inválido para esta operação',
          requiresConfirmation: true,
          operationId: generateOperationId(req),
        });
      }
      
      // Verificar se o token não expirou (máximo 5 minutos)
      const tokenTimestamp = new Date(decoded.timestamp);
      const currentTime = new Date();
      const timeDifference = (currentTime - tokenTimestamp) / 1000 / 60; // em minutos
      
      if (timeDifference > 5) {
        return res.status(403).json({
          message: 'Token de confirmação expirado',
          requiresConfirmation: true,
          operationId: generateOperationId(req),
        });
      }
      
      // Registrar a operação crítica para auditoria
      console.log(`[AUDITORIA] Operação crítica autorizada: ${req.method} ${req.originalUrl} - Admin: ${req.user.email} - IP: ${req.ip}`);
      
      next();
    } catch (_) {
      // Ignoramos os detalhes do erro para não expor informações sensíveis
      return res.status(403).json({
        message: 'Token de confirmação inválido',
        requiresConfirmation: true,
        operationId: generateOperationId(req),
      });
    }
  } else {
    res.status(403).json({ message: 'Não autorizado como administrador' });
  }
};

// Gera um ID único para a operação baseado nos detalhes da requisição
const generateOperationId = (req) => {
  const operationDetails = {
    method: req.method,
    url: req.originalUrl,
    userId: req.user._id.toString(),
    timestamp: new Date().toISOString(),
  };
  
  // Adicionar parâmetros específicos da operação
  if (req.params.id) {
    operationDetails.targetId = req.params.id;
  }
  
  // Usar crypto para gerar um hash da operação
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(operationDetails))
    .digest('base64');
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