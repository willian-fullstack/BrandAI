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
async function verificarConfigPlanos() {
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
    console.log(`\nEncontradas ${configs.length} configurações de planos:`);
    console.log(JSON.stringify(configs, null, 2));
    
    // Verificar especificamente ofertas e cupons
    for (const config of configs) {
      console.log(`\n\nDetalhes da configuração ${config._id}:`);
      console.log(`Nome: ${config.nome}`);
      console.log(`Oferta ativa: ${config.oferta_ativa ? 'Sim' : 'Não'}`);
      console.log(`Título da oferta: ${config.oferta_titulo || 'Não definido'}`);
      
      // Verificar cupons
      if (Array.isArray(config.cupons) && config.cupons.length > 0) {
        console.log(`\nCupons (${config.cupons.length}):`);
        config.cupons.forEach((cupom, index) => {
          console.log(`\nCupom #${index + 1}:`);
          console.log(`  Código: ${cupom.codigo || 'Não definido'}`);
          console.log(`  Descrição: ${cupom.descricao || 'Não definido'}`);
          console.log(`  Tipo: ${cupom.tipo || 'Não definido'}`);
          console.log(`  Valor: ${cupom.valor || 0}`);
          console.log(`  Ativo: ${cupom.ativo ? 'Sim' : 'Não'}`);
        });
      } else {
        console.log('\nNenhum cupom encontrado.');
      }
    }
    
    // Se não houver configurações, criar uma nova
    if (configs.length === 0) {
      console.log('\nNenhuma configuração encontrada. Criando configuração padrão...');
      
      const novaConfig = new ConfiguracaoPlanos({
        codigo: 'config-principal',
        nome: 'Configuração Principal',
        descricao: 'Configuração principal de planos do sistema',
        preco_mensal: 67,
        preco_anual: 597,
        plano_basico_preco_mensal: 67,
        plano_basico_preco_anual: 597,
        plano_intermediario_preco_mensal: 97,
        plano_intermediario_preco_anual: 897,
        plano_premium_preco_mensal: 197,
        plano_premium_preco_anual: 1997,
        oferta_ativa: true,
        oferta_titulo: 'Promoção de Lançamento',
        oferta_descricao: 'Aproveite preços especiais por tempo limitado!',
        cupons: [
          {
            codigo: 'LANCAMENTO10',
            descricao: 'Cupom de lançamento - 10% de desconto',
            tipo: 'percentual',
            valor: 10,
            data_inicio: new Date(),
            data_expiracao: null,
            limite_usos: 100,
            usos_atuais: 0,
            planos_aplicaveis: ['basico', 'intermediario', 'premium'],
            ativo: true
          }
        ],
        descontoAfiliados: 10,
        periodoPadrao: 'mensal',
        ativo: true
      });
      
      await novaConfig.save();
      console.log('Configuração padrão criada com sucesso!');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('\nDesconectado do MongoDB.');
  }
}

// Executar função principal
verificarConfigPlanos(); 