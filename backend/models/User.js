import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    },
    password: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Método para comparar senha
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware para criptografar senha antes de salvar
userSchema.pre('save', async function (next) {
  // Só criptografa se a senha foi modificada (ou é nova)
  if (!this.isModified('password')) {
    return next();
  }

  // Gerar salt
  const salt = await bcrypt.genSalt(10);
  // Criptografar senha
  this.password = await bcrypt.hash(this.password, salt);

  // Gerar código de indicação se não existir
  if (!this.codigo_indicacao) {
    this.codigo_indicacao = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Definir creditos_ilimitados como true para administradores
  if (this.role === 'admin') {
    this.creditos_ilimitados = true;
  }

  next();
});

const User = mongoose.model('User', userSchema);

export default User; 