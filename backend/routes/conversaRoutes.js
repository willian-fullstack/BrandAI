import express from 'express';
import {
  criarConversa,
  getConversas,
  getConversaById,
  adicionarMensagem,
  atualizarStatusConversa,
  atualizarTituloConversa,
  excluirConversa,
  atualizarConversa
} from '../controllers/conversaController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de conversas são privadas
router.use(protect);

router.route('/')
  .get(getConversas)
  .post(criarConversa);

router.route('/:id')
  .get(getConversaById)
  .put(atualizarConversa)
  .delete(excluirConversa);

router.route('/:id/mensagens')
  .post(adicionarMensagem);

router.route('/:id/status')
  .put(atualizarStatusConversa);

router.route('/:id/titulo')
  .put(atualizarTituloConversa);

export default router; 