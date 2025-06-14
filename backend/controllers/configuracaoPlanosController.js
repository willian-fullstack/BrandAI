import ConfiguracaoPlanos from '../models/ConfiguracaoPlanos.js';

// @desc    Obter todas as configurações de planos
// @route   GET /api/configuracao-planos
// @access  Público
export const getConfiguracoesPlanos = async (req, res) => {
  try {
    const configuracoes = await ConfiguracaoPlanos.find({}).sort('preco_mensal');
    res.json(configuracoes);
  } catch (error) {
    console.error('Erro ao obter configurações de planos:', error);
    res.status(500).json({ message: 'Erro ao obter configurações de planos' });
  }
};

// @desc    Obter uma configuração de plano por nome
// @route   GET /api/configuracao-planos/:nome
// @access  Público
export const getConfiguracaoPlanoByNome = async (req, res) => {
  try {
    const configuracao = await ConfiguracaoPlanos.findOne({ nome: req.params.nome });
    
    if (configuracao) {
      res.json(configuracao);
    } else {
      res.status(404).json({ message: 'Configuração de plano não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao obter configuração de plano:', error);
    res.status(500).json({ message: 'Erro ao obter configuração de plano' });
  }
};

// @desc    Criar uma configuração de plano
// @route   POST /api/configuracao-planos
// @access  Privado/Admin
export const criarConfiguracaoPlano = async (req, res) => {
  try {
    const {
      codigo,
      nome,
      descricao,
      preco_mensal,
      preco_anual,
      plano_basico_preco_mensal,
      plano_basico_preco_anual,
      plano_intermediario_preco_mensal,
      plano_intermediario_preco_anual,
      plano_premium_preco_mensal,
      plano_premium_preco_anual,
      desconto_anual_porcentagem,
      limite_conversas_diarias,
      limite_mensagens_por_conversa,
      agentes_disponiveis,
      recursos_inclusos,
      recursos_exclusivos,
      cor_tema,
      ativo,
      descontoAfiliados,
      periodoPadrao,
      diasTesteGratis
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !descricao || !preco_mensal || !preco_anual || !limite_conversas_diarias || !limite_mensagens_por_conversa) {
      return res.status(400).json({
        message: 'Por favor, preencha todos os campos obrigatórios',
      });
    }

    // Verificar se já existe uma configuração com o mesmo nome
    const configuracaoExistente = await ConfiguracaoPlanos.findOne({ nome });
    if (configuracaoExistente) {
      return res.status(400).json({
        message: 'Já existe uma configuração de plano com este nome',
      });
    }

    // Criar configuração
    const configuracao = new ConfiguracaoPlanos({
      codigo: codigo || 'config-principal',
      nome,
      descricao,
      preco_mensal,
      preco_anual,
      // Novos campos para preços específicos de cada plano
      plano_basico_preco_mensal: plano_basico_preco_mensal !== undefined ? Number(plano_basico_preco_mensal) : 67,
      plano_basico_preco_anual: plano_basico_preco_anual !== undefined ? Number(plano_basico_preco_anual) : 597,
      plano_intermediario_preco_mensal: plano_intermediario_preco_mensal !== undefined ? Number(plano_intermediario_preco_mensal) : 97,
      plano_intermediario_preco_anual: plano_intermediario_preco_anual !== undefined ? Number(plano_intermediario_preco_anual) : 897,
      plano_premium_preco_mensal: plano_premium_preco_mensal !== undefined ? Number(plano_premium_preco_mensal) : 197,
      plano_premium_preco_anual: plano_premium_preco_anual !== undefined ? Number(plano_premium_preco_anual) : 1997,
      desconto_anual_porcentagem: desconto_anual_porcentagem || 0,
      limite_conversas_diarias,
      limite_mensagens_por_conversa,
      agentes_disponiveis: agentes_disponiveis || [],
      recursos_inclusos: recursos_inclusos || [],
      recursos_exclusivos: recursos_exclusivos || [],
      cor_tema: cor_tema || 'blue',
      ativo: ativo !== undefined ? ativo : true,
      // Campos adicionais
      descontoAfiliados: descontoAfiliados !== undefined ? Number(descontoAfiliados) : 10,
      periodoPadrao: periodoPadrao || 'mensal',
      diasTesteGratis: diasTesteGratis !== undefined ? Number(diasTesteGratis) : 7
    });

    const configuracaoCriada = await configuracao.save();
    res.status(201).json(configuracaoCriada);
  } catch (error) {
    console.error('Erro ao criar configuração de plano:', error);
    res.status(500).json({ message: 'Erro ao criar configuração de plano', error: error.message });
  }
};

// @desc    Atualizar uma configuração de plano
// @route   PUT /api/configuracao-planos/:id
// @access  Privado/Admin
export const atualizarConfiguracaoPlano = async (req, res) => {
  try {
    console.log("Atualizando configuração de plano com ID:", req.params.id);
    console.log("Dados recebidos:", req.body);
    
    const {
      nome,
      descricao,
      preco_mensal,
      preco_anual,
      plano_basico_preco_mensal,
      plano_basico_preco_anual,
      plano_intermediario_preco_mensal,
      plano_intermediario_preco_anual,
      plano_premium_preco_mensal,
      plano_premium_preco_anual,
      desconto_anual_porcentagem,
      limite_conversas_diarias,
      limite_mensagens_por_conversa,
      agentes_disponiveis,
      recursos_inclusos,
      recursos_exclusivos,
      cor_tema,
      ativo,
      descontoAfiliados,
      periodoPadrao,
      diasTesteGratis
    } = req.body;

    const configuracao = await ConfiguracaoPlanos.findById(req.params.id);
    console.log("Configuração encontrada:", configuracao ? "Sim" : "Não");

    if (configuracao) {
      // Verificar se o nome já existe em outra configuração
      if (nome && nome !== configuracao.nome) {
        const configuracaoExistente = await ConfiguracaoPlanos.findOne({ nome });
        if (configuracaoExistente) {
          console.log("Já existe uma configuração com o nome:", nome);
          return res.status(400).json({
            message: 'Já existe uma configuração de plano com este nome',
          });
        }
      }

      // Atualizar campos
      configuracao.nome = nome || configuracao.nome;
      configuracao.descricao = descricao || configuracao.descricao;
      configuracao.preco_mensal = preco_mensal !== undefined ? preco_mensal : configuracao.preco_mensal;
      configuracao.preco_anual = preco_anual !== undefined ? preco_anual : configuracao.preco_anual;
      
      // Novos campos de preço específicos para cada plano
      if (plano_basico_preco_mensal !== undefined) {
        console.log("Atualizando plano_basico_preco_mensal:", plano_basico_preco_mensal);
        configuracao.plano_basico_preco_mensal = Number(plano_basico_preco_mensal);
      }
      
      if (plano_basico_preco_anual !== undefined) {
        console.log("Atualizando plano_basico_preco_anual:", plano_basico_preco_anual);
        configuracao.plano_basico_preco_anual = Number(plano_basico_preco_anual);
      }
      
      if (plano_intermediario_preco_mensal !== undefined) {
        console.log("Atualizando plano_intermediario_preco_mensal:", plano_intermediario_preco_mensal);
        configuracao.plano_intermediario_preco_mensal = Number(plano_intermediario_preco_mensal);
      }
      
      if (plano_intermediario_preco_anual !== undefined) {
        console.log("Atualizando plano_intermediario_preco_anual:", plano_intermediario_preco_anual);
        configuracao.plano_intermediario_preco_anual = Number(plano_intermediario_preco_anual);
      }
      
      if (plano_premium_preco_mensal !== undefined) {
        console.log("Atualizando plano_premium_preco_mensal:", plano_premium_preco_mensal);
        configuracao.plano_premium_preco_mensal = Number(plano_premium_preco_mensal);
      }
      
      if (plano_premium_preco_anual !== undefined) {
        console.log("Atualizando plano_premium_preco_anual:", plano_premium_preco_anual);
        configuracao.plano_premium_preco_anual = Number(plano_premium_preco_anual);
      }
      
      configuracao.desconto_anual_porcentagem = desconto_anual_porcentagem !== undefined ? desconto_anual_porcentagem : configuracao.desconto_anual_porcentagem;
      configuracao.limite_conversas_diarias = limite_conversas_diarias !== undefined ? limite_conversas_diarias : configuracao.limite_conversas_diarias;
      configuracao.limite_mensagens_por_conversa = limite_mensagens_por_conversa !== undefined ? limite_mensagens_por_conversa : configuracao.limite_mensagens_por_conversa;
      configuracao.agentes_disponiveis = agentes_disponiveis || configuracao.agentes_disponiveis;
      configuracao.recursos_inclusos = recursos_inclusos || configuracao.recursos_inclusos;
      configuracao.recursos_exclusivos = recursos_exclusivos || configuracao.recursos_exclusivos;
      configuracao.cor_tema = cor_tema || configuracao.cor_tema;
      configuracao.ativo = ativo !== undefined ? ativo : configuracao.ativo;
      
      // Campos adicionais
      if (descontoAfiliados !== undefined) configuracao.descontoAfiliados = Number(descontoAfiliados);
      if (periodoPadrao !== undefined) configuracao.periodoPadrao = periodoPadrao;
      if (diasTesteGratis !== undefined) configuracao.diasTesteGratis = Number(diasTesteGratis);

      console.log("Configuração antes de salvar:", configuracao);
      const configuracaoAtualizada = await configuracao.save();
      console.log("Configuração atualizada com sucesso:", configuracaoAtualizada);
      res.json(configuracaoAtualizada);
    } else {
      console.log("Configuração não encontrada com ID:", req.params.id);
      res.status(404).json({ message: 'Configuração de plano não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar configuração de plano:', error);
    res.status(500).json({ message: 'Erro ao atualizar configuração de plano', error: error.message });
  }
};

// @desc    Excluir uma configuração de plano
// @route   DELETE /api/configuracao-planos/:id
// @access  Privado/Admin
export const excluirConfiguracaoPlano = async (req, res) => {
  try {
    const configuracao = await ConfiguracaoPlanos.findById(req.params.id);

    if (configuracao) {
      await configuracao.deleteOne();
      res.json({ message: 'Configuração de plano removida' });
    } else {
      res.status(404).json({ message: 'Configuração de plano não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao excluir configuração de plano:', error);
    res.status(500).json({ message: 'Erro ao excluir configuração de plano' });
  }
};

// @desc    Comparar planos
// @route   GET /api/configuracao-planos/comparar
// @access  Público
export const compararPlanos = async (req, res) => {
  try {
    const planos = await ConfiguracaoPlanos.find({ ativo: true }).sort('preco_mensal');
    
    // Formatar dados para comparação
    const comparacao = {
      planos: planos.map(plano => ({
        nome: plano.nome,
        descricao: plano.descricao,
        preco_mensal: plano.preco_mensal,
        preco_anual: plano.preco_anual,
        economia_anual: ((plano.preco_mensal * 12) - plano.preco_anual).toFixed(2),
        desconto_anual_porcentagem: plano.desconto_anual_porcentagem,
        limite_conversas_diarias: plano.limite_conversas_diarias,
        limite_mensagens_por_conversa: plano.limite_mensagens_por_conversa,
        agentes_disponiveis: plano.agentes_disponiveis,
        recursos_inclusos: plano.recursos_inclusos,
        recursos_exclusivos: plano.recursos_exclusivos,
        cor_tema: plano.cor_tema,
      })),
      recursos_comparados: {},
    };
    
    // Criar tabela de comparação de recursos
    const todosRecursos = new Set();
    planos.forEach(plano => {
      [...plano.recursos_inclusos, ...plano.recursos_exclusivos].forEach(recurso => {
        todosRecursos.add(recurso);
      });
    });
    
    todosRecursos.forEach(recurso => {
      comparacao.recursos_comparados[recurso] = {};
      planos.forEach(plano => {
        comparacao.recursos_comparados[recurso][plano.nome] = 
          plano.recursos_inclusos.includes(recurso) || plano.recursos_exclusivos.includes(recurso);
      });
    });
    
    res.json(comparacao);
  } catch (error) {
    console.error('Erro ao comparar planos:', error);
    res.status(500).json({ message: 'Erro ao comparar planos' });
  }
}; 