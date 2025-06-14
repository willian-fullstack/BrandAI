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