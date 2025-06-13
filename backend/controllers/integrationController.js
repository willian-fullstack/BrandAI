import mongoose from 'mongoose';
import Integration from '../models/Integration.js';
import User from '../models/User.js';
import GeneratedImage from '../models/GeneratedImage.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiKeyManager from '../utils/apiKeyManager.js';
import apiUsageTracker from '../utils/apiUsageTracker.js';
import axios from 'axios';

// Configurar dotenv
dotenv.config();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Obter todas as integrações
// @route   GET /api/integrations
// @access  Privado/Admin
export const getIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find({}).sort('nome');
    res.json(integrations);
  } catch (error) {
    console.error('Erro ao obter integrações:', error);
    res.status(500).json({ message: 'Erro ao obter integrações' });
  }
};

// @desc    Obter uma integração por ID
// @route   GET /api/integrations/:id
// @access  Privado
export const getIntegrationById = async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);
    
    if (integration) {
      // Se não for admin, verificar se a integração pertence ao usuário
      if (req.user.role !== 'admin' && integration.usuario_id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Não autorizado a acessar esta integração' });
      }
      
      res.json(integration);
    } else {
      res.status(404).json({ message: 'Integração não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter integração:', error);
    res.status(500).json({ message: 'Erro ao obter integração' });
  }
};

// @desc    Obter integrações do usuário
// @route   GET /api/integrations/minhas
// @access  Privado
export const getMinhasIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find({ usuario_id: req.user._id }).sort('-createdAt');
    res.json(integrations);
  } catch (error) {
    console.error('Erro ao obter integrações do usuário:', error);
    res.status(500).json({ message: 'Erro ao obter integrações do usuário' });
  }
};

// @desc    Criar uma integração
// @route   POST /api/integrations
// @access  Privado
export const criarIntegration = async (req, res) => {
  try {
    const {
      nome,
      tipo,
      configuracao,
      ativo,
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !tipo || !configuracao) {
      return res.status(400).json({
        message: 'Por favor, preencha todos os campos obrigatórios',
      });
    }

    // Verificar limites de integrações por tipo de plano
    const user = await User.findById(req.user._id);
    const integracoesExistentes = await Integration.countDocuments({ usuario_id: req.user._id });
    
    let limiteIntegracoes;
    
    switch (user.plano_atual) {
      case 'premium':
        limiteIntegracoes = 10;
        break;
      case 'intermediario':
        limiteIntegracoes = 5;
        break;
      case 'basico':
      default:
        limiteIntegracoes = 2;
        break;
    }
    
    if (integracoesExistentes >= limiteIntegracoes) {
      return res.status(400).json({
        message: `Limite de ${limiteIntegracoes} integrações atingido para seu plano atual. Faça upgrade para adicionar mais.`,
      });
    }

    // Criar integração
    const integration = new Integration({
      nome,
      tipo,
      configuracao,
      usuario_id: req.user._id,
      ativo: ativo !== undefined ? ativo : true,
    });

    const integrationCriada = await integration.save();
    res.status(201).json(integrationCriada);
  } catch (error) {
    console.error('Erro ao criar integração:', error);
    res.status(500).json({ message: 'Erro ao criar integração' });
  }
};

// @desc    Atualizar uma integração
// @route   PUT /api/integrations/:id
// @access  Privado
export const atualizarIntegration = async (req, res) => {
  try {
    const {
      nome,
      tipo,
      configuracao,
      ativo,
    } = req.body;

    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integração não encontrada' });
    }

    // Verificar se o usuário é dono da integração ou admin
    if (integration.usuario_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado a editar esta integração' });
    }

    // Atualizar campos
    integration.nome = nome || integration.nome;
    
    // Tipo não pode ser alterado após a criação se não for admin
    if (tipo && req.user.role === 'admin') {
      integration.tipo = tipo;
    }
    
    if (configuracao) {
      integration.configuracao = {
        ...integration.configuracao,
        ...configuracao,
      };
    }
    
    if (ativo !== undefined) {
      integration.ativo = ativo;
    }

    const integrationAtualizada = await integration.save();
    res.json(integrationAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar integração:', error);
    res.status(500).json({ message: 'Erro ao atualizar integração' });
  }
};

// @desc    Excluir uma integração
// @route   DELETE /api/integrations/:id
// @access  Privado
export const excluirIntegration = async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integração não encontrada' });
    }

    // Verificar se o usuário é dono da integração ou admin
    if (integration.usuario_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado a excluir esta integração' });
    }

    await integration.deleteOne();
    res.json({ message: 'Integração removida' });
  } catch (error) {
    console.error('Erro ao excluir integração:', error);
    res.status(500).json({ message: 'Erro ao excluir integração' });
  }
};

// @desc    Testar uma integração
// @route   POST /api/integrations/:id/testar
// @access  Privado
export const testarIntegration = async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integração não encontrada' });
    }

    // Verificar se o usuário é dono da integração ou admin
    if (integration.usuario_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado a testar esta integração' });
    }

    // Simulação de teste de integração
    let resultado;
    
    switch (integration.tipo) {
      case 'slack':
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com Slack estabelecida com sucesso',
          detalhes: {
            workspace: integration.configuracao.workspace || 'Workspace padrão',
            canais_disponiveis: ['#geral', '#suporte', '#vendas'],
          },
        };
        break;
      case 'discord':
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com Discord estabelecida com sucesso',
          detalhes: {
            servidor: integration.configuracao.servidor || 'Servidor padrão',
            canais_disponiveis: ['#geral', '#suporte', '#bate-papo'],
          },
        };
        break;
      case 'telegram':
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com Telegram estabelecida com sucesso',
          detalhes: {
            bot_name: integration.configuracao.bot_name || 'Base44Bot',
          },
        };
        break;
      case 'whatsapp':
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com WhatsApp estabelecida com sucesso',
          detalhes: {
            numero: integration.configuracao.numero || '+5511999999999',
            status: 'Conectado',
          },
        };
        break;
      default:
        resultado = {
          sucesso: false,
          mensagem: `Tipo de integração ${integration.tipo} não suportado para teste`,
        };
    }

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao testar integração:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao testar integração',
      erro: error.message,
    });
  }
};

// @desc    Upload de documento de treinamento para agente de IA
// @route   POST /api/integrations/upload-training/:agenteId
// @access  Privado/Admin
export const uploadTrainingDocument = async (req, res) => {
  try {
    // Verificar se o agente existe
    const agenteId = req.params.agenteId;
    
    // Sanitizar o ID do agente para evitar path traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(agenteId)) {
      return res.status(400).json({ message: 'ID de agente inválido' });
    }
    
    const AgenteConfig = mongoose.model('AgenteConfig');
    const agente = await AgenteConfig.findOne({ codigo: agenteId });
    
    if (!agente) {
      return res.status(404).json({ message: 'Agente não encontrado' });
    }

    // Verificar se o arquivo foi enviado
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const file = req.files.document;
    
    // Verificar tipo de arquivo permitido para documentos de treinamento
    const allowedMimeTypes = [
      'text/plain', 'text/markdown', 'text/csv', 
      'application/json', 'text/xml', 'text/html',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        message: 'Tipo de arquivo não permitido para documentos de treinamento', 
        allowed_types: allowedMimeTypes 
      });
    }
    
    // Verificar tamanho máximo (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return res.status(400).json({
        message: 'Arquivo muito grande. O tamanho máximo permitido é 20MB'
      });
    }
    
    // Sanitizar nome do arquivo
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const uploadPath = path.join(__dirname, '..', 'uploads', 'training', agenteId);
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Gerar nome de arquivo único
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadPath, fileName);
    
    // Mover o arquivo para o diretório de uploads
    await file.mv(filePath);
    
    // Adicionar documento ao agente
    const novoDocumento = {
      nome: sanitizedName,
      caminho: `/uploads/training/${agenteId}/${fileName}`,
      tipo: file.mimetype,
      tamanho: file.size,
      data_upload: new Date()
    };
    
    // Inicializar array de documentos se não existir
    if (!agente.documentos_treinamento) {
      agente.documentos_treinamento = [];
    }
    
    agente.documentos_treinamento.push(novoDocumento);
    await agente.save();
    
    res.status(200).json({
      success: true,
      documento: novoDocumento
    });
  } catch (error) {
    console.error('Erro no upload de documento de treinamento:', error);
    res.status(500).json({
      message: 'Erro ao fazer upload do documento de treinamento',
      error: error.message
    });
  }
};

// @desc    Upload de arquivo genérico
// @route   POST /api/integrations/upload
// @access  Privado
export const uploadFile = async (req, res) => {
  try {
    // Verificar se o arquivo foi enviado
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const file = req.files.file;
    
    // Verificar tipo de arquivo permitido
    const allowedMimeTypes = [
      'text/plain', 'text/markdown', 'text/csv', 
      'application/json', 'text/xml', 'text/html',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        message: 'Tipo de arquivo não permitido', 
        allowed_types: allowedMimeTypes 
      });
    }
    
    // Sanitizar nome do arquivo
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    const uploadPath = path.join(__dirname, '..', 'uploads', 'files');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Gerar nome de arquivo único
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadPath, fileName);
    
    // Verificar tamanho máximo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        message: 'Arquivo muito grande. O tamanho máximo permitido é 10MB'
      });
    }
    
    // Mover o arquivo para o diretório de uploads
    await file.mv(filePath);
    
    // Retornar URL do arquivo
    const fileUrl = `/uploads/files/${fileName}`;
    
    res.status(200).json({
      success: true,
      file_url: fileUrl,
      file_name: sanitizedName,
      file_type: file.mimetype,
      file_size: file.size
    });
  } catch (error) {
    console.error('Erro no upload de arquivo:', error);
    res.status(500).json({
      message: 'Erro ao fazer upload do arquivo',
      error: error.message
    });
  }
};

// @desc    Invocar modelo de linguagem (LLM)
// @route   POST /api/integrations/invoke-llm
// @access  Privado
export const invokeLLM = async (req, res) => {
  const startTime = Date.now();
  let usageData = {
    api_name: 'openai',
    endpoint: '/v1/chat/completions',
    user_id: req.user ? req.user._id : null,
    success: false,
    tokens_input: 0,
    tokens_output: 0,
    response_time_ms: 0
  };

  try {
    const { prompt, messages: requestMessages, agente_id, file_urls } = req.body;

    // Validar se o prompt foi fornecido
    if (!prompt) {
      console.error('Erro: Prompt não fornecido na requisição');
      return res.status(400).json({ message: 'O prompt é obrigatório' });
    }

    console.log('Prompt recebido:', prompt.substring(0, 100) + '...');
    console.log('Mensagens recebidas:', requestMessages ? requestMessages.length : 0);
    console.log('Agente ID:', agente_id);

    // Verificar se o usuário tem créditos disponíveis (exceto admin)
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user._id);
      
      if (user.creditos_restantes <= 0) {
        return res.status(403).json({ 
          message: 'Você não tem créditos suficientes para usar esta funcionalidade. Faça upgrade do seu plano.' 
        });
      }
      
      // Descontar um crédito
      user.creditos_restantes -= 1;
      await user.save();
    }

    // Log para debug
    console.log(`Invocando LLM com prompt: ${prompt.substring(0, 100)}...`);
    
    // Processar os documentos anexados
    let documentosProcessados = [];
    let conteudoDocumentos = '';
    
    // Abordagem 1: Usar os file_urls enviados
    if (file_urls && Array.isArray(file_urls) && file_urls.length > 0) {
      console.log(`Documentos anexados via file_urls: ${file_urls.length}`);
      console.log('URLs dos documentos:', JSON.stringify(file_urls));
    } else {
      console.log(`Nenhum documento enviado via file_urls`);
    }
    
    // Abordagem 2: Buscar documentos diretamente do banco de dados pelo agente_id
    if (agente_id) {
      try {
        const AgenteConfig = mongoose.model('AgenteConfig');
        const agente = await AgenteConfig.findOne({ codigo: agente_id });
        
        if (agente && agente.documentos_treinamento && agente.documentos_treinamento.length > 0) {
          console.log(`Agente ${agente_id} tem ${agente.documentos_treinamento.length} documentos cadastrados:`);
          
          // Mostrar os documentos encontrados
          agente.documentos_treinamento.forEach((doc, index) => {
            console.log(`Documento ${index + 1}: ${doc.nome} (${doc.caminho})`);
          });
          
          // Processar cada documento encontrado no banco de dados
          for (const documento of agente.documentos_treinamento) {
            try {
              console.log(`Processando documento: ${documento.nome} (${documento.caminho})`);
              
              // Usar nosso utilitário para encontrar o arquivo
              const fileResult = findAndReadFile(documento.caminho);
              
              if (fileResult.found) {
                documentosProcessados.push(documento.nome);
                console.log(`Documento lido com sucesso: ${documento.nome} (${fileResult.content.length} caracteres)`);
                conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${fileResult.content}\n--- FIM DO DOCUMENTO ---\n`;
              } else {
                // Tentar ler o arquivo diretamente do sistema de arquivos
                try {
                  const filePath = path.join(__dirname, '..', documento.caminho);
                  console.log(`Tentando ler diretamente do caminho: ${filePath}`);
                  
                  if (fs.existsSync(filePath)) {
                    const conteudo = fs.readFileSync(filePath, 'utf8');
                    documentosProcessados.push(documento.nome);
                    console.log(`Documento lido diretamente: ${documento.nome} (${conteudo.length} caracteres)`);
                    conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${conteudo}\n--- FIM DO DOCUMENTO ---\n`;
                  } else {
                    console.log(`Arquivo não encontrado no caminho: ${filePath}`);
                    
                    // Buscar em uma lista de caminhos possíveis
                    const possiblePaths = [
                      path.join(__dirname, '..', 'uploads', 'training', agente_id, documento.nome),
                      path.join(__dirname, '..', 'uploads', 'training', documento.nome),
                      path.join(__dirname, '..', 'uploads', documento.nome),
                      path.join(__dirname, '..', documento.caminho.replace(/^\//, ''))
                    ];
                    
                    let encontrado = false;
                    for (const possiblePath of possiblePaths) {
                      console.log(`Tentando caminho alternativo: ${possiblePath}`);
                      if (fs.existsSync(possiblePath)) {
                        const conteudo = fs.readFileSync(possiblePath, 'utf8');
                        documentosProcessados.push(documento.nome);
                        console.log(`Documento encontrado em caminho alternativo: ${possiblePath} (${conteudo.length} caracteres)`);
                        conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${conteudo}\n--- FIM DO DOCUMENTO ---\n`;
                        encontrado = true;
                        break;
                      }
                    }
                    
                    if (!encontrado) {
                      console.log(`Não foi possível encontrar o arquivo: ${documento.nome} em nenhum dos caminhos testados`);
                    }
                  }
                } catch (erro) {
                  console.error(`Erro ao ler arquivo ${documento.nome}:`, erro);
                }
              }
            } catch (erro) {
              console.error(`Erro ao processar documento ${documento.nome}:`, erro);
            }
          }
        } else {
          console.log(`Agente ${agente_id} não encontrado ou não tem documentos cadastrados`);
        }
      } catch (erro) {
        console.error('Erro ao buscar informações do agente:', erro);
      }
    } else {
      console.log('Nenhum agente_id informado, não é possível buscar documentos no banco de dados');
    }
    
    console.log(`Total de documentos processados: ${documentosProcessados.length}`);
    if (documentosProcessados.length > 0) {
      console.log('Documentos processados:', documentosProcessados.join(', '));
    } else {
      console.log('Nenhum documento foi processado com sucesso');
    }
    
    // Fazer chamada para a API da OpenAI
    const axios = await import('axios');
    
    // Preparar mensagens para a API da OpenAI
    const messages = [];
    
    // Adicionar instruções do sistema do agente, se disponíveis
    if (agente_id) {
      try {
        const AgenteConfig = mongoose.model('AgenteConfig');
        const agente = await AgenteConfig.findOne({ codigo: agente_id });
        
        if (agente) {
          // Usar instruções do sistema do agente
          let instrucaoSistema = agente.instrucoes_sistema || 'Você é um assistente útil e especializado.';
          
          // Adicionar descrição do agente se disponível
          if (agente.descricao) {
            instrucaoSistema = `${instrucaoSistema}\n\nVocê é especializado em: ${agente.descricao}`;
          }
          
          // Adicionar especialidades se disponíveis
          if (agente.especialidades && agente.especialidades.length > 0) {
            instrucaoSistema = `${instrucaoSistema}\n\nSuas especialidades são: ${agente.especialidades.join(', ')}`;
          }
          
          // Adicionar instruções para usar documentos se disponíveis
          instrucaoSistema = `${instrucaoSistema}\n\nResponda utilizando as informações dos documentos fornecidos quando disponíveis.`;
          
          // Adicionar a mensagem de sistema com as instruções personalizadas
          messages.push({ 
            role: 'system', 
            content: instrucaoSistema
          });
          
          console.log(`Usando instruções do sistema do agente: ${instrucaoSistema.substring(0, 100)}...`);
        } else {
          // Fallback para instruções padrão
          messages.push({ 
            role: 'system', 
            content: 'Você é um assistente útil e especializado. Responda utilizando as informações dos documentos fornecidos quando disponíveis.' 
          });
          console.log('Agente não encontrado, usando instruções padrão');
        }
      } catch (erro) {
        console.error('Erro ao buscar instruções do agente:', erro);
        // Fallback para instruções padrão em caso de erro
        messages.push({ 
          role: 'system', 
          content: 'Você é um assistente útil e especializado. Responda utilizando as informações dos documentos fornecidos quando disponíveis.' 
        });
      }
    } else {
      // Sem agente_id, usar instruções padrão
      messages.push({ 
        role: 'system', 
        content: 'Você é um assistente útil e especializado. Responda utilizando as informações dos documentos fornecidos quando disponíveis.' 
      });
    }
    
    // Se houver documentos processados, adicionar o conteúdo como contexto
    if (documentosProcessados.length > 0) {
      messages.push({
        role: 'system',
        content: `Documentos de referência disponíveis: ${documentosProcessados.join(', ')}\n\nConteúdo dos documentos:${conteudoDocumentos}`
      });
    }
    
    // Adicionar a mensagem do usuário
    messages.push({ role: 'user', content: prompt });
    
    // Estimar tokens de entrada
    const inputText = messages.map(m => m.content).join(' ');
    usageData.tokens_input = apiUsageTracker.estimateTokens(inputText);
    
    // Obter a chave da API usando o gerenciador
    const apiKey = await apiKeyManager.getApiKey('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY não encontrada no ambiente');
      return res.status(500).json({ message: 'Configuração da API OpenAI não encontrada' });
    }
    
    const response = await axios.default.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extrair a resposta do modelo
    const resposta = response.data.choices[0].message.content;
    
    // Atualizar dados de uso
    usageData.success = true;
    usageData.tokens_output = apiUsageTracker.estimateTokens(resposta);
    usageData.cost = apiUsageTracker.calculateOpenAICost(
      'gpt-4o', 
      usageData.tokens_input, 
      usageData.tokens_output
    );

    // Retornar a resposta
    res.json(resposta);
    
  } catch (error) {
    console.error('Erro ao invocar modelo de linguagem:', error.response?.data || error.message);
    usageData.success = false;
    usageData.error_message = error.message;
    res.status(500).json({ message: 'Erro ao processar solicitação de IA' });
  } finally {
    // Registrar uso da API
    usageData.response_time_ms = Date.now() - startTime;
    await apiUsageTracker.trackApiUsage(usageData);
  }
};

// Utilitário para encontrar e ler arquivos de forma segura
const findAndReadFile = (filePath) => {
  try {
    // Normalizar o caminho para evitar ataques de traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Lista de diretórios permitidos (whitelist)
    const allowedDirs = [
      path.join(__dirname, '..', 'uploads'),
      path.join(__dirname, '..', 'uploads', 'training')
    ];
    
    // Verificar se o caminho é absoluto
    if (path.isAbsolute(normalizedPath)) {
      // Verificar se o caminho absoluto está dentro dos diretórios permitidos
      const isPathAllowed = allowedDirs.some(dir => normalizedPath.startsWith(dir));
      
      if (isPathAllowed && fs.existsSync(normalizedPath)) {
        const content = fs.readFileSync(normalizedPath, 'utf8');
        return { found: true, content, path: normalizedPath };
      }
    }
    
    // Nome do arquivo
    const fileName = path.basename(normalizedPath);
    
    // Verificar extensões permitidas
    const allowedExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm', '.pdf', '.doc', '.docx'];
    const fileExt = path.extname(fileName).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      return { found: false, error: 'Tipo de arquivo não permitido' };
    }
    
    // Para cada diretório permitido, verificar se o arquivo existe
    for (const dir of allowedDirs) {
      const fullPath = path.join(dir, fileName);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        return { found: true, content, path: fullPath };
      }
      
      // Verificar em subdiretórios específicos (não recursivo)
      try {
        const subdirs = fs.readdirSync(dir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => path.join(dir, dirent.name));
        
        for (const subdir of subdirs) {
          const subPath = path.join(subdir, fileName);
          if (fs.existsSync(subPath)) {
            const content = fs.readFileSync(subPath, 'utf8');
            return { found: true, content, path: subPath };
          }
        }
      } catch (_) {
        // Ignorar erros de acesso a diretórios
      }
    }
    
    // Se chegou aqui, o arquivo não foi encontrado
    return { found: false, error: 'Arquivo não encontrado' };
  } catch (error) {
    return { found: false, error: error.message };
  }
};

// @desc    Gerar imagem com IA
// @route   POST /api/integrations/generate-image
// @access  Privado
export const generateImage = async (req, res) => {
  const startTime = Date.now();
  let usageData = {
    api_name: 'dall-e',
    endpoint: '/v1/images/generations',
    user_id: req.user ? req.user._id : null,
    success: false,
    response_time_ms: 0,
    metadata: { size: req.body.size || '1024x1024' }
  };

  try {
    console.log('Iniciando geração de imagem...');
    
    // Obter parâmetros da requisição
    let { prompt, size, agente_id, use_documents, text_overlay, text_position, language, preserve_text, keep_portuguese } = req.body;
    
    // Log dos parâmetros recebidos
    console.log('Parâmetros recebidos:');
    console.log('- prompt:', prompt?.substring(0, 50) + '...');
    console.log('- size:', size);
    console.log('- agente_id:', agente_id);
    console.log('- use_documents:', use_documents);
    console.log('- text_overlay:', text_overlay);
    console.log('- text_position:', text_position);
    console.log('- language:', language);
    console.log('- preserve_text:', preserve_text);
    console.log('- keep_portuguese:', keep_portuguese);
    
    // Se os dados vieram via FormData, eles estarão em campos de string
    if (typeof use_documents === 'string') {
      use_documents = use_documents === 'true';
      console.log('use_documents convertido para boolean:', use_documents);
    }
    
    if (typeof preserve_text === 'string') {
      preserve_text = preserve_text === 'true';
      console.log('preserve_text convertido para boolean:', preserve_text);
    }
    
    if (typeof keep_portuguese === 'string') {
      keep_portuguese = keep_portuguese === 'true';
      console.log('keep_portuguese convertido para boolean:', keep_portuguese);
    }
    
    // Validar prompt
    if (!prompt) {
      console.log('Erro: Prompt não fornecido');
      return res.status(400).json({ message: 'O prompt é obrigatório' });
    }
    
    // Verificar se o tamanho é válido
    const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
    if (!size || !validSizes.includes(size)) {
      console.log(`Tamanho inválido: ${size}, usando tamanho padrão 1024x1024`);
      size = '1024x1024'; // Tamanho padrão se não for especificado ou for inválido
    }
    
    // Verificar se o usuário tem créditos disponíveis (exceto admin)
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user._id);
      
      if (!user) {
        console.log('Erro: Usuário não encontrado');
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      console.log(`Créditos do usuário: ${user.creditos_restantes}`);
      
      if (user.creditos_restantes <= 0) {
        console.log('Erro: Usuário sem créditos suficientes');
        return res.status(403).json({ 
          message: 'Você não tem créditos suficientes para usar esta funcionalidade. Faça upgrade do seu plano.' 
        });
      }
      
      // Descontar um crédito
      user.creditos_restantes -= 1;
      await user.save();
      console.log(`Crédito descontado. Novo saldo: ${user.creditos_restantes}`);
    } else {
      console.log('Usuário é admin, sem desconto de créditos');
    }
    
    console.log(`Gerando imagem com prompt: ${prompt.substring(0, 100)}...`);
    console.log(`Tamanho selecionado: ${size}`);
    
    // Processar documentos de treinamento se use_documents for true
    let conteudoDocumentos = '';
    let documentosProcessados = [];
    
    if (use_documents === true && agente_id) {
      console.log(`Buscando documentos para o agente: ${agente_id}`);
      try {
        const AgenteConfig = mongoose.model('AgenteConfig');
        const agente = await AgenteConfig.findOne({ codigo: agente_id });
        
        if (agente && agente.documentos_treinamento && agente.documentos_treinamento.length > 0) {
          console.log(`Agente ${agente_id} tem ${agente.documentos_treinamento.length} documentos cadastrados`);
          
          // Processar cada documento encontrado no banco de dados
          for (const documento of agente.documentos_treinamento) {
            try {
              console.log(`Processando documento: ${documento.nome} (${documento.caminho})`);
              
              // Usar nosso utilitário para encontrar o arquivo
              const fileResult = findAndReadFile(documento.caminho);
              
              if (fileResult.found) {
                documentosProcessados.push(documento.nome);
                console.log(`Documento lido com sucesso: ${documento.nome} (${fileResult.content.length} caracteres)`);
                conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${fileResult.content}\n--- FIM DO DOCUMENTO ---\n`;
              } else {
                console.log(`Não foi possível encontrar o documento com o utilitário. Tentando caminhos alternativos...`);
                // Tentar caminhos alternativos
                const possiblePaths = [
                  path.join(__dirname, '..', 'uploads', 'training', agente_id, documento.nome),
                  path.join(__dirname, '..', 'uploads', 'training', documento.nome),
                  path.join(__dirname, '..', 'uploads', documento.nome),
                  path.join(__dirname, '..', documento.caminho.replace(/^\//, ''))
                ];
                
                let encontrado = false;
                for (const possiblePath of possiblePaths) {
                  console.log(`Tentando caminho alternativo: ${possiblePath}`);
                  if (fs.existsSync(possiblePath)) {
                    const conteudo = fs.readFileSync(possiblePath, 'utf8');
                    documentosProcessados.push(documento.nome);
                    console.log(`Documento encontrado em caminho alternativo: ${possiblePath} (${conteudo.length} caracteres)`);
                    conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${conteudo}\n--- FIM DO DOCUMENTO ---\n`;
                    encontrado = true;
                    break;
                  }
                }
                
                if (!encontrado) {
                  console.log(`Não foi possível encontrar o arquivo: ${documento.nome} em nenhum dos caminhos testados`);
                }
              }
            } catch (erro) {
              console.error(`Erro ao processar documento ${documento.nome}:`, erro);
            }
          }
        } else {
          console.log(`Agente ${agente_id} não encontrado ou não tem documentos cadastrados`);
        }
      } catch (erro) {
        console.error('Erro ao buscar informações do agente:', erro);
      }
    }
    
    console.log(`Total de documentos processados: ${documentosProcessados.length}`);
    if (documentosProcessados.length > 0) {
      console.log('Documentos processados:', documentosProcessados.join(', '));
    } else {
      console.log('Nenhum documento foi processado para esta geração de imagem');
    }
    
    // Verificar se há imagem de referência
    let imageBase64 = null;
    
    if (req.files && req.files.reference_image) {
      const refImage = req.files.reference_image;
      console.log(`Imagem de referência recebida: ${refImage.name} (${refImage.size} bytes, ${refImage.mimetype})`);
      
      // Converter a imagem para base64
      imageBase64 = `data:${refImage.mimetype};base64,${refImage.data.toString('base64')}`;
      console.log('Imagem de referência convertida para Base64');
    } else {
      console.log('Nenhuma imagem de referência enviada');
    }
    
    // Fazer chamada para a API da OpenAI
    const axios = await import('axios');
    
    // Construir prompt completo com informações dos documentos, se disponíveis
    let promptCompleto = prompt;
    
    // Adicionar texto para incluir na imagem, se especificado
    if (text_overlay) {
      promptCompleto += `. Inclua o texto "${text_overlay}" na posição ${
        text_position === 'top' ? 'superior' : 
        text_position === 'center' ? 'central' : 
        'inferior'
      } da imagem.`;
      console.log(`Texto a ser incluído na imagem: "${text_overlay}" (posição: ${text_position})`);
    }
    
    if (documentosProcessados.length > 0) {
      console.log('Incluindo conteúdo dos documentos no prompt');
      promptCompleto = `Com base nos seguintes documentos de treinamento e design guidelines:\n\n${conteudoDocumentos}\n\nCrie a seguinte imagem: ${promptCompleto}`;
    }
    
    // Configurar a requisição para a API da OpenAI
    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em design para marcas de roupa. Crie imagens de alta qualidade e relevantes para o setor de moda." + 
            (keep_portuguese ? " IMPORTANTE: Mantenha qualquer texto solicitado em português brasileiro. Não traduza nenhum texto para inglês ou outro idioma." : "")
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptCompleto
            }
          ]
        }
      ],
      max_tokens: 4096
    };
    
    // Adicionar imagem de referência se disponível
    if (imageBase64) {
      console.log('Adicionando imagem de referência à requisição');
      requestBody.messages[1].content.push({
        type: "image_url",
        image_url: {
          url: imageBase64
        }
      });
    }
    
    try {
      console.log('Fazendo chamada para GPT-4o para processar o prompt');
      // Obter a chave da API da variável de ambiente
      const apiKey = process.env.OPENAI_API_KEY;
      
      // Primeiro, vamos fazer a chamada para o chat completion para processar o prompt e imagem
      const chatResponse = await axios.default.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Obter a resposta processada pelo modelo
      const processedPrompt = chatResponse.data.choices[0].message.content;
      console.log('Prompt processado pelo GPT-4o:', processedPrompt);
      
      // Registrar uso da API GPT-4
      await apiUsageTracker.trackApiUsage({
        api_name: 'openai',
        endpoint: '/v1/chat/completions',
        user_id: req.user ? req.user._id : null,
        success: true,
        tokens_input: apiUsageTracker.estimateTokens(promptCompleto),
        tokens_output: apiUsageTracker.estimateTokens(processedPrompt),
        cost: apiUsageTracker.calculateOpenAICost(
          'gpt-4o', 
          apiUsageTracker.estimateTokens(promptCompleto), 
          apiUsageTracker.estimateTokens(processedPrompt)
        ),
        response_time_ms: Date.now() - startTime,
        metadata: { purpose: 'dall-e-prompt-processing' }
      });
      
      console.log('Fazendo chamada para DALL-E 3 para gerar a imagem');
      
      // Agora, fazer a chamada para gerar a imagem usando DALL-E 3
      const imageResponse = await axios.default.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: "dall-e-3",
          prompt: processedPrompt,
          n: 1,
          size: size,
          quality: "standard"
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extrair URL da imagem gerada
      const imageUrl = imageResponse.data.data[0].url;
      console.log('Imagem gerada com sucesso. URL recebida.');
      
      // Atualizar dados de uso
      usageData.success = true;
      usageData.cost = apiUsageTracker.calculateOpenAICost('dall-e-3', 0, 0);
      usageData.metadata.image_size = size;
      
      // Salvar no banco de dados
      try {
        const generatedImage = new GeneratedImage({
          usuario_id: req.user._id,
          prompt: prompt,
          processed_prompt: processedPrompt,
          image_url: imageUrl,
          agente_id: agente_id,
          size: size,
          used_documents: documentosProcessados,
          reference_image_used: !!imageBase64,
          text_overlay: text_overlay || null
        });
        
        await generatedImage.save();
        console.log(`Imagem salva no banco de dados com ID: ${generatedImage._id}`);
      } catch (dbError) {
        console.error('Erro ao salvar imagem no banco de dados:', dbError);
        // Continuar mesmo se falhar ao salvar no banco de dados
      }
      
      // Retornar a URL da imagem gerada
      return res.json({
        success: true,
        image_url: imageUrl,
        processed_prompt: processedPrompt
      });
      
    } catch (error) {
      console.error('Erro ao gerar imagem com OpenAI:', error.response?.data || error.message);
      usageData.success = false;
      usageData.error_message = error.message;
      return res.status(500).json({ 
        message: 'Erro ao gerar imagem', 
        error: error.response?.data || error.message 
      });
    }
    
  } catch (error) {
    console.error('Erro ao processar solicitação de geração de imagem:', error);
    usageData.success = false;
    usageData.error_message = error.message;
    res.status(500).json({ message: 'Erro ao processar solicitação de geração de imagem', error: error.message });
  } finally {
    // Registrar uso da API
    usageData.response_time_ms = Date.now() - startTime;
    await apiUsageTracker.trackApiUsage(usageData);
  }
};

// @desc    Obter imagens geradas pelo usuário
// @route   GET /api/integrations/generated-images
// @access  Privado
export const getGeneratedImages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Determinar se deve filtrar por agente
    const filter = { usuario_id: req.user._id };
    
    if (req.query.agente_id) {
      filter.agente_id = req.query.agente_id;
    }
    
    // Buscar imagens paginadas
    const images = await GeneratedImage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Contar total para paginação
    const total = await GeneratedImage.countDocuments(filter);
    
    res.json({
      images,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao obter imagens geradas:', error);
    res.status(500).json({ message: 'Erro ao obter imagens geradas' });
  }
};

// @desc    Obter estatísticas de uso de API
// @route   GET /api/integrations/api-usage-stats
// @access  Admin
export const getApiUsageStats = async (req, res) => {
  try {
    // Obter parâmetros da requisição
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás por padrão
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const apiName = req.query.api_name; // Opcional, filtrar por nome da API
    
    // Configurar filtros
    const filterOptions = {};
    if (apiName) {
      filterOptions.api_name = apiName;
    }
    
    // Obter estatísticas
    const stats = await apiUsageTracker.getApiUsageStats(startDate, endDate, filterOptions);
    
    res.json({
      success: true,
      timeRange: {
        startDate,
        endDate
      },
      stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de uso de API:', error);
    res.status(500).json({ message: 'Erro ao obter estatísticas de uso de API' });
  }
};

// @desc    Obter uso de API por usuário
// @route   GET /api/integrations/api-usage-by-user
// @access  Admin
export const getUserApiUsage = async (req, res) => {
  try {
    // Obter parâmetros da requisição
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás por padrão
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Obter estatísticas por usuário
    const userStats = await apiUsageTracker.getUserApiUsage(startDate, endDate);
    
    res.json({
      success: true,
      timeRange: {
        startDate,
        endDate
      },
      userStats
    });
  } catch (error) {
    console.error('Erro ao obter uso de API por usuário:', error);
    res.status(500).json({ message: 'Erro ao obter uso de API por usuário' });
  }
};

// @desc    Conversar com agente (endpoint alternativo)
// @route   POST /api/integrations/conversar-com-agente
// @access  Privado
export const conversarComAgente = async (req, res) => {
  const startTime = Date.now();
  let usageData = {
    api_name: 'openai',
    endpoint: '/v1/chat/completions',
    user_id: req.user ? req.user._id : null,
    success: false,
    tokens_input: 0,
    tokens_output: 0,
    response_time_ms: 0
  };

  try {
    const { mensagens, agente_id, documentos } = req.body;

    // Validar dados de entrada
    if (!mensagens || !Array.isArray(mensagens) || mensagens.length === 0) {
      return res.status(400).json({ message: 'Mensagens são obrigatórias e devem ser um array não vazio' });
    }

    if (!agente_id) {
      return res.status(400).json({ message: 'ID do agente é obrigatório' });
    }

    // Extrair a última mensagem do usuário como prompt
    const ultimaMensagemUsuario = [...mensagens].filter(msg => msg.role === 'user').pop();
    
    if (!ultimaMensagemUsuario) {
      return res.status(400).json({ message: 'Não foi possível encontrar uma mensagem do usuário' });
    }
    
    const prompt = ultimaMensagemUsuario.content;
    
    console.log('Usando endpoint alternativo para conversar com agente');
    console.log('Agente ID:', agente_id);
    console.log('Total de mensagens:', mensagens.length);
    console.log('Prompt extraído:', prompt.substring(0, 100) + '...');

    // Verificar se o usuário tem créditos disponíveis (exceto admin)
    if (req.user.role !== 'admin') {
      const user = await User.findById(req.user._id);
      
      if (user.creditos_restantes <= 0) {
        return res.status(403).json({ 
          message: 'Você não tem créditos suficientes para usar esta funcionalidade. Faça upgrade do seu plano.' 
        });
      }
      
      // Descontar um crédito
      user.creditos_restantes -= 1;
      await user.save();
    }
    
    // Processar os documentos anexados
    let documentosProcessados = [];
    let conteudoDocumentos = '';
    
    // Abordagem 1: Usar os documentos enviados diretamente
    if (documentos && Array.isArray(documentos) && documentos.length > 0) {
      console.log(`Documentos anexados diretamente: ${documentos.length}`);
      console.log('Documentos:', JSON.stringify(documentos));
    } else {
      console.log(`Nenhum documento enviado diretamente`);
    }
    
    // Abordagem 2: Buscar documentos diretamente do banco de dados pelo agente_id
    if (agente_id) {
      try {
        const AgenteConfig = mongoose.model('AgenteConfig');
        const agente = await AgenteConfig.findOne({ codigo: agente_id });
        
        if (agente && agente.documentos_treinamento && agente.documentos_treinamento.length > 0) {
          console.log(`Agente ${agente_id} tem ${agente.documentos_treinamento.length} documentos cadastrados:`);
          
          // Mostrar os documentos encontrados
          agente.documentos_treinamento.forEach((doc, index) => {
            console.log(`Documento ${index + 1}: ${doc.nome} (${doc.caminho})`);
          });
          
          // Processar cada documento encontrado no banco de dados
          for (const documento of agente.documentos_treinamento) {
            try {
              console.log(`Processando documento: ${documento.nome} (${documento.caminho})`);
              
              // Usar nosso utilitário para encontrar o arquivo
              const fileResult = findAndReadFile(documento.caminho);
              
              if (fileResult.found) {
                documentosProcessados.push(documento.nome);
                console.log(`Documento lido com sucesso: ${documento.nome} (${fileResult.content.length} caracteres)`);
                conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${fileResult.content}\n--- FIM DO DOCUMENTO ---\n`;
              } else {
                // Tentar ler o arquivo diretamente do sistema de arquivos
                try {
                  const filePath = path.join(__dirname, '..', documento.caminho);
                  console.log(`Tentando ler diretamente do caminho: ${filePath}`);
                  
                  if (fs.existsSync(filePath)) {
                    const conteudo = fs.readFileSync(filePath, 'utf8');
                    documentosProcessados.push(documento.nome);
                    console.log(`Documento lido diretamente: ${documento.nome} (${conteudo.length} caracteres)`);
                    conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${conteudo}\n--- FIM DO DOCUMENTO ---\n`;
                  } else {
                    console.log(`Arquivo não encontrado no caminho: ${filePath}`);
                    
                    // Buscar em uma lista de caminhos possíveis
                    const possiblePaths = [
                      path.join(__dirname, '..', 'uploads', 'training', agente_id, documento.nome),
                      path.join(__dirname, '..', 'uploads', 'training', documento.nome),
                      path.join(__dirname, '..', 'uploads', documento.nome),
                      path.join(__dirname, '..', documento.caminho.replace(/^\//, ''))
                    ];
                    
                    let encontrado = false;
                    for (const possiblePath of possiblePaths) {
                      console.log(`Tentando caminho alternativo: ${possiblePath}`);
                      if (fs.existsSync(possiblePath)) {
                        const conteudo = fs.readFileSync(possiblePath, 'utf8');
                        documentosProcessados.push(documento.nome);
                        console.log(`Documento encontrado em caminho alternativo: ${possiblePath} (${conteudo.length} caracteres)`);
                        conteudoDocumentos += `\n\n--- DOCUMENTO: ${documento.nome} ---\n${conteudo}\n--- FIM DO DOCUMENTO ---\n`;
                        encontrado = true;
                        break;
                      }
                    }
                    
                    if (!encontrado) {
                      console.log(`Não foi possível encontrar o arquivo: ${documento.nome} em nenhum dos caminhos testados`);
                    }
                  }
                } catch (erro) {
                  console.error(`Erro ao ler arquivo ${documento.nome}:`, erro);
                }
              }
            } catch (erro) {
              console.error(`Erro ao processar documento ${documento.nome}:`, erro);
            }
          }
        } else {
          console.log(`Agente ${agente_id} não encontrado ou não tem documentos cadastrados`);
        }
      } catch (erro) {
        console.error('Erro ao buscar informações do agente:', erro);
      }
    }
    
    console.log(`Total de documentos processados: ${documentosProcessados.length}`);
    if (documentosProcessados.length > 0) {
      console.log('Documentos processados:', documentosProcessados.join(', '));
    } else {
      console.log('Nenhum documento foi processado com sucesso');
    }
    
    // Fazer chamada para a API da OpenAI
    const axios = await import('axios');
    
    // Preparar mensagens para a API da OpenAI
    let openaiMessages = mensagens;
    
    // Verificar se devemos adicionar instruções do sistema do agente
    if (agente_id) {
      try {
        const AgenteConfig = mongoose.model('AgenteConfig');
        const agente = await AgenteConfig.findOne({ codigo: agente_id });
        
        if (agente) {
          // Usar instruções do sistema do agente
          let instrucaoSistema = agente.instrucoes_sistema || 'Você é um assistente útil e especializado.';
          
          // Adicionar descrição do agente se disponível
          if (agente.descricao) {
            instrucaoSistema = `${instrucaoSistema}\n\nVocê é especializado em: ${agente.descricao}`;
          }
          
          // Adicionar especialidades se disponíveis
          if (agente.especialidades && agente.especialidades.length > 0) {
            instrucaoSistema = `${instrucaoSistema}\n\nSuas especialidades são: ${agente.especialidades.join(', ')}`;
          }
          
          // Adicionar instruções para usar documentos se disponíveis
          instrucaoSistema = `${instrucaoSistema}\n\nResponda utilizando as informações dos documentos fornecidos quando disponíveis.`;
          
          // Verificar se já existe uma mensagem de sistema e substituí-la
          const temMensagemSistema = openaiMessages.some(msg => msg.role === 'system');
          
          if (temMensagemSistema) {
            // Substituir a primeira mensagem de sistema encontrada
            openaiMessages = openaiMessages.map(msg => 
              msg.role === 'system' ? { ...msg, content: instrucaoSistema } : msg
            );
          } else {
            // Adicionar no início se não existir
            openaiMessages.unshift({
              role: 'system',
              content: instrucaoSistema
            });
          }
          
          console.log(`Usando instruções do sistema do agente: ${instrucaoSistema.substring(0, 100)}...`);
        }
      } catch (erro) {
        console.error('Erro ao buscar instruções do agente:', erro);
      }
    }
    
    // Se houver documentos processados, adicionar o conteúdo como contexto
    if (documentosProcessados.length > 0) {
      openaiMessages.unshift({
        role: 'system',
        content: `Documentos de referência disponíveis: ${documentosProcessados.join(', ')}\n\nConteúdo dos documentos:${conteudoDocumentos}`
      });
    }
    
    // Estimar tokens de entrada
    const inputText = openaiMessages.map(m => m.content).join(' ');
    usageData.tokens_input = apiUsageTracker.estimateTokens(inputText);
    
    // Obter a chave da API usando o gerenciador
    const apiKey = await apiKeyManager.getApiKey('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY não encontrada no ambiente');
      return res.status(500).json({ message: 'Configuração da API OpenAI não encontrada' });
    }
    
    const response = await axios.default.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extrair a resposta do modelo
    const resposta = response.data.choices[0].message.content;
    
    // Atualizar dados de uso
    usageData.success = true;
    usageData.tokens_output = apiUsageTracker.estimateTokens(resposta);
    usageData.cost = apiUsageTracker.calculateOpenAICost(
      'gpt-4o', 
      usageData.tokens_input, 
      usageData.tokens_output
    );

    // Retornar a resposta
    res.json(resposta);
    
  } catch (error) {
    console.error('Erro ao conversar com agente:', error.response?.data || error.message);
    usageData.success = false;
    usageData.error_message = error.message;
    res.status(500).json({ message: 'Erro ao processar solicitação de IA' });
  } finally {
    // Registrar uso da API
    usageData.response_time_ms = Date.now() - startTime;
    await apiUsageTracker.trackApiUsage(usageData);
  }
}; 