import AgenteConfig from '../models/AgenteConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Obter todas as configurações de agentes
// @route   GET /api/agente-config
// @access  Privado
export const getAgentesConfig = async (req, res) => {
  try {
    const { ativo, disponivel_em } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (ativo !== undefined) {
      filtro.ativo = ativo === 'true';
    }
    
    if (disponivel_em) {
      filtro.disponivel_em = disponivel_em;
    }
    
    const agentesConfig = await AgenteConfig.find(filtro).sort('codigo');
    
    res.json(agentesConfig);
  } catch (error) {
    console.error('Erro ao obter configurações de agentes:', error);
    res.status(500).json({ message: 'Erro ao obter configurações de agentes' });
  }
};

// @desc    Obter uma configuração de agente por código
// @route   GET /api/agente-config/:codigo
// @access  Privado
export const getAgenteConfigByCodigo = async (req, res) => {
  try {
    const agenteConfig = await AgenteConfig.findOne({ codigo: req.params.codigo });
    
    if (!agenteConfig) {
      return res.status(404).json({ message: 'Configuração de agente não encontrada' });
    }
    
    res.json(agenteConfig);
  } catch (error) {
    console.error('Erro ao obter configuração de agente:', error);
    res.status(500).json({ message: 'Erro ao obter configuração de agente' });
  }
};

// @desc    Criar uma nova configuração de agente
// @route   POST /api/agente-config
// @access  Privado/Admin
export const criarAgenteConfig = async (req, res) => {
  try {
    const {
      codigo,
      nome,
      descricao,
      icon,
      cor,
      especialidades,
      instrucoes_sistema,
      exemplos_uso,
      modelo_ia,
      temperatura,
      max_tokens,
      ativo,
      disponivel_em,
    } = req.body;

    // Verificar se já existe um agente com este código
    const agenteExistente = await AgenteConfig.findOne({ codigo });
    
    if (agenteExistente) {
      return res.status(400).json({ message: 'Já existe um agente com este código' });
    }
    
    // Criar novo agente
    const agenteConfig = new AgenteConfig({
      codigo,
      nome,
      descricao,
      icon,
      cor,
      especialidades,
      instrucoes_sistema,
      exemplos_uso,
      modelo_ia,
      temperatura,
      max_tokens,
      ativo,
      disponivel_em,
    });
    
    const agenteConfigCriado = await agenteConfig.save();
    
    res.status(201).json(agenteConfigCriado);
  } catch (error) {
    console.error('Erro ao criar configuração de agente:', error);
    res.status(500).json({ message: 'Erro ao criar configuração de agente' });
  }
};

// @desc    Atualizar uma configuração de agente
// @route   PUT /api/agente-config/:codigo
// @access  Privado/Admin
export const atualizarAgenteConfig = async (req, res) => {
  try {
    const agenteConfig = await AgenteConfig.findOne({ codigo: req.params.codigo });
    
    if (!agenteConfig) {
      return res.status(404).json({ message: 'Configuração de agente não encontrada' });
    }
    
    const {
      nome,
      descricao,
      icon,
      cor,
      especialidades,
      instrucoes_sistema,
      exemplos_uso,
      modelo_ia,
      temperatura,
      max_tokens,
      ativo,
      disponivel_em,
    } = req.body;
    
    // Atualizar campos
    if (nome) agenteConfig.nome = nome;
    if (descricao) agenteConfig.descricao = descricao;
    if (icon) agenteConfig.icon = icon;
    if (cor) agenteConfig.cor = cor;
    if (especialidades) agenteConfig.especialidades = especialidades;
    if (instrucoes_sistema) agenteConfig.instrucoes_sistema = instrucoes_sistema;
    if (exemplos_uso) agenteConfig.exemplos_uso = exemplos_uso;
    if (modelo_ia) agenteConfig.modelo_ia = modelo_ia;
    if (temperatura !== undefined) agenteConfig.temperatura = temperatura;
    if (max_tokens !== undefined) agenteConfig.max_tokens = max_tokens;
    if (ativo !== undefined) agenteConfig.ativo = ativo;
    if (disponivel_em) agenteConfig.disponivel_em = disponivel_em;
    
    const agenteConfigAtualizado = await agenteConfig.save();
    
    res.json(agenteConfigAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar configuração de agente:', error);
    res.status(500).json({ message: 'Erro ao atualizar configuração de agente' });
  }
};

// @desc    Excluir uma configuração de agente
// @route   DELETE /api/agente-config/:codigo
// @access  Privado/Admin
export const excluirAgenteConfig = async (req, res) => {
  try {
    const agenteConfig = await AgenteConfig.findOne({ codigo: req.params.codigo });
    
    if (!agenteConfig) {
      return res.status(404).json({ message: 'Configuração de agente não encontrada' });
    }
    
    await agenteConfig.deleteOne();
    
    res.json({ message: 'Configuração de agente removida' });
  } catch (error) {
    console.error('Erro ao excluir configuração de agente:', error);
    res.status(500).json({ message: 'Erro ao excluir configuração de agente' });
  }
};

// @desc    Excluir um documento de treinamento de um agente
// @route   DELETE /api/agente-config/:codigo/documento/:documentoId
// @access  Privado/Admin
export const excluirDocumentoTreinamento = async (req, res) => {
  try {
    const { codigo, documentoId } = req.params;
    
    // Buscar o agente
    const agenteConfig = await AgenteConfig.findOne({ codigo });
    
    if (!agenteConfig) {
      return res.status(404).json({ message: 'Configuração de agente não encontrada' });
    }
    
    // Encontrar o documento pelo ID
    const documento = agenteConfig.documentos_treinamento.id(documentoId);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento de treinamento não encontrado' });
    }
    
    // Caminho do arquivo físico
    const filePath = path.join(__dirname, '..', documento.caminho);
    
    // Remover o arquivo físico se existir
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Erro ao excluir arquivo físico:', fileError);
      // Continua mesmo se não conseguir excluir o arquivo
    }
    
    // Remover o documento da array
    agenteConfig.documentos_treinamento.pull(documentoId);
    
    // Salvar as alterações
    await agenteConfig.save();
    
    res.json({ 
      message: 'Documento de treinamento removido com sucesso',
      documentoId
    });
  } catch (error) {
    console.error('Erro ao excluir documento de treinamento:', error);
    res.status(500).json({ message: 'Erro ao excluir documento de treinamento' });
  }
}; 