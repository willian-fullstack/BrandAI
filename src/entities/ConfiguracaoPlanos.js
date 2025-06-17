export class ConfiguracaoPlanos {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    
    // Preços dos planos
    this.plano_basico_preco_mensal = data.plano_basico_preco_mensal || 67;
    this.plano_basico_preco_anual = data.plano_basico_preco_anual || 597;
    this.plano_intermediario_preco_mensal = data.plano_intermediario_preco_mensal || 97;
    this.plano_intermediario_preco_anual = data.plano_intermediario_preco_anual || 897;
    this.plano_premium_preco_mensal = data.plano_premium_preco_mensal || 197;
    this.plano_premium_preco_anual = data.plano_premium_preco_anual || 1997;
    
    // Preços originais (para ofertas)
    this.plano_basico_preco_original_mensal = data.plano_basico_preco_original_mensal || 0;
    this.plano_basico_preco_original_anual = data.plano_basico_preco_original_anual || 0;
    this.plano_intermediario_preco_original_mensal = data.plano_intermediario_preco_original_mensal || 0;
    this.plano_intermediario_preco_original_anual = data.plano_intermediario_preco_original_anual || 0;
    this.plano_premium_preco_original_mensal = data.plano_premium_preco_original_mensal || 0;
    this.plano_premium_preco_original_anual = data.plano_premium_preco_original_anual || 0;
    
    // Dados de ofertas
    this.oferta_ativa = data.oferta_ativa || false;
    this.oferta_titulo = data.oferta_titulo || '';
    this.oferta_descricao = data.oferta_descricao || '';
    this.oferta_data_inicio = data.oferta_data_inicio || null;
    this.oferta_data_fim = data.oferta_data_fim || null;
    
    // Cupons de desconto
    this.cupons = Array.isArray(data.cupons) ? data.cupons.map(cupom => ({
      codigo: cupom.codigo || '',
      descricao: cupom.descricao || '',
      tipo: cupom.tipo || 'percentual',
      valor: cupom.valor || 0,
      data_inicio: cupom.data_inicio || new Date(),
      data_expiracao: cupom.data_expiracao || null,
      limite_usos: cupom.limite_usos || 0,
      usos_atuais: cupom.usos_atuais || 0,
      planos_aplicaveis: cupom.planos_aplicaveis || ['basico', 'intermediario', 'premium'],
      ativo: cupom.ativo !== undefined ? cupom.ativo : true
    })) : [];
    
    // Dados adicionais
    this.descontoAfiliados = data.descontoAfiliados || 10;
    this.periodoPadrao = data.periodoPadrao || 'mensal';
    this.diasTesteGratis = data.diasTesteGratis || 7;
    
    // Manter compatibilidade com o modelo antigo
    this.planos = data.planos || [
      {
        id: 'basico',
        nome: 'Básico',
        preco: this.plano_basico_preco_mensal,
        preco_anual: this.plano_basico_preco_anual,
        preco_original: this.plano_basico_preco_original_mensal || 0,
        preco_original_anual: this.plano_basico_preco_original_anual || 0,
        descricao: 'Plano básico para pequenos negócios',
        recursos: ['Acesso a 5 agentes', 'Mensagens ilimitadas', 'Suporte por email'],
        limiteConversas: 100,
        limiteAgentes: 5,
        ativo: true,
        cor: 'from-blue-400 to-blue-600'
      },
      {
        id: 'intermediario',
        nome: 'Intermediário',
        preco: this.plano_intermediario_preco_mensal,
        preco_anual: this.plano_intermediario_preco_anual,
        preco_original: this.plano_intermediario_preco_original_mensal || 0,
        preco_original_anual: this.plano_intermediario_preco_original_anual || 0,
        descricao: 'Plano intermediário para negócios em crescimento',
        recursos: ['Acesso a 7 agentes', 'Mensagens ilimitadas', 'Suporte prioritário'],
        limiteConversas: 300,
        limiteAgentes: 7,
        ativo: true,
        cor: 'from-purple-400 to-purple-600'
      },
      {
        id: 'premium',
        nome: 'Premium',
        preco: this.plano_premium_preco_mensal,
        preco_anual: this.plano_premium_preco_anual,
        preco_original: this.plano_premium_preco_original_mensal || 0,
        preco_original_anual: this.plano_premium_preco_original_anual || 0,
        descricao: 'Plano premium para negócios estabelecidos',
        recursos: ['Acesso a todos os agentes', 'Mensagens ilimitadas', 'Suporte VIP'],
        limiteConversas: 1000,
        limiteAgentes: -1, // ilimitado
        ativo: true,
        cor: 'from-yellow-400 to-yellow-600'
      }
    ];
  }

  static fromAPI(data) {
    return new ConfiguracaoPlanos(data);
  }
}