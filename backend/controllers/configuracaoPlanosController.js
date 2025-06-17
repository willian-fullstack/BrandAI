import ConfiguracaoPlanos from '../models/ConfiguracaoPlanos.js';

// @desc    Obter todas as configurações de planos
// @route   GET /api/configuracao-planos
// @access  Público
export const getConfiguracoesPlanos = async (req, res) => {
  try {
    const configuracoesPlanos = await ConfiguracaoPlanos.find();
    res.json(configuracoesPlanos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obter uma configuração de plano específica
// @route   GET /api/configuracao-planos/:id
// @access  Público
export const getConfiguracaoPlano = async (req, res) => {
  try {
    const configuracaoPlano = await ConfiguracaoPlanos.findById(req.params.id);
    if (!configuracaoPlano) {
      return res.status(404).json({ message: 'Configuração de plano não encontrada' });
    }
    res.json(configuracaoPlano);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Criar uma nova configuração de plano
// @route   POST /api/configuracao-planos
// @access  Privado/Admin
export const createConfiguracaoPlano = async (req, res) => {
  try {
    const configuracaoPlano = new ConfiguracaoPlanos(req.body);
    const savedConfiguracaoPlano = await configuracaoPlano.save();
    res.status(201).json(savedConfiguracaoPlano);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Atualizar uma configuração de plano existente
// @route   PUT /api/configuracao-planos/:id
// @access  Privado/Admin
export const updateConfiguracaoPlano = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se existem cupons e garantir que tenham os campos necessários
    if (req.body.cupons && Array.isArray(req.body.cupons)) {
      req.body.cupons = req.body.cupons.map(cupom => {
        // Garantir que cada cupom tenha um código
        if (!cupom.codigo) {
          cupom.codigo = `CUPOM${Math.floor(Math.random() * 10000)}`;
        }
        return cupom;
      });
    }
    
    const updatedConfiguracaoPlano = await ConfiguracaoPlanos.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedConfiguracaoPlano) {
      return res.status(404).json({ message: 'Configuração de plano não encontrada' });
    }
    
    res.json(updatedConfiguracaoPlano);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Excluir uma configuração de plano
// @route   DELETE /api/configuracao-planos/:id
// @access  Privado/Admin
export const deleteConfiguracaoPlano = async (req, res) => {
  try {
    const configuracaoPlano = await ConfiguracaoPlanos.findById(req.params.id);
    if (!configuracaoPlano) {
      return res.status(404).json({ message: 'Configuração de plano não encontrada' });
    }
    
    await configuracaoPlano.deleteOne();
    res.json({ message: 'Configuração de plano excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verificar validade de um cupom
// @route   GET /api/configuracao-planos/verificar-cupom/:codigo
// @access  Público
export const verificarCupom = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Buscar configuração que contém o cupom
    const configuracao = await ConfiguracaoPlanos.findOne({
      'cupons.codigo': codigo
    });
    
    if (!configuracao) {
      return res.status(404).json({ 
        valido: false,
        message: 'Cupom não encontrado' 
      });
    }
    
    // Encontrar o cupom específico
    const cupom = configuracao.cupons.find(c => c.codigo === codigo);
    
    if (!cupom) {
      return res.status(404).json({ 
        valido: false,
        message: 'Cupom não encontrado' 
      });
    }
    
    // Verificar se o cupom está ativo
    if (!cupom.ativo) {
      return res.status(400).json({ 
        valido: false,
        message: 'Cupom inativo' 
      });
    }
    
    // Verificar limite de usos
    if (cupom.limite_usos > 0 && cupom.usos_atuais >= cupom.limite_usos) {
      return res.status(400).json({ 
        valido: false,
        message: 'Limite de usos do cupom excedido' 
      });
    }
    
    // Verificar data de validade
    const agora = new Date();
    
    if (cupom.data_inicio && new Date(cupom.data_inicio) > agora) {
      return res.status(400).json({ 
        valido: false,
        message: 'Cupom ainda não está válido' 
      });
    }
    
    if (cupom.data_expiracao && new Date(cupom.data_expiracao) < agora) {
      return res.status(400).json({ 
        valido: false,
        message: 'Cupom expirado' 
      });
    }
    
    // Cupom válido
    res.json({
      valido: true,
      cupom: {
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor,
        descricao: cupom.descricao,
        planos_aplicaveis: cupom.planos_aplicaveis
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Aplicar uso de um cupom (incrementar contador de uso)
// @route   PUT /api/configuracao-planos/aplicar-cupom/:codigo
// @access  Público
export const aplicarCupom = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Buscar e atualizar o uso do cupom
    const configuracao = await ConfiguracaoPlanos.findOne({
      'cupons.codigo': codigo
    });
    
    if (!configuracao) {
      return res.status(404).json({ message: 'Cupom não encontrado' });
    }
    
    // Encontrar o índice do cupom
    const cupomIndex = configuracao.cupons.findIndex(c => c.codigo === codigo);
    
    if (cupomIndex === -1) {
      return res.status(404).json({ message: 'Cupom não encontrado' });
    }
    
    // Incrementar o contador de usos
    configuracao.cupons[cupomIndex].usos_atuais += 1;
    
    // Salvar a configuração atualizada
    await configuracao.save();
    
    res.json({ 
      message: 'Cupom aplicado com sucesso',
      usos_atuais: configuracao.cupons[cupomIndex].usos_atuais
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
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