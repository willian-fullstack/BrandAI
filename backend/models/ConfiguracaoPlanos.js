import mongoose from 'mongoose';

const configuracaoPlanosSchema = mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      enum: ['free', 'basic', 'pro', 'enterprise'],
    },
    nome: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
      required: true,
    },
    preco_mensal: {
      type: Number,
      required: true,
    },
    preco_anual: {
      type: Number,
      required: true,
    },
    moeda: {
      type: String,
      default: 'BRL',
    },
    recursos: [
      {
        nome: {
          type: String,
          required: true,
        },
        descricao: {
          type: String,
          required: true,
        },
        destaque: {
          type: Boolean,
          default: false,
        },
      },
    ],
    limites: {
      conversas_por_mes: {
        type: Number,
        default: 0, // 0 = ilimitado
      },
      tokens_por_mes: {
        type: Number,
        default: 0, // 0 = ilimitado
      },
      max_tokens_por_resposta: {
        type: Number,
        default: 1000,
      },
      modelos_disponiveis: {
        type: [String],
        default: ['gpt-3.5-turbo'],
      },
      ferramentas_disponiveis: {
        type: [String],
        default: [],
      },
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    ordem_exibicao: {
      type: Number,
      default: 0,
    },
    cor: {
      type: String,
      default: '#3B82F6', // Azul
    },
    destaque: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
configuracaoPlanosSchema.index({ nome: 1 });
configuracaoPlanosSchema.index({ ativo: 1, ordem_exibicao: 1 });

const ConfiguracaoPlanos = mongoose.model('ConfiguracaoPlanos', configuracaoPlanosSchema);

export default ConfiguracaoPlanos; 