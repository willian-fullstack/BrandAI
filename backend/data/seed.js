import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from '../models/User.js';
import AgenteConfig from '../models/AgenteConfig.js';
import ConfiguracaoPlanos from '../models/ConfiguracaoPlanos.js';
import ConfiguracaoIA from '../models/ConfiguracaoIA.js';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'.cyan.underline))
  .catch((err) => {
    console.error(`Erro: ${err.message}`.red.underline.bold);
    process.exit(1);
  });

// Dados iniciais
const usuarios = [
  {
    nome: 'Admin User',
    email: 'irontechdollbrasil@gmail.com',
    password: 'admin123',
    role: 'admin',
    plano: 'enterprise',
  },
  {
    nome: 'John Doe',
    email: 'john@example.com',
    password: '123456',
    role: 'user',
    plano: 'basic',
  },
  {
    nome: 'Jane Doe',
    email: 'jane@example.com',
    password: '123456',
    role: 'user',
    plano: 'free',
  },
];

const agentes = [
  {
    codigo: 'assistente',
    nome: 'Assistente Geral',
    descricao: 'Um assistente geral para ajudar com diversas tarefas.',
    icon: 'robot',
    cor: '#3B82F6',
    especialidades: ['perguntas gerais', 'suporte', 'informações'],
    instrucoes_sistema: 'Você é um assistente geral útil e amigável.',
    exemplos_uso: [
      'Como posso ajudar você hoje?',
      'Preciso de informações sobre um assunto específico.',
    ],
    modelo_ia: 'gpt-3.5-turbo',
    temperatura: 0.7,
    max_tokens: 1000,
    ativo: true,
    disponivel_em: ['free', 'basic', 'pro', 'enterprise'],
  },
  {
    codigo: 'redator',
    nome: 'Redator de Conteúdo',
    descricao: 'Especialista em criar e revisar textos de alta qualidade.',
    icon: 'pen',
    cor: '#10B981',
    especialidades: ['redação', 'revisão', 'criação de conteúdo'],
    instrucoes_sistema: 'Você é um redator especializado em criar conteúdo de alta qualidade.',
    exemplos_uso: [
      'Escreva um artigo sobre inteligência artificial.',
      'Revise este texto para melhorar a clareza.',
    ],
    modelo_ia: 'gpt-4',
    temperatura: 0.8,
    max_tokens: 2000,
    ativo: true,
    disponivel_em: ['basic', 'pro', 'enterprise'],
  },
  {
    codigo: 'programador',
    nome: 'Assistente de Programação',
    descricao: 'Ajuda com código, debugging e explicações técnicas.',
    icon: 'code',
    cor: '#6366F1',
    especialidades: ['programação', 'debugging', 'explicações técnicas'],
    instrucoes_sistema: 'Você é um assistente de programação experiente que ajuda com código e explicações técnicas.',
    exemplos_uso: [
      'Como faço para implementar uma função de ordenação em JavaScript?',
      'Explique como funciona a recursão em programação.',
    ],
    modelo_ia: 'gpt-4',
    temperatura: 0.5,
    max_tokens: 2000,
    ativo: true,
    disponivel_em: ['pro', 'enterprise'],
  },
];

const planos = [
  {
    codigo: 'free',
    nome: 'Gratuito',
    descricao: 'Plano básico para experimentar a plataforma.',
    preco_mensal: 0,
    preco_anual: 0,
    recursos: [
      {
        nome: 'Acesso ao assistente básico',
        descricao: 'Use nosso assistente geral para tarefas simples.',
        destaque: true,
      },
      {
        nome: 'Limite de conversas',
        descricao: '10 conversas por mês.',
        destaque: false,
      },
    ],
    limites: {
      conversas_por_mes: 10,
      tokens_por_mes: 10000,
      max_tokens_por_resposta: 500,
      modelos_disponiveis: ['gpt-3.5-turbo'],
    },
    ativo: true,
    ordem_exibicao: 1,
    cor: '#6B7280',
    destaque: false,
  },
  {
    codigo: 'basic',
    nome: 'Básico',
    descricao: 'Para usuários que precisam de mais recursos.',
    preco_mensal: 29.90,
    preco_anual: 299.90,
    recursos: [
      {
        nome: 'Tudo do plano Gratuito',
        descricao: 'Inclui todos os recursos do plano Gratuito.',
        destaque: false,
      },
      {
        nome: 'Acesso a mais agentes',
        descricao: 'Acesse agentes especializados como o Redator.',
        destaque: true,
      },
      {
        nome: 'Mais conversas',
        descricao: '50 conversas por mês.',
        destaque: true,
      },
    ],
    limites: {
      conversas_por_mes: 50,
      tokens_por_mes: 50000,
      max_tokens_por_resposta: 1000,
      modelos_disponiveis: ['gpt-3.5-turbo'],
    },
    ativo: true,
    ordem_exibicao: 2,
    cor: '#3B82F6',
    destaque: true,
  },
  {
    codigo: 'pro',
    nome: 'Profissional',
    descricao: 'Para profissionais que precisam de recursos avançados.',
    preco_mensal: 79.90,
    preco_anual: 799.90,
    recursos: [
      {
        nome: 'Tudo do plano Básico',
        descricao: 'Inclui todos os recursos do plano Básico.',
        destaque: false,
      },
      {
        nome: 'Acesso a todos os agentes',
        descricao: 'Acesse todos os agentes especializados.',
        destaque: true,
      },
      {
        nome: 'Modelos avançados',
        descricao: 'Acesso aos modelos mais avançados como GPT-4.',
        destaque: true,
      },
      {
        nome: 'Conversas ilimitadas',
        descricao: 'Sem limite de conversas mensais.',
        destaque: true,
      },
    ],
    limites: {
      conversas_por_mes: 0, // ilimitado
      tokens_por_mes: 200000,
      max_tokens_por_resposta: 2000,
      modelos_disponiveis: ['gpt-3.5-turbo', 'gpt-4'],
    },
    ativo: true,
    ordem_exibicao: 3,
    cor: '#10B981',
    destaque: false,
  },
  {
    codigo: 'enterprise',
    nome: 'Empresarial',
    descricao: 'Para empresas que precisam de soluções personalizadas.',
    preco_mensal: 199.90,
    preco_anual: 1999.90,
    recursos: [
      {
        nome: 'Tudo do plano Profissional',
        descricao: 'Inclui todos os recursos do plano Profissional.',
        destaque: false,
      },
      {
        nome: 'Suporte prioritário',
        descricao: 'Suporte técnico prioritário 24/7.',
        destaque: true,
      },
      {
        nome: 'API de acesso',
        descricao: 'Acesso à API para integração com seus sistemas.',
        destaque: true,
      },
      {
        nome: 'Recursos ilimitados',
        descricao: 'Sem limites de tokens ou conversas.',
        destaque: true,
      },
    ],
    limites: {
      conversas_por_mes: 0, // ilimitado
      tokens_por_mes: 0, // ilimitado
      max_tokens_por_resposta: 4000,
      modelos_disponiveis: ['gpt-3.5-turbo', 'gpt-4'],
      ferramentas_disponiveis: ['pesquisa_web', 'analise_documentos', 'integracao_api'],
    },
    ativo: true,
    ordem_exibicao: 4,
    cor: '#8B5CF6',
    destaque: false,
  },
];

const configuracoesIA = [
  {
    nome: 'OpenAI GPT',
    descricao: 'Configuração para modelos da OpenAI',
    provedor: 'openai',
    modelos_disponiveis: [
      {
        nome: 'GPT-3.5 Turbo',
        codigo: 'gpt-3.5-turbo',
        tipo: 'texto',
        contexto_maximo: 4096,
        custo_input: 0.0015,
        custo_output: 0.002,
        ativo: true,
        planos_permitidos: ['free', 'basic', 'pro', 'enterprise'],
      },
      {
        nome: 'GPT-4',
        codigo: 'gpt-4',
        tipo: 'texto',
        contexto_maximo: 8192,
        custo_input: 0.03,
        custo_output: 0.06,
        ativo: true,
        planos_permitidos: ['pro', 'enterprise'],
      },
    ],
    chave_api: 'sk-example-openai-key',
    url_base: 'https://api.openai.com/v1',
    ativo: true,
    configuracoes_padrao: {
      temperatura: 0.7,
      top_p: 1,
      max_tokens: 1000,
      presence_penalty: 0,
      frequency_penalty: 0,
    },
  },
  {
    nome: 'Anthropic Claude',
    descricao: 'Configuração para modelos da Anthropic',
    provedor: 'anthropic',
    modelos_disponiveis: [
      {
        nome: 'Claude 3 Sonnet',
        codigo: 'claude-3-sonnet-20240229',
        tipo: 'texto',
        contexto_maximo: 200000,
        custo_input: 0.003,
        custo_output: 0.015,
        ativo: true,
        planos_permitidos: ['pro', 'enterprise'],
      },
    ],
    chave_api: 'sk-example-anthropic-key',
    url_base: 'https://api.anthropic.com/v1',
    ativo: true,
    configuracoes_padrao: {
      temperatura: 0.5,
      top_p: 0.9,
      max_tokens: 1000,
      presence_penalty: 0,
      frequency_penalty: 0,
    },
  },
];

// Limpar dados sem importar novos
const clearData = async () => {
  try {
    // Limpar dados existentes
    await User.deleteMany();
    await AgenteConfig.deleteMany();
    await ConfiguracaoPlanos.deleteMany();
    await ConfiguracaoIA.deleteMany();

    console.log('Todos os dados foram removidos'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Erro: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Importar dados
const importData = async () => {
  try {
    // Limpar dados existentes
    await User.deleteMany();
    await AgenteConfig.deleteMany();
    await ConfiguracaoPlanos.deleteMany();
    await ConfiguracaoIA.deleteMany();

    console.log('Dados existentes removidos'.red.inverse);

    // Inserir novos dados
    await User.insertMany(usuarios);
    await AgenteConfig.insertMany(agentes);
    await ConfiguracaoPlanos.insertMany(planos);
    await ConfiguracaoIA.insertMany(configuracoesIA);

    console.log('Dados importados com sucesso'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Erro: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Verificar argumentos para decidir qual operação executar
const processArgs = process.argv;

if (processArgs[2] === '-d') {
  clearData();
} else {
  importData();
} 