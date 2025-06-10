import express from 'express';
import {
  getConfiguracoesPlanos,
  getConfiguracaoPlanoByNome,
  criarConfiguracaoPlano,
  atualizarConfiguracaoPlano,
  excluirConfiguracaoPlano,
  compararPlanos,
} from '../controllers/configuracaoPlanosController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getConfiguracoesPlanos);
router.get('/comparar', compararPlanos);
router.get('/:nome', getConfiguracaoPlanoByNome);

// Rotas privadas (apenas admin)
router.post('/', protect, admin, criarConfiguracaoPlano);
router.put('/:id', protect, admin, atualizarConfiguracaoPlano);
router.delete('/:id', protect, admin, excluirConfiguracaoPlano);

export default router; 