import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do esquema para ConfiguracaoPlanos
const configuracaoPlanosSchema = mongoose.Schema(
  {
    codigo: String,
    nome: String,
    descricao: String,
    preco_mensal: Number,
    preco_anual: Number,
    plano_basico_preco_mensal: Number,
    plano_basico_preco_anual: Number,
    plano_intermediario_preco_mensal: Number,
    plano_intermediario_preco_anual: Number,
    plano_premium_preco_mensal: Number,
    plano_premium_preco_anual: Number,
    plano_basico_preco_original_mensal: Number,
    plano_basico_preco_original_anual: Number,
    plano_intermediario_preco_original_mensal: Number,
    plano_intermediario_preco_original_anual: Number,
    plano_premium_preco_original_mensal: Number,
    plano_premium_preco_original_anual: Number,
    oferta_ativa: Boolean,
    oferta_titulo: String,
    oferta_descricao: String,
    oferta_data_inicio: Date,
    oferta_data_fim: Date,
    cupons: Array,
    descontoAfiliados: Number,
    periodoPadrao: String,
    ativo: Boolean
  },
  {
    timestamps: true,
  }
);

// Função principal
async function atualizarPrecosOriginais() {
  try {
    // Conectar ao MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/brand-lab-ia';
    console.log(`Conectando ao MongoDB: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    console.log('Conectado ao MongoDB com sucesso!');
    
    // Criar modelo
    const ConfiguracaoPlanos = mongoose.model('ConfiguracaoPlanos', configuracaoPlanosSchema);
    
    // Buscar todas as configurações
    const configs = await ConfiguracaoPlanos.find();
    console.log(`\nEncontradas ${configs.length} configurações de planos.`);
    
    if (configs.length === 0) {
      console.log('Nenhuma configuração encontrada. Nada a atualizar.');
      return;
    }
    
    // Atualizar a primeira configuração encontrada
    const config = configs[0];
    console.log(`\nAtualizando configuração: ${config._id}`);
    console.log(`Nome: ${config.nome}`);
    
    // Definir preços originais com valores maiores que os preços atuais
    // para que os preços riscados apareçam corretamente
    const atualizacao = {
      plano_basico_preco_original_mensal: config.plano_basico_preco_mensal * 1.2, // 20% maior
      plano_basico_preco_original_anual: config.plano_basico_preco_anual * 1.2,
      plano_intermediario_preco_original_mensal: config.plano_intermediario_preco_mensal * 1.2,
      plano_intermediario_preco_original_anual: config.plano_intermediario_preco_anual * 1.2,
      plano_premium_preco_original_mensal: config.plano_premium_preco_mensal * 1.2,
      plano_premium_preco_original_anual: config.plano_premium_preco_anual * 1.2,
      oferta_ativa: true,
      oferta_titulo: 'Promoção Especial',
      oferta_descricao: 'Preços promocionais por tempo limitado!'
    };
    
    // Mostrar valores que serão atualizados
    console.log('\nValores atuais:');
    console.log(`- Plano Básico Mensal: ${config.plano_basico_preco_mensal}`);
    console.log(`- Plano Básico Anual: ${config.plano_basico_preco_anual}`);
    console.log(`- Plano Intermediário Mensal: ${config.plano_intermediario_preco_mensal}`);
    console.log(`- Plano Intermediário Anual: ${config.plano_intermediario_preco_anual}`);
    console.log(`- Plano Premium Mensal: ${config.plano_premium_preco_mensal}`);
    console.log(`- Plano Premium Anual: ${config.plano_premium_preco_anual}`);
    
    console.log('\nNovos preços originais (para exibição riscada):');
    console.log(`- Plano Básico Mensal Original: ${atualizacao.plano_basico_preco_original_mensal}`);
    console.log(`- Plano Básico Anual Original: ${atualizacao.plano_basico_preco_original_anual}`);
    console.log(`- Plano Intermediário Mensal Original: ${atualizacao.plano_intermediario_preco_original_mensal}`);
    console.log(`- Plano Intermediário Anual Original: ${atualizacao.plano_intermediario_preco_original_anual}`);
    console.log(`- Plano Premium Mensal Original: ${atualizacao.plano_premium_preco_original_mensal}`);
    console.log(`- Plano Premium Anual Original: ${atualizacao.plano_premium_preco_original_anual}`);
    
    // Atualizar a configuração
    await ConfiguracaoPlanos.findByIdAndUpdate(config._id, atualizacao);
    console.log('\nConfiguração atualizada com sucesso!');
    
    // Buscar a configuração atualizada para confirmar
    const configAtualizada = await ConfiguracaoPlanos.findById(config._id);
    console.log('\nConfiguração após atualização:');
    console.log(`- Oferta ativa: ${configAtualizada.oferta_ativa ? 'Sim' : 'Não'}`);
    console.log(`- Título da oferta: ${configAtualizada.oferta_titulo}`);
    console.log(`- Plano Básico Mensal Original: ${configAtualizada.plano_basico_preco_original_mensal}`);
    console.log(`- Plano Básico Anual Original: ${configAtualizada.plano_basico_preco_original_anual}`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB.');
  }
}

// Executar função principal
atualizarPrecosOriginais(); 