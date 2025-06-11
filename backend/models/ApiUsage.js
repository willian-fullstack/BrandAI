import mongoose from 'mongoose';

const apiUsageSchema = new mongoose.Schema(
  {
    api_name: {
      type: String,
      required: true,
      enum: ['openai', 'dall-e', 'azure', 'google', 'other']
    },
    endpoint: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Pode ser nulo para chamadas do sistema
    },
    tokens_input: {
      type: Number,
      default: 0
    },
    tokens_output: {
      type: Number,
      default: 0
    },
    cost: {
      type: Number,
      default: 0
    },
    success: {
      type: Boolean,
      required: true
    },
    error_message: {
      type: String,
      default: null
    },
    response_time_ms: {
      type: Number,
      default: 0
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Adicionar índices para consultas comuns
apiUsageSchema.index({ api_name: 1, createdAt: 1 });
apiUsageSchema.index({ user_id: 1, createdAt: 1 });

// Método para calcular estatísticas de uso
apiUsageSchema.statics.getUsageStats = async function(
  filterOptions = {},
  startDate = new Date(0),
  endDate = new Date()
) {
  const match = {
    createdAt: { $gte: startDate, $lte: endDate },
    ...filterOptions
  };

  const stats = await this.aggregate([
    { $match: match },
    { $group: {
      _id: '$api_name',
      totalCalls: { $sum: 1 },
      successCount: { $sum: { $cond: ['$success', 1, 0] } },
      failureCount: { $sum: { $cond: ['$success', 0, 1] } },
      totalCost: { $sum: '$cost' },
      totalInputTokens: { $sum: '$tokens_input' },
      totalOutputTokens: { $sum: '$tokens_output' },
      avgResponseTime: { $avg: '$response_time_ms' }
    }},
    { $project: {
      _id: 0,
      api_name: '$_id',
      totalCalls: 1,
      successRate: { $divide: ['$successCount', '$totalCalls'] },
      failureRate: { $divide: ['$failureCount', '$totalCalls'] },
      totalCost: 1,
      totalInputTokens: 1,
      totalOutputTokens: 1,
      avgResponseTime: 1
    }}
  ]);

  return stats;
};

// Método para obter uso por usuário
apiUsageSchema.statics.getUserUsage = async function(
  startDate = new Date(0),
  endDate = new Date()
) {
  const stats = await this.aggregate([
    { $match: { 
      createdAt: { $gte: startDate, $lte: endDate },
      user_id: { $ne: null }
    }},
    { $group: {
      _id: '$user_id',
      totalCalls: { $sum: 1 },
      totalCost: { $sum: '$cost' },
      totalInputTokens: { $sum: '$tokens_input' },
      totalOutputTokens: { $sum: '$tokens_output' }
    }},
    { $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user'
    }},
    { $unwind: '$user' },
    { $project: {
      _id: 0,
      userId: '$_id',
      email: '$user.email',
      name: '$user.name',
      totalCalls: 1,
      totalCost: 1,
      totalInputTokens: 1,
      totalOutputTokens: 1
    }}
  ]);

  return stats;
};

const ApiUsage = mongoose.model('ApiUsage', apiUsageSchema);

export default ApiUsage; 