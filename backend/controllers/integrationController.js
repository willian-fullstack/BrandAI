import mongoose from 'mongoose';
import Integration from '../models/Integration.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
    const uploadPath = path.join(__dirname, '..', 'uploads', 'training', agenteId);
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Gerar nome de arquivo único
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadPath, fileName);
    
    // Mover o arquivo para o diretório de uploads
    await file.mv(filePath);
    
    // Adicionar documento ao agente
    const novoDocumento = {
      nome: file.name,
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
    const uploadPath = path.join(__dirname, '..', 'uploads', 'files');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Gerar nome de arquivo único
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadPath, fileName);
    
    // Mover o arquivo para o diretório de uploads
    await file.mv(filePath);
    
    // Retornar URL do arquivo
    const fileUrl = `/uploads/files/${fileName}`;
    
    res.status(200).json({
      success: true,
      file_url: fileUrl,
      file_name: file.name,
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
  try {
    const { prompt, file_urls, agente_id } = req.body;

    // Validar se o prompt foi fornecido
    if (!prompt) {
      return res.status(400).json({ message: 'O prompt é obrigatório' });
    }

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
    
    // Obter a chave da API do ambiente
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY não encontrada no ambiente');
      return res.status(500).json({ message: 'Configuração da API OpenAI não encontrada' });
    }
    
    // Preparar mensagens para a API da OpenAI
    const messages = [
      { 
        role: 'system', 
        content: 'Você é um assistente útil e especializado. Responda utilizando as informações dos documentos fornecidos quando disponíveis.' 
      }
    ];
    
    // Se houver documentos processados, adicionar o conteúdo como contexto
    if (documentosProcessados.length > 0) {
      messages.push({
        role: 'system',
        content: `Documentos de referência disponíveis: ${documentosProcessados.join(', ')}\n\nConteúdo dos documentos:${conteudoDocumentos}`
      });
    }
    
    // Adicionar a mensagem do usuário
    messages.push({ role: 'user', content: prompt });
    
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

    // Retornar a resposta
    res.json(resposta);
    
  } catch (error) {
    console.error('Erro ao invocar modelo de linguagem:', error.response?.data || error.message);
    res.status(500).json({ message: 'Erro ao processar solicitação de IA' });
  }
};

// Utilitário para encontrar e ler arquivos
const findAndReadFile = (filePath) => {
  try {
    // Verificar se o caminho é absoluto
    if (path.isAbsolute(filePath)) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return { found: true, content, path: filePath };
      }
    }
    
    // Lista de diretórios possíveis para procurar o arquivo
    const baseDirs = [
      path.join(__dirname, '..', 'uploads'),
      path.join(__dirname, '..', 'uploads', 'training'),
      path.join(__dirname, '..'),
      path.join(__dirname, '..', '..'),
    ];
    
    // Nome do arquivo
    const fileName = path.basename(filePath);
    
    // Para cada diretório, verificar se o arquivo existe
    for (const dir of baseDirs) {
      const fullPath = path.join(dir, fileName);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        return { found: true, content, path: fullPath };
      }
      
      // Verificar recursivamente em subdiretórios (limitado a 1 nível para evitar buscas muito profundas)
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
      } catch (err) {
        // Ignorar erros de acesso a diretórios
      }
    }
    
    // Se chegou aqui, o arquivo não foi encontrado
    return { found: false, error: 'Arquivo não encontrado' };
  } catch (error) {
    return { found: false, error: error.message };
  }
}; 