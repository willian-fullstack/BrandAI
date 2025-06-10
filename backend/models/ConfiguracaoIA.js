import mongoose from 'mongoose';

const configuracaoIASchema = mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      unique: true,
    },
    descricao: {
      type: String,
      required: true,
    },
    provedor: {
      type: String,
      enum: ['openai', 'anthropic', 'google', 'cohere', 'mistral', 'outro'],
      required: true,
    },
    modelos_disponiveis: [
      {
        nome: {
          type: String,
          required: true,
        },
        codigo: {
          type: String,
          required: true,
        },
        tipo: {
          type: String,
          enum: ['texto', 'imagem', 'audio', 'multimodal'],
          default: 'texto',
        },
        contexto_maximo: {
          type: Number,
          default: 4096,
        },
        custo_input: {
          type: Number,
          default: 0,
        },
        custo_output: {
          type: Number,
          default: 0,
        },
        ativo: {
          type: Boolean,
          default: true,
        },
        planos_permitidos: {
          type: [String],
          enum: ['free', 'basic', 'pro', 'enterprise'],
          default: ['enterprise'],
        },
      },
    ],
    chave_api: {
      type: String,
      required: true,
    },
    url_base: {
      type: String,
      default: '',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    configuracoes_padrao: {
      temperatura: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 1,
      },
      top_p: {
        type: Number,
        default: 1,
        min: 0,
        max: 1,
      },
      max_tokens: {
        type: Number,
        default: 1000,
      },
      presence_penalty: {
        type: Number,
        default: 0,
        min: -2,
        max: 2,
      },
      frequency_penalty: {
        type: Number,
        default: 0,
        min: -2,
        max: 2,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
configuracaoIASchema.index({ provedor: 1 });
configuracaoIASchema.index({ ativo: 1 });

const ConfiguracaoIA = mongoose.model('ConfiguracaoIA', configuracaoIASchema);

export default ConfiguracaoIA; 