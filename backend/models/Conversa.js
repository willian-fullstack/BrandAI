import mongoose from 'mongoose';

const conversaSchema = mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agente_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ativa', 'encerrada', 'arquivada'],
      default: 'ativa',
    },
    mensagens: [
      {
        conteudo: {
          type: String,
          required: true,
        },
        remetente: {
          type: String,
          enum: ['usuario', 'agente', 'sistema'],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        anexos: [
          {
            nome: String,
            tipo: String,
            url: String,
            tamanho: Number,
          },
        ],
        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
    tokens_usados: {
      type: Number,
      default: 0,
    },
    contexto: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
conversaSchema.index({ usuario_id: 1, updatedAt: -1 });
conversaSchema.index({ status: 1 });

const Conversa = mongoose.model('Conversa', conversaSchema);

export default Conversa; 