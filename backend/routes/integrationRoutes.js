import express from 'express';
import {
  getIntegrations,
  getIntegrationById,
  getMinhasIntegrations,
  criarIntegration,
  atualizarIntegration,
  excluirIntegration,
  testarIntegration,
  uploadTrainingDocument,
  uploadFile,
  invokeLLM,
  generateImage,
  getGeneratedImages,
  getApiUsageStats,
  getUserApiUsage
} from '../controllers/integrationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas as rotas são privadas
router.use(protect);

// Rotas para usuários normais
router.get('/minhas', getMinhasIntegrations);
router.post('/', criarIntegration);
router.route('/:id')
  .get(getIntegrationById)
  .put(atualizarIntegration)
  .delete(excluirIntegration);
router.post('/:id/testar', testarIntegration);

// Rota para upload de arquivos genéricos
router.post('/upload', uploadFile);

// Rota para upload de documentos de treinamento
router.post('/upload-training/:agenteId', admin, uploadTrainingDocument);

// Rota para invocar o modelo de linguagem
router.post('/invoke-llm', invokeLLM);

// Rota para gerar imagens com IA
router.post('/generate-image', generateImage);

// Rota para obter imagens geradas pelo usuário
router.get('/generated-images', getGeneratedImages);

// Rotas para administradores
router.get('/', admin, getIntegrations);

// Rota para obter estatísticas de uso de API
router.get('/api-usage-stats', protect, admin, getApiUsageStats);

// Rota para obter uso de API por usuário
router.get('/api-usage-by-user', protect, admin, getUserApiUsage);

export default router; 