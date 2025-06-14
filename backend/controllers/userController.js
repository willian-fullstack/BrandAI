import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Autenticar usuário e gerar token
// @route   POST /api/users/login
// @access  Público
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o email foi fornecido
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    // Verificar se a senha foi fornecida
    if (!password) {
      return res.status(400).json({ message: 'Senha é obrigatória' });
    }

    console.log(`Tentativa de login: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Login falhou - usuário não encontrado: ${email}`);
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      // Atualizar último login
      user.ultimo_login = Date.now();
      await user.save();

      console.log(`Login bem-sucedido: ${email}`);
      res.json({
        _id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        plano: user.plano,
        plano_atual: user.plano,
        avatar: user.avatar,
        status: user.status,
        creditos_restantes: user.creditos_disponiveis,
        creditos_ilimitados: user.creditos_ilimitados,
        agentes_liberados: user.agentes_liberados,
        token: generateToken(user._id),
      });
    } else {
      console.log(`Login falhou - senha incorreta: ${email}`);
      res.status(401).json({ message: 'Email ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao autenticar usuário',
      errorDetails: error.message
    });
  }
};

// @desc    Registrar um novo usuário
// @route   POST /api/users
// @access  Público
export const registerUser = async (req, res) => {
  try {
    const { nome, email, password, codigo_indicacao } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`Tentativa de registro com email já existente: ${email}`);
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      password, // O modelo irá criptografar a senha
      codigo_indicacao,
    });

    if (user) {
      console.log(`Novo usuário registrado com sucesso: ${email}`);
      res.status(201).json({
        _id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        plano: user.plano,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    
    // Verificar se é erro de duplicação do MongoDB (código 11000)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email já está em uso. Tente fazer login ou use outro email.',
        errorCode: 'EMAIL_IN_USE'
      });
    }
    
    // Verificar erro de validação
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        message: messages.join(', '),
        errorCode: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({ 
      message: 'Erro ao registrar usuário',
      errorDetails: error.message
    });
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Privado
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        plano: user.plano,
        plano_atual: user.plano,
        avatar: user.avatar,
        status: user.status,
        creditos_restantes: user.creditos_disponiveis,
        creditos_ilimitados: user.creditos_ilimitados,
        agentes_liberados: user.agentes_liberados,
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao obter perfil do usuário' });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Privado
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.nome = req.body.nome || user.nome;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        nome: updatedUser.nome,
        email: updatedUser.email,
        role: updatedUser.role,
        plano: updatedUser.plano,
        plano_atual: updatedUser.plano,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        creditos_restantes: updatedUser.creditos_disponiveis,
        creditos_ilimitados: updatedUser.creditos_ilimitados,
        agentes_liberados: updatedUser.agentes_liberados,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil do usuário' });
  }
};

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Privado/Admin
export const getUsers = async (req, res) => {
  try {
    const { limit = 20, page = 1, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find({})
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password');

    const total = await User.countDocuments();

    res.json({
      users,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro ao obter usuários' });
  }
};

// @desc    Excluir usuário
// @route   DELETE /api/users/:id
// @access  Privado/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'Usuário removido' });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Privado/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        plano: user.plano,
        plano_atual: user.plano,
        avatar: user.avatar,
        status: user.status,
        creditos_restantes: user.creditos_disponiveis,
        creditos_ilimitados: user.creditos_ilimitados,
        agentes_liberados: user.agentes_liberados,
        ativo: user.ativo,
        limite_conversas: user.limite_conversas,
        limite_tokens: user.limite_tokens
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ message: 'Erro ao obter usuário' });
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Privado/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.nome = req.body.nome || user.nome;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.plano = req.body.plano_atual || user.plano;
      user.ativo = req.body.ativo !== undefined ? req.body.ativo : user.ativo;
      user.limite_conversas = req.body.limite_conversas || user.limite_conversas;
      user.limite_tokens = req.body.limite_tokens || user.limite_tokens;
      
      // Novos campos
      if (req.body.agentes_liberados !== undefined) {
        user.agentes_liberados = req.body.agentes_liberados;
      }
      
      if (req.body.creditos_ilimitados !== undefined) {
        user.creditos_ilimitados = req.body.creditos_ilimitados;
      }
      
      if (req.body.creditos_restantes !== undefined) {
        user.creditos_disponiveis = req.body.creditos_restantes;
      }
      
      if (req.body.status !== undefined) {
        user.status = req.body.status;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        nome: updatedUser.nome,
        email: updatedUser.email,
        role: updatedUser.role,
        plano: updatedUser.plano,
        plano_atual: updatedUser.plano,
        ativo: updatedUser.ativo,
        status: updatedUser.status,
        limite_conversas: updatedUser.limite_conversas,
        limite_tokens: updatedUser.limite_tokens,
        agentes_liberados: updatedUser.agentes_liberados,
        creditos_ilimitados: updatedUser.creditos_ilimitados,
        creditos_restantes: updatedUser.creditos_disponiveis
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

// @desc    Alterar senha do usuário
// @route   PUT /api/users/password
// @access  Privado
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se a senha atual está correta
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
};

// @desc    Solicitar redefinição de senha
// @route   POST /api/users/reset-password
// @access  Público
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Gerar token de redefinição de senha
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiration = Date.now() + 3600000; // 1 hora

    user.reset_token = resetToken;
    user.reset_token_expiracao = resetTokenExpiration;
    await user.save();

    // Em um sistema real, enviar email com o link de redefinição
    // Por enquanto, apenas retornar o token para fins de teste
    res.json({
      message: 'Instruções de redefinição de senha enviadas para o email',
      resetToken, // Remover em produção
    });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ message: 'Erro ao solicitar redefinição de senha' });
  }
};

// @desc    Redefinir senha com token
// @route   POST /api/users/reset-password/:token
// @access  Público
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }

    const user = await User.findOne({
      reset_token: token,
      reset_token_expiracao: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Atualizar senha
    user.password = password;
    user.reset_token = undefined;
    user.reset_token_expiracao = undefined;
    await user.save();

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha' });
  }
}; 