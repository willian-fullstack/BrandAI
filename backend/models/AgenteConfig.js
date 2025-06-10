import mongoose from 'mongoose';

const documentoTreinamentoSchema = mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  caminho: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    required: true,
  },
  tamanho: {
    type: Number,
    required: true,
  },
  data_upload: {
    type: Date,
    default: Date.now,
  },
});

const agenteConfigSchema = mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nome: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'robot',
    },
    cor: {
      type: String,
      default: '#3B82F6', // Azul
    },
    especialidades: {
      type: [String],
      default: [],
    },
    instrucoes_sistema: {
      type: String,
      required: true,
    },
    exemplos_uso: {
      type: [String],
      default: [],
    },
    modelo_ia: {
      type: String,
      required: true,
      default: 'gpt-3.5-turbo',
    },
    temperatura: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    max_tokens: {
      type: Number,
      default: 1000,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    disponivel_em: {
      type: [String],
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: ['enterprise'],
    },
    documentos_treinamento: {
      type: [documentoTreinamentoSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
agenteConfigSchema.index({ codigo: 1 });
agenteConfigSchema.index({ disponivel_em: 1 });

const AgenteConfig = mongoose.model('AgenteConfig', agenteConfigSchema);

export default AgenteConfig; 