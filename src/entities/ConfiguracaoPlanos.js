export class ConfiguracaoPlanos {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.planos = data.planos || [
      {
        id: 'free',
        nome: 'Gratuito',
        preco: 0,
        descricao: 'Plano gratuito com recursos limitados',
        recursos: ['Acesso a 2 agentes', 'Limite de 10 mensagens por dia'],
        limiteConversas: 10,
        limiteAgentes: 2,
        ativo: true,
        cor: 'from-gray-400 to-gray-600'
      },
      {
        id: 'basic',
        nome: 'Básico',
        preco: 47,
        descricao: 'Plano básico para pequenos negócios',
        recursos: ['Acesso a 5 agentes', 'Mensagens ilimitadas', 'Suporte por email'],
        limiteConversas: 100,
        limiteAgentes: 5,
        ativo: true,
        cor: 'from-blue-400 to-blue-600'
      },
      {
        id: 'pro',
        nome: 'Profissional',
        preco: 97,
        descricao: 'Plano profissional para negócios em crescimento',
        recursos: ['Acesso a todos os agentes', 'Mensagens ilimitadas', 'Suporte prioritário'],
        limiteConversas: 500,
        limiteAgentes: -1, // ilimitado
        ativo: true,
        cor: 'from-purple-400 to-purple-600'
      }
    ];
    this.promocoes = data.promocoes || [];
    this.descontoAfiliados = data.descontoAfiliados || 0;
    this.periodoPadrao = data.periodoPadrao || 'mensal';
    this.diasTesteGratis = data.diasTesteGratis || 7;
  }

  static fromAPI(data) {
    return new ConfiguracaoPlanos(data);
  }
}