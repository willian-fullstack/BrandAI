import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ['slack', 'discord', 'telegram', 'whatsapp', 'email', 'sms', 'outro'],
      required: true,
    },
    configuracao: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    ultima_sincronizacao: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pendente', 'conectado', 'erro', 'desconectado'],
      default: 'pendente',
    },
    mensagem_status: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Método para verificar se a integração está ativa
integrationSchema.methods.isAtiva = function() {
  return this.ativo && this.status === 'conectado';
};

// Método para atualizar status
integrationSchema.methods.atualizarStatus = async function(status, mensagem = '') {
  this.status = status;
  this.mensagem_status = mensagem;
  
  if (status === 'conectado') {
    this.ultima_sincronizacao = new Date();
  }
  
  return this.save();
};

const Integration = mongoose.model('Integration', integrationSchema);

export default Integration; 