import mongoose from 'mongoose';

const indicacaoSchema = mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
    },
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email_indicado: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'aceita', 'expirada'],
      default: 'pendente',
    },
    data_expiracao: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir da criação
    },
    data_aceite: {
      type: Date,
      default: null,
    },
    usuario_indicado_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recompensa_indicador: {
      tipo: {
        type: String,
        enum: ['creditos', 'dias_premium', 'tokens'],
        default: 'creditos',
      },
      valor: {
        type: Number,
        default: 0,
      },
      aplicada: {
        type: Boolean,
        default: false,
      },
    },
    recompensa_indicado: {
      tipo: {
        type: String,
        enum: ['creditos', 'dias_premium', 'tokens'],
        default: 'creditos',
      },
      valor: {
        type: Number,
        default: 0,
      },
      aplicada: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices para melhorar a performance das consultas
indicacaoSchema.index({ usuario_id: 1 });
indicacaoSchema.index({ codigo: 1 });
indicacaoSchema.index({ status: 1 });

const Indicacao = mongoose.model('Indicacao', indicacaoSchema);

export default Indicacao; 