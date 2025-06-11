import Conversa from '../models/Conversa.js';
import User from '../models/User.js';
import AgenteConfig from '../models/AgenteConfig.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// @desc    Criar uma nova conversa
// @route   POST /api/conversas
// @access  Privado
export const criarConversa = async (req, res) => {
  try {
    const { titulo, agente_id, mensagem_inicial, mensagens } = req.body;

    console.log("Criando conversa com dados:", {
      titulo,
      agente_id,
      usuario_id: req.user._id,
      mensagem_inicial: mensagem_inicial ? "presente" : "ausente",
      mensagens: mensagens ? "presente" : "ausente"
    });

    if (!titulo || !agente_id) {
      return res.status(400).json({ message: 'Título e agente são obrigatórios' });
    }

    // Verificar se o agente existe
    const agente = await AgenteConfig.findOne({ codigo: agente_id });
    if (!agente) {
      return res.status(404).json({ message: 'Agente não encontrado' });
    }

    // Verificar se o usuário tem créditos disponíveis (admin tem créditos ilimitados)
    if (req.user.role !== 'admin' && !req.user.creditos_ilimitados && req.user.creditos_disponiveis <= 0) {
      return res.status(403).json({ message: 'Você não tem créditos suficientes para iniciar uma nova conversa' });
    }

    // Processar mensagens para garantir que tenham o campo 'remetente'
    let mensagensProcessadas = [];
    
    // Se tiver mensagens enviadas do frontend
    if (mensagens && mensagens.length > 0) {
      mensagensProcessadas = mensagens.map(msg => {
        // Se já tem o campo remetente, mantê-lo
        if (msg.remetente) {
          return msg;
        }
        
        // Se não tem remetente mas tem tipo, usar o tipo como remetente
        if (msg.tipo) {
          return {
            ...msg,
            remetente: msg.tipo // Mapear 'tipo' para 'remetente'
          };
        }
        
        // Caso não tenha nem remetente nem tipo, assumir como sistema
        return {
          ...msg,
          remetente: 'sistema'
        };
      });
    } 
    // Se tiver apenas mensagem inicial
    else if (mensagem_inicial) {
      mensagensProcessadas = [
        {
          conteudo: mensagem_inicial,
          remetente: 'usuario',
        },
      ];
    }

    // Criar conversa
    const conversa = new Conversa({
      titulo,
      usuario_id: req.user._id,
      agente_id,
      mensagens: mensagensProcessadas,
    });

    const conversaCriada = await conversa.save();
    console.log("Conversa criada com sucesso:", {
      id: conversaCriada._id,
      titulo: conversaCriada.titulo,
      agente_id: conversaCriada.agente_id
    });

    // Decrementar créditos do usuário (se não for admin e não tiver créditos ilimitados)
    if (req.user.role !== 'admin' && !req.user.creditos_ilimitados) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { creditos_disponiveis: -1 },
      });
    }

    // Converter _id para id para compatibilidade com o frontend
    const conversaResponse = conversaCriada.toObject();
    conversaResponse.id = conversaResponse._id.toString();
    
    res.status(201).json(conversaResponse);
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    res.status(500).json({ message: 'Erro ao criar conversa' });
  }
};

// @desc    Obter todas as conversas do usuário ou todas as conversas (para admin)
// @route   GET /api/conversas
// @access  Privado
export const getConversas = async (req, res) => {
  try {
    const { limit = 20, page = 1, all = false, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filtro de busca: admin pode ver todas as conversas se all=true
    let filtro = req.user.role === 'admin' && all === 'true' 
      ? {} 
      : { usuario_id: req.user._id };
      
    // Adicionar filtro de pesquisa por título se fornecido
    if (search && search.trim() !== '') {
      filtro = {
        ...filtro,
        $or: [
          { titulo: { $regex: search, $options: 'i' } },
          // Opcionalmente, buscar também nas mensagens
          { 'mensagens.conteudo': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const conversas = await Conversa.find(filtro)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('titulo agente_id status usuario_id createdAt updatedAt');

    const total = await Conversa.countDocuments(filtro);

    // Converter _id para id em todas as conversas
    const conversasFormatadas = conversas.map(conversa => {
      const obj = conversa.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    // Se for admin e all=true, popular informações dos usuários
    if (req.user.role === 'admin' && all === 'true') {
      const conversasPopuladas = await Conversa.populate(conversasFormatadas, {
        path: 'usuario_id',
        select: 'full_name email'
      });

      return res.json({
        conversas: conversasPopuladas,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      });
    }

    res.json({
      conversas: conversasFormatadas,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ message: 'Erro ao buscar conversas' });
  }
};

// @desc    Obter uma conversa por ID
// @route   GET /api/conversas/:id
// @access  Privado
export const getConversaById = async (req, res) => {
  try {
    // Verificar se o ID é válido
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'ID de conversa inválido' });
    }
    
    const conversa = await Conversa.findById(req.params.id);

    if (!conversa) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    // Converter _id para id para compatibilidade com o frontend
    const conversaResponse = conversa.toObject();
    conversaResponse.id = conversaResponse._id.toString();

    // Se for admin, popular informações do usuário
    if (req.user.role === 'admin') {
      const conversaPopulada = await Conversa.populate(conversaResponse, {
        path: 'usuario_id',
        select: 'full_name email'
      });
      return res.json(conversaPopulada);
    }

    res.json(conversaResponse);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ message: 'Erro ao buscar conversa' });
  }
};

// @desc    Adicionar mensagem a uma conversa
// @route   POST /api/conversas/:id/mensagens
// @access  Privado
export const adicionarMensagem = async (req, res) => {
  try {
    const { conteudo, tipo } = req.body;
    const { id } = req.params;

    if (!conteudo) {
      return res.status(400).json({ message: 'Conteúdo da mensagem é obrigatório' });
    }

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'ID de conversa inválido' });
    }

    const conversa = await Conversa.findById(id);

    if (!conversa) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    // Verificar se a conversa está ativa
    if (conversa.status === 'encerrada') {
      return res.status(400).json({ message: 'Conversa encerrada, não é possível adicionar mensagens' });
    }

    // Verificar se o usuário tem créditos disponíveis (exceto admin)
    if (req.user.role !== 'admin' && !req.user.creditos_ilimitados && req.user.creditos_disponiveis <= 0) {
      return res.status(403).json({ message: 'Você não tem créditos suficientes para enviar mais mensagens' });
    }

    // Adicionar mensagem do usuário, usando 'tipo' como 'remetente' se fornecido
    const mensagemUsuario = {
      conteudo,
      remetente: tipo || 'usuario',
    };

    conversa.mensagens.push(mensagemUsuario);
    
    // Atualizar data de modificação
    conversa.updatedAt = Date.now();
    
    await conversa.save();

    // Obter configuração do agente
    const agente = await AgenteConfig.findOne({ codigo: conversa.agente_id });
    
    if (!agente) {
      return res.status(404).json({ message: 'Configuração do agente não encontrada' });
    }

    // Preparar histórico de mensagens para contexto
    const historicoMensagens = conversa.mensagens.map(msg => ({
      role: msg.remetente === 'usuario' ? 'user' : 'assistant',
      content: msg.conteudo
    }));

    // Configurar mensagem do sistema com as instruções do agente
    const mensagemSistema = {
      role: 'system',
      content: agente.instrucoes_sistema
    };

    // Preparar requisição para a API da OpenAI
    try {
      // Configuração da chamada para a API
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: agente.modelo || 'gpt-4o',
          messages: [mensagemSistema, ...historicoMensagens],
          temperature: agente.temperatura || 0.7,
          max_tokens: agente.max_tokens || 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${"sk-OPENAI-API-KEY"}`, // Chave de API falsa para fins de demonstração
            'Content-Type': 'application/json'
          }
        }
      );

      // Adicionar resposta do agente
      const mensagemAgente = {
        conteudo: openaiResponse.data.choices[0].message.content,
        remetente: 'agente',
      };

      conversa.mensagens.push(mensagemAgente);
      
      // Decrementar créditos do usuário (se não for admin ou não tiver créditos ilimitados)
      if (req.user.role !== 'admin' && !req.user.creditos_ilimitados) {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { creditos_disponiveis: -1 },
        });
      }

      await conversa.save();

      // Converter _id para id para compatibilidade com o frontend
      const conversaResponse = conversa.toObject();
      conversaResponse.id = conversaResponse._id.toString();

      res.status(201).json(conversaResponse);
    } catch (error) {
      console.error('Erro ao obter resposta da OpenAI:', error.response?.data || error.message);
      
      // Adicionar mensagem de erro como resposta do agente
      const mensagemErro = {
        conteudo: 'Desculpe, não foi possível processar sua solicitação no momento. Por favor, tente novamente mais tarde.',
        remetente: 'agente',
      };

      conversa.mensagens.push(mensagemErro);
      await conversa.save();

      // Converter _id para id para compatibilidade com o frontend
      const conversaResponse = conversa.toObject();
      conversaResponse.id = conversaResponse._id.toString();

      res.status(201).json(conversaResponse);
    }
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    res.status(500).json({ message: 'Erro ao adicionar mensagem' });
  }
};

// @desc    Atualizar status da conversa
// @route   PUT /api/conversas/:id/status
// @access  Privado
export const atualizarStatusConversa = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['ativa', 'encerrada', 'arquivada'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const conversa = await Conversa.findById(id);

    if (!conversa) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    // Remover verificação de proprietário - qualquer usuário autenticado pode atualizar o status

    conversa.status = status;
    await conversa.save();

    res.json({ message: 'Status da conversa atualizado', conversa });
  } catch (error) {
    console.error('Erro ao atualizar status da conversa:', error);
    res.status(500).json({ message: 'Erro ao atualizar status da conversa' });
  }
};

// @desc    Atualizar título da conversa
// @route   PUT /api/conversas/:id/titulo
// @access  Privado
export const atualizarTituloConversa = async (req, res) => {
  try {
    const { titulo } = req.body;
    const { id } = req.params;

    if (!titulo) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }

    const conversa = await Conversa.findById(id);

    if (!conversa) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    // Remover verificação de proprietário - qualquer usuário autenticado pode atualizar o título

    conversa.titulo = titulo;
    await conversa.save();

    res.json({ message: 'Título da conversa atualizado', conversa });
  } catch (error) {
    console.error('Erro ao atualizar título da conversa:', error);
    res.status(500).json({ message: 'Erro ao atualizar título da conversa' });
  }
};

// @desc    Excluir uma conversa
// @route   DELETE /api/conversas/:id
// @access  Privado
export const excluirConversa = async (req, res) => {
  try {
    const conversa = await Conversa.findById(req.params.id);

    if (!conversa) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    // Remover verificação de proprietário - qualquer usuário autenticado pode excluir uma conversa

    await conversa.deleteOne();

    res.json({ message: 'Conversa removida' });
  } catch (error) {
    console.error('Erro ao excluir conversa:', error);
    res.status(500).json({ message: 'Erro ao excluir conversa' });
  }
};

// @desc    Atualizar uma conversa completa
// @route   PUT /api/conversas/:id
// @access  Privado
export const atualizarConversa = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, mensagens, status } = req.body;

    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'ID de conversa inválido' });
    }

    const conversa = await Conversa.findById(id);

    if (!conversa) {
      return res.status(404).json({ message: 'Conversa não encontrada' });
    }

    // Remover verificação de proprietário - qualquer usuário autenticado pode atualizar uma conversa

    // Atualizar campos permitidos
    if (titulo) conversa.titulo = titulo;
    if (status) conversa.status = status;
    
    // Processar mensagens para garantir que tenham o campo 'remetente'
    if (mensagens) {
      // Mapear as mensagens do formato do frontend para o formato do banco de dados
      const mensagensProcessadas = mensagens.map(msg => {
        // Se já tem o campo remetente, mantê-lo
        if (msg.remetente) {
          return msg;
        }
        
        // Se não tem remetente mas tem tipo, usar o tipo como remetente
        if (msg.tipo) {
          return {
            ...msg,
            remetente: msg.tipo // Mapear 'tipo' para 'remetente'
          };
        }
        
        // Caso não tenha nem remetente nem tipo, assumir como sistema
        return {
          ...msg,
          remetente: 'sistema'
        };
      });
      
      conversa.mensagens = mensagensProcessadas;
    }

    // Atualizar data de modificação
    conversa.updatedAt = Date.now();

    await conversa.save();

    // Converter _id para id para compatibilidade com o frontend
    const conversaResponse = conversa.toObject();
    conversaResponse.id = conversaResponse._id.toString();

    res.json(conversaResponse);
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    res.status(500).json({ message: 'Erro ao atualizar conversa' });
  }
}; 