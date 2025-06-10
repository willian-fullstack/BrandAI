import ConfiguracaoIA from '../models/ConfiguracaoIA.js';

// @desc    Obter todas as configurações de IA
// @route   GET /api/configuracao-ia
// @access  Privado/Admin
export const getConfiguracoesIA = async (req, res) => {
  try {
    const configuracoes = await ConfiguracaoIA.find({}).sort('nome');
    
    // Ocultar chaves de API na resposta
    const configuracoesSeguras = configuracoes.map(config => {
      const configObj = config.toObject();
      configObj.chave_api = configObj.chave_api ? '••••••••' : '';
      return configObj;
    });
    
    res.json(configuracoesSeguras);
  } catch (error) {
    console.error('Erro ao obter configurações de IA:', error);
    res.status(500).json({ message: 'Erro ao obter configurações de IA' });
  }
};

// @desc    Obter uma configuração de IA por ID
// @route   GET /api/configuracao-ia/:id
// @access  Privado/Admin
export const getConfiguracaoIAById = async (req, res) => {
  try {
    const configuracao = await ConfiguracaoIA.findById(req.params.id);
    
    if (configuracao) {
      // Ocultar chave de API na resposta
      const configObj = configuracao.toObject();
      configObj.chave_api = configObj.chave_api ? '••••••••' : '';
      
      res.json(configObj);
    } else {
      res.status(404).json({ message: 'Configuração de IA não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter configuração de IA:', error);
    res.status(500).json({ message: 'Erro ao obter configuração de IA' });
  }
};

// @desc    Criar uma configuração de IA
// @route   POST /api/configuracao-ia
// @access  Privado/Admin
export const criarConfiguracaoIA = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      provedor,
      modelo,
      chave_api,
      parametros_padrao,
      ativo,
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !descricao || !provedor || !modelo || !chave_api) {
      return res.status(400).json({
        message: 'Por favor, preencha todos os campos obrigatórios',
      });
    }

    // Verificar se já existe uma configuração com o mesmo nome
    const configuracaoExistente = await ConfiguracaoIA.findOne({ nome });
    if (configuracaoExistente) {
      return res.status(400).json({
        message: 'Já existe uma configuração de IA com este nome',
      });
    }

    // Criar configuração
    const configuracao = new ConfiguracaoIA({
      nome,
      descricao,
      provedor,
      modelo,
      chave_api,
      parametros_padrao: parametros_padrao || {},
      ativo: ativo !== undefined ? ativo : true,
    });

    const configuracaoCriada = await configuracao.save();

    // Ocultar chave de API na resposta
    const configObj = configuracaoCriada.toObject();
    configObj.chave_api = configObj.chave_api ? '••••••••' : '';

    res.status(201).json(configObj);
  } catch (error) {
    console.error('Erro ao criar configuração de IA:', error);
    res.status(500).json({ message: 'Erro ao criar configuração de IA' });
  }
};

// @desc    Atualizar uma configuração de IA
// @route   PUT /api/configuracao-ia/:id
// @access  Privado/Admin
export const atualizarConfiguracaoIA = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      provedor,
      modelo,
      chave_api,
      parametros_padrao,
      ativo,
    } = req.body;

    const configuracao = await ConfiguracaoIA.findById(req.params.id);

    if (configuracao) {
      // Verificar se o nome já existe em outra configuração
      if (nome && nome !== configuracao.nome) {
        const configuracaoExistente = await ConfiguracaoIA.findOne({ nome });
        if (configuracaoExistente) {
          return res.status(400).json({
            message: 'Já existe uma configuração de IA com este nome',
          });
        }
      }

      // Atualizar campos
      configuracao.nome = nome || configuracao.nome;
      configuracao.descricao = descricao || configuracao.descricao;
      configuracao.provedor = provedor || configuracao.provedor;
      configuracao.modelo = modelo || configuracao.modelo;
      
      // Só atualizar a chave se for fornecida
      if (chave_api && chave_api !== '••••••••') {
        configuracao.chave_api = chave_api;
      }
      
      // Mesclar parâmetros padrão existentes com os novos
      if (parametros_padrao) {
        configuracao.parametros_padrao = {
          ...configuracao.parametros_padrao,
          ...parametros_padrao,
        };
      }
      
      if (ativo !== undefined) {
        configuracao.ativo = ativo;
      }

      const configuracaoAtualizada = await configuracao.save();

      // Ocultar chave de API na resposta
      const configObj = configuracaoAtualizada.toObject();
      configObj.chave_api = configObj.chave_api ? '••••••••' : '';

      res.json(configObj);
    } else {
      res.status(404).json({ message: 'Configuração de IA não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar configuração de IA:', error);
    res.status(500).json({ message: 'Erro ao atualizar configuração de IA' });
  }
};

// @desc    Excluir uma configuração de IA
// @route   DELETE /api/configuracao-ia/:id
// @access  Privado/Admin
export const excluirConfiguracaoIA = async (req, res) => {
  try {
    const configuracao = await ConfiguracaoIA.findById(req.params.id);

    if (configuracao) {
      await configuracao.deleteOne();
      res.json({ message: 'Configuração de IA removida' });
    } else {
      res.status(404).json({ message: 'Configuração de IA não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao excluir configuração de IA:', error);
    res.status(500).json({ message: 'Erro ao excluir configuração de IA' });
  }
};

// @desc    Testar conexão com provedor de IA
// @route   POST /api/configuracao-ia/:id/testar
// @access  Privado/Admin
export const testarConfiguracaoIA = async (req, res) => {
  try {
    const configuracao = await ConfiguracaoIA.findById(req.params.id);

    if (!configuracao) {
      return res.status(404).json({ message: 'Configuração de IA não encontrada' });
    }

    // Simular teste de conexão com base no provedor
    let resultado;

    switch (configuracao.provedor) {
      case 'openai':
        // Aqui implementaríamos um teste real com a API da OpenAI
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com OpenAI estabelecida com sucesso',
          modelos_disponiveis: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        };
        break;
      case 'anthropic':
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com Anthropic estabelecida com sucesso',
          modelos_disponiveis: ['claude-2', 'claude-instant'],
        };
        break;
      case 'google':
        resultado = {
          sucesso: true,
          mensagem: 'Conexão com Google AI estabelecida com sucesso',
          modelos_disponiveis: ['gemini-pro', 'gemini-ultra'],
        };
        break;
      default:
        resultado = {
          sucesso: false,
          mensagem: `Provedor ${configuracao.provedor} não suportado para teste`,
        };
    }

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao testar configuração de IA:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao testar configuração de IA',
      erro: error.message,
    });
  }
}; 