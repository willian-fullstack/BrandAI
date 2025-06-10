import express from 'express';
import {
  getAgentesConfig,
  getAgenteConfigByCodigo,
  criarAgenteConfig,
  atualizarAgenteConfig,
  excluirAgenteConfig,
  excluirDocumentoTreinamento,
} from '../controllers/agenteConfigController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são privadas
router.use(protect);

// Rotas para todos os usuários
router.route('/')
  .get(getAgentesConfig);

router.route('/:codigo')
  .get(getAgenteConfigByCodigo);

// Rotas apenas para admin
router.route('/')
  .post(admin, criarAgenteConfig);

router.route('/:codigo')
  .put(admin, atualizarAgenteConfig)
  .delete(admin, excluirAgenteConfig);

// Rota para excluir documento de treinamento
router.delete('/:codigo/documento/:documentoId', admin, excluirDocumentoTreinamento);

export default router; 