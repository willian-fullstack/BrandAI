import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

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

// Middleware de segurança com helmet
app.use(helmet());

// Configurar CSP (Content Security Policy)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  })
);

// Configuração CORS segura
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como apps mobile ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pela política de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 horas
}));

app.use(express.json());
app.use(cookieParser()); // Para processar cookies

// Configuração do express-fileupload com opções de segurança melhoradas
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // Reduzido para 5MB max file size
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  debug: process.env.NODE_ENV === 'development'
}));

// Logging em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir arquivos estáticos da pasta uploads com cabeçalhos de segurança
app.use('/uploads', (req, res, next) => {
  // Não permitir listagem de diretórios
  if (req.path.endsWith('/')) {
    return res.status(403).send('Forbidden');
  }
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));

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
  
  // Evitar expor detalhes de erro em produção
  const errorResponse = {
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro. Por favor, tente novamente mais tarde.',
    // Adicionar um ID de correlação para facilitar o rastreamento nos logs
    correlationId: Date.now().toString(36) + Math.random().toString(36).substring(2)
  };
  
  // Registrar o ID de correlação junto com o erro para facilitar o debug
  console.error(`Erro [${errorResponse.correlationId}]:`, err.message);
  
  res.status(500).json(errorResponse);
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em modo ${process.env.NODE_ENV} na porta ${PORT}`);
}); 