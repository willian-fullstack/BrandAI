import mongoose from 'mongoose';

const configuracaoPlanosSchema = mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      enum: ['free', 'basic', 'pro', 'enterprise', 'config-principal'],
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
    // Novos campos para preços específicos de cada plano
    plano_basico_preco_mensal: {
      type: Number,
      default: 67,
    },
    plano_basico_preco_anual: {
      type: Number,
      default: 597,
    },
    plano_intermediario_preco_mensal: {
      type: Number,
      default: 97,
    },
    plano_intermediario_preco_anual: {
      type: Number,
      default: 897,
    },
    plano_premium_preco_mensal: {
      type: Number,
      default: 197,
    },
    plano_premium_preco_anual: {
      type: Number,
      default: 1997,
    },
    // Campos adicionais
    descontoAfiliados: {
      type: Number,
      default: 10,
    },
    periodoPadrao: {
      type: String,
      default: 'mensal',
      enum: ['mensal', 'anual'],
    },
    diasTesteGratis: {
      type: Number,
      default: 7,
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