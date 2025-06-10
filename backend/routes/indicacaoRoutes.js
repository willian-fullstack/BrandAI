import express from 'express';
import {
  criarIndicacao,
  getIndicacoes,
  verificarCodigo,
  processarIndicacao,
  getEstatisticas,
} from '../controllers/indicacaoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/verificar/:codigo', verificarCodigo);

// Rotas privadas
router.use(protect);

router.route('/')
  .get(getIndicacoes)
  .post(criarIndicacao);

router.get('/estatisticas', getEstatisticas);
router.put('/processar/:codigo', processarIndicacao);

export default router; 