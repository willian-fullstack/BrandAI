import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar rotas
import userRoutes from './routes/userRoutes.js';
import conversaRoutes from './routes/conversaRoutes.js';
import agenteConfigRoutes from './routes/agenteConfigRoutes.js';
import indicacaoRoutes from './routes/indicacaoRoutes.js';
import configuracaoIARoutes from './routes/configuracaoIARoutes.js';
import configuracaoPlanosRoutes from './routes/configuracaoPlanosRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do express-fileupload
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
}));

// Logging em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.error(`Erro ao conectar ao MongoDB: ${err.message}`));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/conversas', conversaRoutes);
app.use('/api/agente-config', agenteConfigRoutes);
app.use('/api/indicacoes', indicacaoRoutes);
app.use('/api/configuracao-ia', configuracaoIARoutes);
app.use('/api/configuracao-planos', configuracaoPlanosRoutes);
app.use('/api/integrations', integrationRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.send('API Base44 está funcionando!');
});

// Middleware para lidar com rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado' });
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
}); 