import Indicacao from '../models/Indicacao.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Criar uma nova indicação
// @route   POST /api/indicacoes
// @access  Privado
export const criarIndicacao = async (req, res) => {
  try {
    const { email_indicado } = req.body;

    if (!email_indicado) {
      return res.status(400).json({ message: 'Email do indicado é obrigatório' });
    }

    // Verificar se o email já foi indicado pelo usuário
    const indicacaoExistente = await Indicacao.findOne({
      usuario_indicador: req.user._id,
      email_indicado,
    });

    if (indicacaoExistente) {
      return res.status(400).json({ message: 'Este email já foi indicado por você' });
    }

    // Verificar se o email já está cadastrado
    const usuarioExistente = await User.findOne({ email: email_indicado });

    if (usuarioExistente) {
      return res.status(400).json({ message: 'Este email já está cadastrado no sistema' });
    }

    // Gerar código único
    const codigo = uuidv4().substring(0, 8).toUpperCase();

    // Criar indicação
    const indicacao = new Indicacao({
      codigo,
      usuario_indicador: req.user._id,
      email_indicado,
    });

    const indicacaoCriada = await indicacao.save();

    res.status(201).json(indicacaoCriada);
  } catch (error) {
    console.error('Erro ao criar indicação:', error);
    res.status(500).json({ message: 'Erro ao criar indicação' });
  }
};

// @desc    Obter todas as indicações do usuário
// @route   GET /api/indicacoes
// @access  Privado
export const getIndicacoes = async (req, res) => {
  try {
    const indicacoes = await Indicacao.find({ usuario_indicador: req.user._id })
      .sort('-createdAt')
      .populate('usuario_indicado', 'full_name email');

    res.json(indicacoes);
  } catch (error) {
    console.error('Erro ao obter indicações:', error);
    res.status(500).json({ message: 'Erro ao obter indicações' });
  }
};

// @desc    Verificar código de indicação
// @route   GET /api/indicacoes/verificar/:codigo
// @access  Público
export const verificarCodigo = async (req, res) => {
  try {
    const indicacao = await Indicacao.findOne({ codigo: req.params.codigo })
      .populate('usuario_indicador', 'full_name');

    if (indicacao) {
      // Verificar se a indicação não expirou
      if (indicacao.status === 'expirada' || new Date() > indicacao.data_expiracao) {
        return res.status(400).json({ message: 'Código de indicação expirado' });
      }

      // Verificar se a indicação já foi aceita
      if (indicacao.status === 'aceita') {
        return res.status(400).json({ message: 'Código de indicação já utilizado' });
      }

      res.json({
        valido: true,
        indicador: indicacao.usuario_indicador.full_name,
        email_indicado: indicacao.email_indicado,
      });
    } else {
      res.status(404).json({ message: 'Código de indicação inválido' });
    }
  } catch (error) {
    console.error('Erro ao verificar código de indicação:', error);
    res.status(500).json({ message: 'Erro ao verificar código de indicação' });
  }
};

// @desc    Processar indicação após registro
// @route   PUT /api/indicacoes/processar/:codigo
// @access  Privado
export const processarIndicacao = async (req, res) => {
  try {
    const indicacao = await Indicacao.findOne({ codigo: req.params.codigo });

    if (!indicacao) {
      return res.status(404).json({ message: 'Código de indicação inválido' });
    }

    // Verificar se a indicação não expirou
    if (indicacao.status === 'expirada' || new Date() > indicacao.data_expiracao) {
      return res.status(400).json({ message: 'Código de indicação expirado' });
    }

    // Verificar se a indicação já foi aceita
    if (indicacao.status === 'aceita') {
      return res.status(400).json({ message: 'Código de indicação já utilizado' });
    }

    // Atualizar indicação
    indicacao.status = 'aceita';
    indicacao.usuario_indicado = req.user._id;
    await indicacao.save();

    // Conceder benefício ao indicador se ainda não foi concedido
    if (!indicacao.beneficio_concedido) {
      const indicador = await User.findById(indicacao.usuario_indicador);

      if (indicador) {
        // Se o benefício for dias premium
        if (indicacao.tipo_beneficio === 'dias_premium') {
          // Calcular nova data de expiração
          const novaDataExpiracao = new Date(indicador.data_expiracao_plano);
          novaDataExpiracao.setDate(novaDataExpiracao.getDate() + indicacao.valor_beneficio);

          // Atualizar usuário
          indicador.data_expiracao_plano = novaDataExpiracao;
          await indicador.save();
        }

        // Marcar benefício como concedido
        indicacao.beneficio_concedido = true;
        await indicacao.save();
      }
    }

    res.json({ message: 'Indicação processada com sucesso' });
  } catch (error) {
    console.error('Erro ao processar indicação:', error);
    res.status(500).json({ message: 'Erro ao processar indicação' });
  }
};

// @desc    Obter estatísticas de indicações
// @route   GET /api/indicacoes/estatisticas
// @access  Privado
export const getEstatisticas = async (req, res) => {
  try {
    const totalIndicacoes = await Indicacao.countDocuments({ usuario_indicador: req.user._id });
    const indicacoesAceitas = await Indicacao.countDocuments({
      usuario_indicador: req.user._id,
      status: 'aceita',
    });
    const indicacoesPendentes = await Indicacao.countDocuments({
      usuario_indicador: req.user._id,
      status: 'pendente',
    });
    const indicacoesExpiradas = await Indicacao.countDocuments({
      usuario_indicador: req.user._id,
      status: 'expirada',
    });

    res.json({
      total: totalIndicacoes,
      aceitas: indicacoesAceitas,
      pendentes: indicacoesPendentes,
      expiradas: indicacoesExpiradas,
      taxa_conversao: totalIndicacoes > 0 ? (indicacoesAceitas / totalIndicacoes) * 100 : 0,
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de indicações:', error);
    res.status(500).json({ message: 'Erro ao obter estatísticas de indicações' });
  }
}; 