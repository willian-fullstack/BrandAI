// Definindo o objeto agentesConfig
export const agentesConfig = {
  marketing_midias_sociais: {
    nome: "Marketing & Mídias Sociais",
    descricao: "Estratégias para Instagram, TikTok e outras redes sociais. Criação de conteúdo viral, campanhas de engajamento e crescimento orgânico.",
    icon: "📱",
    cor: "from-pink-500 to-rose-600",
    especialidades: ["Instagram Stories", "TikTok Viral", "Reels", "Influenciadores"],
    prompt: "Você é um especialista em marketing digital e mídias sociais para marcas de roupa. Baseado em experiências de marcas consolidadas, ajude com estratégias para Instagram, TikTok, criação de conteúdo viral, campanhas de engajamento e crescimento orgânico."
  },
  ecommerce_estrategico: {
    nome: "E-commerce Estratégico", 
    descricao: "Otimização de vendas online e conversão. Funis de venda, checkout otimizado e estratégias de upsell.",
    icon: "🛒",
    cor: "from-blue-500 to-cyan-600",
    especialidades: ["Conversão", "Funis", "Checkout", "Analytics"],
    prompt: "Você é um especialista em e-commerce estratégico para marcas de roupa. Ajude com otimização de vendas online, conversão, funis de venda, checkout otimizado e estratégias de upsell baseadas em casos de sucesso."
  },
  criacao_colecao: {
    nome: "Criação de Coleção",
    descricao: "Desenvolvimento de produtos e tendências. Pesquisa de mercado, design de produtos e lançamentos estratégicos.",
    icon: "✨",
    cor: "from-purple-500 to-indigo-600",
    especialidades: ["Tendências", "Design", "Lançamentos", "Pesquisa"],
    prompt: "Você é um especialista em desenvolvimento de produtos e criação de coleções para marcas de roupa. Ajude com pesquisa de tendências, design de produtos, lançamentos estratégicos e desenvolvimento de linhas."
  },
  fornecedores: {
    nome: "Fornecedores",
    descricao: "Encontrar e negociar com fornecedores ideais. Qualidade, preços competitivos e parcerias estratégicas.",
    icon: "🏭",
    cor: "from-green-500 to-emerald-600",
    especialidades: ["Negociação", "Qualidade", "Custos", "Parcerias"],
    prompt: "Você é um especialista em sourcing e relacionamento com fornecedores para marcas de roupa. Ajude a encontrar fornecedores ideais, negociar preços, garantir qualidade e estabelecer parcerias estratégicas."
  },
  trafego_pago: {
    nome: "Tráfego Pago",
    descricao: "Facebook Ads, Google Ads e campanhas pagas. ROI otimizado, segmentação precisa e escalabilidade.",
    icon: "🎯",
    cor: "from-orange-500 to-red-600",
    especialidades: ["Facebook Ads", "Google Ads", "ROI", "Segmentação"],
    prompt: "Você é um especialista em tráfego pago para marcas de roupa. Ajude com Facebook Ads, Google Ads, campanhas pagas, ROI otimizado, segmentação precisa e escalabilidade de campanhas."
  },
  gestao_financeira: {
    nome: "Gestão Financeira",
    descricao: "Controle de custos e planejamento financeiro. Fluxo de caixa, investimentos e análise de rentabilidade.",
    icon: "💰",
    cor: "from-yellow-500 to-orange-600",
    especialidades: ["Fluxo de Caixa", "Custos", "Rentabilidade", "Investimentos"],
    prompt: "Você é um especialista em gestão financeira para marcas de roupa. Ajude com controle de custos, planejamento financeiro, fluxo de caixa, investimentos e análise de rentabilidade."
  },
  construcao_comunidade: {
    nome: "Construção de Comunidade",
    descricao: "Engajamento e fidelização de clientes. Community building, programas de fidelidade e relacionamento.",
    icon: "👥",
    cor: "from-teal-500 to-cyan-600",
    especialidades: ["Fidelização", "Engajamento", "Comunidade", "Relacionamento"],
    prompt: "Você é um especialista em community building para marcas de roupa. Ajude com engajamento, fidelização de clientes, programas de fidelidade e estratégias de relacionamento."
  },
  networking_relacoes: {
    nome: "Networking & Relações",
    descricao: "Parcerias estratégicas e colaborações. Networking efetivo, parcerias comerciais e colaborações.",
    icon: "🤝",
    cor: "from-indigo-500 to-purple-600",
    especialidades: ["Parcerias", "Networking", "Colaborações", "B2B"],
    prompt: "Você é um especialista em networking e relações estratégicas para marcas de roupa. Ajude com parcerias estratégicas, colaborações, networking efetivo e desenvolvimento de relacionamentos comerciais."
  },
  branding_posicionamento: {
    nome: "Branding & Posicionamento",
    descricao: "Identidade visual e posicionamento de marca. Brand strategy, identidade visual e diferenciação.",
    icon: "🎨",
    cor: "from-violet-500 to-purple-600",
    especialidades: ["Brand Strategy", "Identidade Visual", "Posicionamento", "Diferenciação"],
    prompt: "Você é um especialista em branding e posicionamento para marcas de roupa. Ajude com brand strategy, identidade visual, posicionamento de mercado e diferenciação da marca."
  },
  experiencia_unboxing: {
    nome: "Experiência de Unboxing",
    descricao: "Embalagens e experiência do cliente. Design de embalagens, unboxing memorable e experiência premium.",
    icon: "📦",
    cor: "from-amber-500 to-yellow-600",
    especialidades: ["Embalagens", "Unboxing", "Experiência", "Premium"],
    prompt: "Você é um especialista em experiência do cliente e unboxing para marcas de roupa. Ajude com design de embalagens, experiência memorable de unboxing e criação de momentos premium."
  },
  designer: {
    nome: "Designer IA",
    descricao: "Geração de imagens e designs personalizados. Criação de logotipos, artes para redes sociais e materiais visuais.",
    icon: "🎨",
    cor: "from-rose-500 to-pink-600",
    especialidades: ["Logotipos", "Redes Sociais", "Banners", "Identidade Visual"],
    prompt: "Você é um designer especializado em criar imagens e designs para marcas de roupa. Você gera imagens usando IA com base nas instruções dos usuários, criando logotipos, artes para redes sociais, banners e materiais visuais personalizados."
  }
};

// Configuração dos planos
export const planosConfig = {
  basico: {
    agentes: ['marketing_midias_sociais', 'ecommerce_estrategico', 'criacao_colecao', 'fornecedores'],
    creditos: 10
  },
  intermediario: {
    agentes: ['marketing_midias_sociais', 'ecommerce_estrategico', 'criacao_colecao', 'fornecedores', 'trafego_pago', 'gestao_financeira', 'construcao_comunidade'],
    creditos: 30
  },
  premium: {
    agentes: Object.keys(agentesConfig),
    creditos: 100
  },
  admin: {
    agentes: Object.keys(agentesConfig),
    creditos: Infinity
  }
}; 