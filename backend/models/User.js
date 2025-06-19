import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Função para validar a força da senha
const validatePasswordStrength = (password) => {
  // Verificar comprimento mínimo
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'A senha deve ter pelo menos 8 caracteres'
    };
  }
  
  // Verificar se contém pelo menos um número
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um número'
    };
  }
  
  // Verificar se contém pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra maiúscula'
    };
  }
  
  // Verificar se contém pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos uma letra minúscula'
    };
  }
  
  // Verificar se contém pelo menos um caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)'
    };
  }
  
  return {
    isValid: true
  };
};

const userSchema = mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: props => `${props.value} não é um email válido!`
      }
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'A senha deve ter pelo menos 8 caracteres'],
      validate: {
        validator: function(v) {
          // Não validar senhas já criptografadas (ao buscar do banco)
          if (this.isModified('password') || this.isNew) {
            const validation = validatePasswordStrength(v);
            return validation.isValid;
          }
          return true;
        },
        message: function(props) {
          if (this.isModified('password') || this.isNew) {
            const validation = validatePasswordStrength(props.value);
            return validation.message;
          }
          return 'Senha inválida';
        }
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    plano: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise', 'basico', 'intermediario', 'premium'],
      default: 'free',
    },
    data_expiracao_plano: {
      type: Date,
      default: null,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    ultimo_login: {
      type: Date,
      default: null,
    },
    conversas_totais: {
      type: Number,
      default: 0,
    },
    tokens_usados: {
      type: Number,
      default: 0,
    },
    limite_conversas: {
      type: Number,
      default: 0, // 0 = ilimitado
    },
    limite_tokens: {
      type: Number,
      default: 0, // 0 = ilimitado
    },
    codigo_indicacao: {
      type: String,
      unique: true,
      sparse: true,
    },
    indicado_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reset_token: {
      type: String,
      default: null,
    },
    reset_token_expiracao: {
      type: Date,
      default: null,
    },
    refresh_tokens: [{
      token: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      userAgent: {
        type: String,
        default: '',
      },
      ip: {
        type: String,
        default: '',
      }
    }],
    revoked_tokens: [{
      token: {
        type: String,
        required: true,
      },
      revokedAt: {
        type: Date,
        default: Date.now,
      },
      reason: {
        type: String,
        default: 'user_logout',
      }
    }],
    configuracoes: {
      tema: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notificacoes: {
        type: Boolean,
        default: true,
      },
      idioma: {
        type: String,
        default: 'pt-BR',
      },
    },
    creditos_disponiveis: {
      type: Number,
      default: 0,
    },
    creditos_ilimitados: {
      type: Boolean,
      default: false,
    },
    data_ultimo_pagamento: {
      type: Date,
    },
    data_proxima_cobranca: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'pendente'],
      default: 'ativo',
    },
    agentes_liberados: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'AgenteConfig',
      default: [],
    },
    password_changed_at: {
      type: Date,
      default: Date.now,
    },
    login_attempts: {
      count: {
        type: Number,
        default: 0
      },
      last_attempt: {
        type: Date
      },
      locked_until: {
        type: Date
      }
    }
  },
  {
    timestamps: true,
  }
);

// Método para comparar senha
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para adicionar um refresh token
userSchema.methods.addRefreshToken = function(refreshToken, userAgent = '', ip = '') {
  // Limpar tokens expirados antes de adicionar um novo
  this.refresh_tokens = this.refresh_tokens.filter(
    token => token.expiresAt > new Date()
  );
  
  // Limitar o número de refresh tokens por usuário (ex: máximo 5 dispositivos)
  if (this.refresh_tokens.length >= 5) {
    // Remover o token mais antigo
    this.refresh_tokens.sort((a, b) => a.createdAt - b.createdAt);
    this.refresh_tokens.shift();
  }
  
  // Adicionar o novo token
  this.refresh_tokens.push({
    token: refreshToken.token,
    expiresAt: refreshToken.expiresAt,
    userAgent,
    ip
  });
  
  return this.save();
};

// Método para revogar um refresh token
userSchema.methods.revokeRefreshToken = function(token, reason = 'user_logout') {
  // Remover o token da lista de tokens ativos
  this.refresh_tokens = this.refresh_tokens.filter(
    t => t.token !== token
  );
  
  // Adicionar à lista de tokens revogados
  this.revoked_tokens.push({
    token,
    revokedAt: new Date(),
    reason
  });
  
  return this.save();
};

// Método para registrar tentativa de login falha
userSchema.methods.registerFailedLogin = async function() {
  // Incrementar contador de tentativas
  this.login_attempts.count += 1;
  this.login_attempts.last_attempt = new Date();
  
  // Se exceder 5 tentativas, bloquear por 15 minutos
  if (this.login_attempts.count >= 5) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + 15);
    this.login_attempts.locked_until = lockUntil;
  }
  
  await this.save();
};

// Método para verificar se a conta está bloqueada
userSchema.methods.isAccountLocked = function() {
  if (this.login_attempts.locked_until && new Date() < this.login_attempts.locked_until) {
    return true;
  }
  return false;
};

// Método para resetar contador de tentativas de login
userSchema.methods.resetLoginAttempts = async function() {
  this.login_attempts.count = 0;
  this.login_attempts.locked_until = null;
  await this.save();
};

// Middleware para criptografar senha antes de salvar
userSchema.pre('save', async function (next) {
  // Só criptografa se a senha foi modificada (ou é nova)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Gerar salt
    const salt = await bcrypt.genSalt(10);
    // Criptografar senha
    this.password = await bcrypt.hash(this.password, salt);
    
    // Atualizar data de alteração da senha
    this.password_changed_at = Date.now();
  
    // Gerar código de indicação se não existir
    if (!this.codigo_indicacao) {
      this.codigo_indicacao = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  
    // Definir creditos_ilimitados como true para administradores
    if (this.role === 'admin') {
      this.creditos_ilimitados = true;
    }
  
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User; 