import express from 'express';
import {
  getConfiguracoesIA,
  getConfiguracaoIAById,
  criarConfiguracaoIA,
  atualizarConfiguracaoIA,
  excluirConfiguracaoIA,
  testarConfiguracaoIA,
} from '../controllers/configuracaoIAController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são privadas e apenas para admin
router.use(protect, admin);

router.route('/')
  .get(getConfiguracoesIA)
  .post(criarConfiguracaoIA);

router.route('/:id')
  .get(getConfiguracaoIAById)
  .put(atualizarConfiguracaoIA)
  .delete(excluirConfiguracaoIA);

router.post('/:id/testar', testarConfiguracaoIA);

export default router; 