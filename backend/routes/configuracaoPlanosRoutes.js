import express from 'express';
import {
  getConfiguracoesPlanos,
  getConfiguracaoPlano,
  createConfiguracaoPlano,
  updateConfiguracaoPlano,
  deleteConfiguracaoPlano,
  verificarCupom,
  aplicarCupom
} from '../controllers/configuracaoPlanosController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', getConfiguracoesPlanos);
router.get('/verificar-cupom/:codigo', verificarCupom);
router.get('/:id', getConfiguracaoPlano);

// Rotas protegidas
router.post('/', protect, admin, createConfiguracaoPlano);
router.put('/aplicar-cupom/:codigo', protect, aplicarCupom);
router.put('/:id', protect, admin, updateConfiguracaoPlano);
router.delete('/:id', protect, admin, deleteConfiguracaoPlano);

export default router; 