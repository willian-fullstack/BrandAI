import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Shirt, 
  ShoppingBag, 
  Package, 
  LineChart, 
  Megaphone,
  Code,
  Rocket,
  Briefcase,
  MessageSquare,
  Zap,
  Star,
  Crown,
  TrendingUp,
  Gift,
  Check,
  LogIn
} from "lucide-react";
import Brain3DViewer from '@/components/Brain3DModel';
import { useState, useEffect } from 'react';
import { ConfiguracaoPlanos } from '@/api/entities';
import { Badge } from "@/components/ui/badge";

// Header component
const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md navbar-blur border-b border-[#736ded]/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/img/logo.png" alt="BrandzLAB Logo" className="h-8 w-8 mr-2" />
          <span className="ml-2 text-xl font-bold">
            <span className="text-[#00b6ff]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>Brandz</span>
            <span className="text-[#736ded]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>LAB</span>
          </span>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link to="#product" className="text-gray-300 hover:text-white transition-colors">Produto</Link>
          <Link to="#agentes" className="text-gray-300 hover:text-white transition-colors">Agentes</Link>
          <Link to="#pricing" className="text-gray-300 hover:text-white transition-colors">Planos</Link>
          <Link to="#company" className="text-gray-300 hover:text-white transition-colors">Empresa</Link>
          <Link to="#blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link>
        </div>

        <div className="flex space-x-3">
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors py-2">Login</Link>
          <Button className="bg-[#736ded] hover:bg-[#6058db] text-white rounded-md">
            Começar agora
          </Button>
        </div>
      </div>
    </header>
  );
};

// Hero section
const Hero = () => {
  return (
    <section className="pt-32 pb-24 bg-black text-white relative overflow-hidden flex items-center justify-center" style={{ minHeight: '100vh' }}>
      {/* Background glow effect */}
      <div className="hero-glow"></div>
      
      {/* 3D Brain Model como background */}
      <div className="absolute inset-0 z-0">
        <Brain3DViewer />
      </div>
      
      {/* Overlay escuro para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      
      {/* New feature badge */}
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 bg-black/50 border border-[#736ded]/30 rounded-full px-3 py-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#736ded] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#736ded]"></span>
            </span>
            <p className="text-sm text-gray-200">Novo: 11 Agentes de IA Especializados em Moda</p>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-center leading-tight mb-6 hero-heading">
          IA Especializada para <span className="bg-gradient-to-r from-[#00b6ff] to-[#736ded] bg-clip-text text-transparent">Marcas de Moda</span>
        </h1>
        
        <div className="flex items-center justify-center mb-6">
          <img src="/img/logo.png" alt="BrandzLAB Logo" className="h-16 w-16 mr-3" />
          <h2 className="text-4xl font-bold">
            <span className="text-[#00b6ff]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>Brandz</span>
            <span className="text-[#736ded]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>LAB</span>
          </h2>
        </div>
        
        <p className="text-xl text-gray-300 text-center mb-6 max-w-2xl mx-auto">
          Múltiplos agentes de IA com expertise em marketing, e-commerce, design, fornecedores e muito mais
        </p>
        
        <p className="text-base text-gray-400 text-center mb-10 max-w-3xl mx-auto">
          Marcas usando o BrandzLAB relatam aumento de até 73% nas vendas online e redução de 26% nos custos de produção
        </p>
        
        <div className="flex justify-center">
          <Link to="/login">
            <Button className="bg-[#736ded] hover:bg-[#6058db] text-white text-lg px-8 py-6 rounded-md">
              Começar agora <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Agentes section
const Agentes = () => {
  const agentes = [
    {
      icon: <Shirt className="h-8 w-8 text-pink-500" />,
      title: "Marketing & Mídias Sociais",
      description: "Estratégias para Instagram, TikTok e outras redes sociais. Criação de conteúdo viral, campanhas de engajamento e crescimento orgânico."
    },
    {
      icon: <ShoppingBag className="h-8 w-8 text-[#00b6ff]" />,
      title: "E-commerce Estratégico",
      description: "Otimização de vendas online e conversão. Funis de venda, checkout otimizado e estratégias de upsell."
    },
    {
      icon: <Star className="h-8 w-8 text-[#736ded]" />,
      title: "Criação de Coleção",
      description: "Desenvolvimento de produtos e tendências. Pesquisa de mercado, design de produtos e lançamentos estratégicos."
    },
    {
      icon: <Package className="h-8 w-8 text-green-500" />,
      title: "Fornecedores",
      description: "Encontrar e negociar com fornecedores ideais. Qualidade, preços competitivos e parcerias estratégicas."
    },
    {
      icon: <Megaphone className="h-8 w-8 text-orange-500" />,
      title: "Tráfego Pago",
      description: "Facebook Ads, Google Ads e campanhas pagas. ROI otimizado, segmentação precisa e escalabilidade."
    },
    {
      icon: <LineChart className="h-8 w-8 text-yellow-500" />,
      title: "Gestão Financeira",
      description: "Controle de custos e planejamento financeiro. Fluxo de caixa, investimentos e análise de rentabilidade."
    }
  ];

  return (
    <section id="agentes" className="py-20 bg-black relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Agentes Especializados</h2>
        <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Múltiplos assistentes de IA projetados especificamente para marcas de roupas
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 feature-grid">
          {agentes.map((agente, index) => (
            <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#736ded]/50 transition-colors feature-card">
              <div className="mb-4">{agente.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{agente.title}</h3>
              <p className="text-gray-400">{agente.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features section
const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-[#736ded]" />,
      title: "Chat Intuitivo",
      description: "Interface de chat intuitiva para comunicação com agentes de IA especializados em diferentes aspectos do seu negócio de moda."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Análise de Tendências",
      description: "Acompanhe as últimas tendências de moda e receba insights sobre como adaptar sua marca para se manter à frente da concorrência."
    },
    {
      icon: <Briefcase className="h-8 w-8 text-[#00b6ff]" />,
      title: "Gestão de Projetos",
      description: "Organize suas coleções, campanhas e lançamentos com ferramentas integradas de gestão de projetos para equipes de moda."
    },
    {
      icon: <Code className="h-8 w-8 text-green-500" />,
      title: "Sistema de Créditos",
      description: "Controle de uso com sistema de créditos transparente. Cada plano oferece uma quantidade específica de créditos mensais."
    }
  ];

  return (
    <section className="py-20 bg-gray-900 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Características Principais</h2>
        <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Ferramentas poderosas para impulsionar sua marca de roupas
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="bg-black/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-[#736ded]/50 transition-colors feature-card">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials section
const Testimonials = () => {
  const testimonials = [
    {
      text: "O BrandzLAB transformou minha marca de roupas! Com os agentes de Marketing e E-commerce, conseguimos aumentar nossas vendas online em 73% em apenas 3 meses. A análise de dados e estratégias são incomparáveis.",
      name: "Carolina Silva",
      position: "Fundadora, ModaFit Brasil",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      text: "Os agentes especializados de Fornecedores e Gestão Financeira me ajudaram a reduzir custos de produção em 26% e otimizar nosso fluxo de caixa. Uma ferramenta essencial para qualquer marca de moda.",
      name: "Ricardo Mendes",
      position: "CEO, Urban Clothing Co.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      text: "O agente de Criação de Coleção nos ajudou a desenvolver uma linha que se tornou nosso maior sucesso de vendas. A plataforma se paga em ideias inovadoras e economia de tempo.",
      name: "Mariana Costa",
      position: "Diretora Criativa, Essence Apparel",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    }
  ];

  return (
    <section className="py-20 bg-black text-white relative">
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-[#736ded]/10 blur-[100px] z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4">O que nossos clientes dizem</h2>
        <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Marcas de roupas que já estão colhendo resultados com o BrandzLAB
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-300 mb-4">
                &quot;{testimonial.text}&quot;
              </p>
              
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-[#00b6ff] to-[#736ded]">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing section
const Pricing = () => {
  const navigate = useNavigate();
  const [configPlanos, setConfigPlanos] = useState({
    plano_basico_preco_mensal: 67,
    plano_basico_preco_anual: 597,
    plano_intermediario_preco_mensal: 97,
    plano_intermediario_preco_anual: 897,
    plano_premium_preco_mensal: 197,
    plano_premium_preco_anual: 997,
    plano_anual_ativo: true,
    recursos_planos: {
      basico: [
        '4 Agentes IA Especializados',
        'Marketing & Mídias Sociais',
        'E-commerce Estratégico',
        'Criação de Coleção',
        'Fornecedores',
        '100 Créditos/mês',
        'Suporte por Email'
      ],
      intermediario: [
        '7 Agentes IA Especializados',
        'Todos do plano Básico +',
        'Tráfego Pago',
        'Gestão Financeira', 
        'Construção de Comunidade',
        '250 Créditos/mês',
        'Suporte Prioritário',
        'Webinars Exclusivos'
      ],
      premium: [
        'TODOS os 11 Agentes IA',
        'IA de Geração de Imagens',
        'Networking & Relações',
        'Branding & Posicionamento',
        'Experiência de Unboxing',
        'Créditos ILIMITADOS',
        'Suporte VIP 24/7',
        'Consultoria Mensal 1:1',
        'Acesso Antecipado a Novos Agentes'
      ]
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  
  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const planosDataResults = await ConfiguracaoPlanos.getAll();
        if (planosDataResults && planosDataResults.length > 0) {
          const configData = planosDataResults[0];
          
          // Atualizar o estado com os valores carregados
          setConfigPlanos({
            plano_basico_preco_mensal: configData.plano_basico_preco_mensal || 67,
            plano_basico_preco_anual: configData.plano_basico_preco_anual || 597,
            plano_intermediario_preco_mensal: configData.plano_intermediario_preco_mensal || 97,
            plano_intermediario_preco_anual: configData.plano_intermediario_preco_anual || 897,
            plano_premium_preco_mensal: configData.plano_premium_preco_mensal || 197,
            plano_premium_preco_anual: configData.plano_premium_preco_anual || 997,
            plano_basico_preco_original_mensal: configData.plano_basico_preco_original_mensal || 0,
            plano_basico_preco_original_anual: configData.plano_basico_preco_original_anual || 0,
            plano_intermediario_preco_original_mensal: configData.plano_intermediario_preco_original_mensal || 0,
            plano_intermediario_preco_original_anual: configData.plano_intermediario_preco_original_anual || 0,
            plano_premium_preco_original_mensal: configData.plano_premium_preco_original_mensal || 0,
            plano_premium_preco_original_anual: configData.plano_premium_preco_original_anual || 0,
            oferta_ativa: configData.oferta_ativa || false,
            oferta_titulo: configData.oferta_titulo || '',
            oferta_descricao: configData.oferta_descricao || '',
            plano_anual_ativo: configData.plano_anual_ativo !== false, // Se não existir, assume true
            recursos_planos: configData.recursos_planos || {
              basico: [
                '4 Agentes IA Especializados',
                'Marketing & Mídias Sociais',
                'E-commerce Estratégico',
                'Criação de Coleção',
                'Fornecedores',
                '100 Créditos/mês',
                'Suporte por Email'
              ],
              intermediario: [
                '7 Agentes IA Especializados',
                'Todos do plano Básico +',
                'Tráfego Pago',
                'Gestão Financeira', 
                'Construção de Comunidade',
                '250 Créditos/mês',
                'Suporte Prioritário',
                'Webinars Exclusivos'
              ],
              premium: [
                'TODOS os 11 Agentes IA',
                'IA de Geração de Imagens',
                'Networking & Relações',
                'Branding & Posicionamento',
                'Experiência de Unboxing',
                'Créditos ILIMITADOS',
                'Suporte VIP 24/7',
                'Consultoria Mensal 1:1',
                'Acesso Antecipado a Novos Agentes'
              ]
            }
          });
          
          // Se o plano anual não estiver ativo, forçar a exibição do plano mensal
          if (configData.plano_anual_ativo === false) {
            setSelectedPeriod('mensal');
          }
        }
      } catch (error) {
        console.warn("Usando preços padrão, erro ao carregar configurações de planos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlanos();
  }, []);

  const handleEscolherPlano = () => {
    // Redirecionar para a página de login
    navigate('/login');
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-black text-white relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Carregando planos...</h2>
        </div>
      </section>
    );
  }

  // Definir os planos com base nas configurações
  const planos = [
    {
      id: 'basico',
      nome: 'Básico',
      subtitulo: 'Para quem está começando',
      preco_mensal: configPlanos.plano_basico_preco_mensal || 67,
      preco_anual: configPlanos.plano_basico_preco_anual || 597,
      preco_original: Number(configPlanos.plano_basico_preco_original_mensal) || 0,
      preco_original_anual: Number(configPlanos.plano_basico_preco_original_anual) || 0,
      economia: (configPlanos.plano_basico_preco_mensal * 12) - (configPlanos.plano_basico_preco_anual || 597),
      meses_gratis: ((configPlanos.plano_basico_preco_mensal * 12) - (configPlanos.plano_basico_preco_anual || 597)) / (configPlanos.plano_basico_preco_mensal || 67),
      agentes_inclusos: 4,
      cor: 'from-[#00b6ff] to-[#0096d4]',
      popular: false,
      recursos: configPlanos.recursos_planos?.basico || [
        '4 Agentes IA Especializados',
        'Marketing & Mídias Sociais',
        'E-commerce Estratégico',
        'Criação de Coleção',
        'Fornecedores',
        '100 Créditos/mês',
        'Suporte por Email'
      ]
    },
    {
      id: 'intermediario',
      nome: 'Intermediário',
      subtitulo: 'Mais Vendido 🔥',
      preco_mensal: configPlanos.plano_intermediario_preco_mensal || 97,
      preco_anual: configPlanos.plano_intermediario_preco_anual || 897,
      preco_original: Number(configPlanos.plano_intermediario_preco_original_mensal) || 0,
      preco_original_anual: Number(configPlanos.plano_intermediario_preco_original_anual) || 0,
      economia: (configPlanos.plano_intermediario_preco_mensal * 12) - (configPlanos.plano_intermediario_preco_anual || 897),
      meses_gratis: ((configPlanos.plano_intermediario_preco_mensal * 12) - (configPlanos.plano_intermediario_preco_anual || 897)) / (configPlanos.plano_intermediario_preco_mensal || 97),
      agentes_inclusos: 7,
      cor: 'from-[#736ded] to-[#5a55c9]',
      popular: true,
      recursos: configPlanos.recursos_planos?.intermediario || [
        '7 Agentes IA Especializados',
        'Todos do plano Básico +',
        'Tráfego Pago',
        'Gestão Financeira', 
        'Construção de Comunidade',
        '250 Créditos/mês',
        'Suporte Prioritário',
        'Webinars Exclusivos'
      ]
    },
    {
      id: 'premium',
      nome: 'Avançado',
      subtitulo: 'Para quem leva a sério 🚀',
      preco_mensal: configPlanos.plano_premium_preco_mensal || 197,
      preco_anual: configPlanos.plano_premium_preco_anual || 997,
      preco_original: Number(configPlanos.plano_premium_preco_original_mensal) || 0,
      preco_original_anual: Number(configPlanos.plano_premium_preco_original_anual) || 0,
      economia: (configPlanos.plano_premium_preco_mensal * 12) - (configPlanos.plano_premium_preco_anual || 997),
      meses_gratis: ((configPlanos.plano_premium_preco_mensal * 12) - (configPlanos.plano_premium_preco_anual || 997)) / (configPlanos.plano_premium_preco_mensal || 197),
      agentes_inclusos: 11,
      cor: 'from-yellow-400 to-orange-500',
      popular: false,
      recursos: configPlanos.recursos_planos?.premium || [
        'TODOS os 11 Agentes IA',
        'IA de Geração de Imagens',
        'Networking & Relações',
        'Branding & Posicionamento',
        'Experiência de Unboxing',
        'Créditos ILIMITADOS',
        'Suporte VIP 24/7',
        'Consultoria Mensal 1:1',
        'Acesso Antecipado a Novos Agentes'
      ]
    }
  ];

  // Verificar se o plano anual está ativo
  const planoAnualAtivo = configPlanos.plano_anual_ativo !== false;

  return (
    <section id="pricing" className="py-20 bg-black text-white relative">
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#736ded]/10 blur-[120px] z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4">Planos para cada estágio da sua marca</h2>
        <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Escolha o plano perfeito para impulsionar sua marca de roupas
        </p>
        
        {/* Toggle Anual/Mensal - Só exibir se o plano anual estiver ativo */}
        {planoAnualAtivo && (
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-full p-1 inline-flex">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium ${selectedPeriod === 'mensal' ? 'bg-[#736ded] text-white' : 'text-gray-400'}`}
                onClick={() => setSelectedPeriod('mensal')}
              >
                Mensal
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium ${selectedPeriod === 'anual' ? 'bg-[#736ded] text-white' : 'text-gray-400'}`}
                onClick={() => setSelectedPeriod('anual')}
              >
                Anual <Badge variant="outline" className="ml-1 bg-[#736ded]/20 border-0 text-xs">Até 2 meses grátis</Badge>
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pricing-grid">
          {planos.map((plano, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-6 relative pricing-card ${
                plano.popular 
                  ? 'bg-gradient-to-b from-[#736ded]/30 to-black border-2 border-[#736ded]'
                  : 'bg-gray-900/50 backdrop-blur-sm border border-gray-800'
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#736ded] text-white text-sm font-medium py-1 px-3 rounded-full">
                  Mais popular
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">{plano.nome}</h3>
                  <p className="text-gray-400">{plano.subtitulo}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${plano.cor}`}>
                  {plano.id === 'basico' && <TrendingUp className="w-6 h-6 text-white" />}
                  {plano.id === 'intermediario' && <Star className="w-6 h-6 text-white" />}
                  {plano.id === 'premium' && <Crown className="w-6 h-6 text-white" />}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">
                    R${selectedPeriod === 'anual' ? plano.preco_anual : plano.preco_mensal}
                  </span>
                  <span className="text-gray-400">{selectedPeriod === 'anual' ? '/ano' : '/mês'}</span>
                </div>
                
                {/* Mostrar preço original riscado quando houver oferta */}
                {selectedPeriod === 'anual' && configPlanos.oferta_ativa && 
                 plano.preco_original_anual > 0 && 
                 plano.preco_original_anual > plano.preco_anual && (
                  <div className="mt-1">
                    <span className="text-gray-400 line-through text-sm">
                      De R${plano.preco_original_anual}
                    </span>
                    <Badge variant="outline" className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                      {Math.round((1 - plano.preco_anual / plano.preco_original_anual) * 100)}% OFF
                    </Badge>
                  </div>
                )}
                
                {selectedPeriod === 'mensal' && configPlanos.oferta_ativa && 
                 plano.preco_original > 0 && 
                 plano.preco_original > plano.preco_mensal && (
                  <div className="mt-1">
                    <span className="text-gray-400 line-through text-sm">
                      De R${plano.preco_original}
                    </span>
                    <Badge variant="outline" className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
                      {Math.round((1 - plano.preco_mensal / plano.preco_original) * 100)}% OFF
                    </Badge>
                  </div>
                )}
                
                {selectedPeriod === 'anual' && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-400">
                      Equivalente a R${Math.floor(plano.preco_anual / 12)}/mês
                    </span>
                    <Badge variant="outline" className="mt-1 block bg-green-500/20 text-green-400 border-green-500/30 w-fit">
                      <Gift className="w-3 h-3 mr-1" />
                      {Math.floor(plano.meses_gratis)} meses grátis
                    </Badge>
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plano.recursos.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plano.popular 
                    ? 'bg-[#736ded] hover:bg-[#6058db]'
                    : 'bg-gray-800 hover:bg-gray-700'
                } text-white rounded-md`}
                onClick={handleEscolherPlano}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Criar Conta
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA section
const CTA = () => {
  return (
    <section className="py-20 bg-black text-white relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#736ded]/30 to-black backdrop-blur-sm border border-[#736ded]/30 rounded-xl p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#736ded]/30 blur-[50px]"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#00b6ff]/30 blur-[50px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-center">Pronto para transformar sua marca de moda?</h2>
            <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl mx-auto">
              Junte-se a marcas de sucesso que já aumentaram suas vendas em até 73% usando nossa IA especializada em moda
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/login">
                <Button className="bg-[#736ded] hover:bg-[#6058db] text-white px-8 py-3 rounded-md text-lg">
                  Começar agora <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-8 py-3 rounded-md text-lg">
                Agendar demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/img/logo.png" alt="BrandzLAB Logo" className="h-6 w-6 mr-2" />
              <span className="ml-2 text-xl font-bold">
                <span className="text-[#00b6ff]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>Brandz</span>
                <span className="text-[#736ded]" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>LAB</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Plataforma de IA especializada para marcas de roupas, integrando diversos agentes com expertises específicas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Agentes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Integrações</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Planos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Termos de Serviço</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Licenças</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BrandzLAB. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Home component
const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <Agentes />
        <Features />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home; 