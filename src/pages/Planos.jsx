import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ConfiguracaoPlanos } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  Sparkles,
  TrendingUp,
  Gift,
  ArrowRight,
  LogIn,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { isAdmin } from "@/api/base44Client";

export default function Planos() {
  const [user, setUser] = useState(null);
  const [planoAnual, setPlanoAnual] = useState(true);
  const [loading, setLoading] = useState(true);
  const [configPlanos, setConfigPlanos] = useState({
    plano_basico_preco_mensal: 67,
    plano_basico_preco_anual: 597,
    plano_intermediario_preco_mensal: 97,
    plano_intermediario_preco_anual: 870,
    plano_premium_preco_mensal: 127,
    plano_premium_preco_anual: 997
  });
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Verificar se o usuário está autenticado
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const userData = await User.me();
          setUser(userData);
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          // Se houver erro na autenticação, limpar o token
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
        }
      }

      // Carregar configurações de preços
      try {
        const planosDataResults = await ConfiguracaoPlanos.list();
        if (planosDataResults && planosDataResults.length > 0) {
          setConfigPlanos(planosDataResults[0]);
        }
      } catch (error) {
        console.warn("Usando preços padrão, erro ao carregar configurações de planos:", error);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const planos = [
    {
      id: 'basico',
      nome: 'Básico',
      subtitulo: 'Para quem está começando',
      preco_mensal: configPlanos.plano_basico_preco_mensal || 67,
      preco_anual: configPlanos.plano_basico_preco_anual || 597,
      economia: (configPlanos.plano_basico_preco_mensal * 12) - (configPlanos.plano_basico_preco_anual || 597),
      meses_gratis: ((configPlanos.plano_basico_preco_mensal * 12) - (configPlanos.plano_basico_preco_anual || 597)) / (configPlanos.plano_basico_preco_mensal || 67),
      agentes_inclusos: 4,
      cor: 'from-blue-500 to-cyan-600',
      popular: false,
      recursos: [
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
      preco_anual: configPlanos.plano_intermediario_preco_anual || 870,
      economia: (configPlanos.plano_intermediario_preco_mensal * 12) - (configPlanos.plano_intermediario_preco_anual || 870),
      meses_gratis: ((configPlanos.plano_intermediario_preco_mensal * 12) - (configPlanos.plano_intermediario_preco_anual || 870)) / (configPlanos.plano_intermediario_preco_mensal || 97),
      agentes_inclusos: 7,
      cor: 'from-purple-500 to-indigo-600',
      popular: true,
      recursos: [
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
      preco_mensal: configPlanos.plano_premium_preco_mensal || 127,
      preco_anual: configPlanos.plano_premium_preco_anual || 997,
      economia: (configPlanos.plano_premium_preco_mensal * 12) - (configPlanos.plano_premium_preco_anual || 997),
      meses_gratis: ((configPlanos.plano_premium_preco_mensal * 12) - (configPlanos.plano_premium_preco_anual || 997)) / (configPlanos.plano_premium_preco_mensal || 127),
      agentes_inclusos: 11,
      cor: 'from-yellow-400 to-orange-500',
      popular: false,
      recursos: [
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

  const handleEscolherPlano = (planoId) => {
    if (!user) {
      // Se não estiver logado, redirecionar para a página de login
      navigate('/login');
      return;
    }
    
    // Aqui seria integrado com gateway de pagamento
    alert(`Implementar integração com gateway de pagamento para plano: ${planoId}`);
  };

  const handleUpgrade = (planoId) => {
    if (!user) {
      // Se não estiver logado, redirecionar para a página de login
      navigate('/login');
      return;
    }
    
    const planoAtual = user?.plano_atual;
    const valores = {
      basico: { intermediario: 30, premium: 60 },
      intermediario: { premium: 30 }
    };
    
    const valorUpgrade = valores[planoAtual]?.[planoId];
    if (valorUpgrade) {
      alert(`Por mais R$${valorUpgrade}, você pode fazer upgrade para o plano ${planoId}!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Escolha Seu Plano
          </h1>
          
          {userIsAdmin ? (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
              <ShieldCheck className="text-green-600" size={24} />
              <p className="text-green-800 font-medium">
                Como administrador, você já tem acesso ilimitado a todos os recursos e agentes da plataforma.
              </p>
            </div>
          ) : (
            <p className="text-xl text-gray-600 mb-8">
              Transforme sua marca com o poder da inteligência artificial
            </p>
          )}
          
          {/* Toggle Anual/Mensal */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-lg font-semibold ${!planoAnual ? 'text-gray-900' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setPlanoAnual(!planoAnual)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-200 ${
                planoAnual ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform duration-200 ${
                planoAnual ? 'translate-x-9' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-lg font-semibold ${planoAnual ? 'text-gray-900' : 'text-gray-400'}`}>
              Anual
            </span>
            {planoAnual && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                <Gift className="w-3 h-3 mr-1" />
                Até 4 meses grátis!
              </Badge>
            )}
          </div>
          
          {/* Mostrar botão de login se não estiver autenticado */}
          {!user && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 px-8 py-6 text-lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Entrar para assinar
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }} className="text-indigo-600 hover:underline">Criar conta</a>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Cards dos Planos */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {planos.map((plano, index) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plano.popular ? 'transform scale-105' : ''}`}
            >
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                plano.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
              }`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plano.cor} rounded-full flex items-center justify-center`}>
                    {plano.id === 'premium' ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : plano.id === 'intermediario' ? (
                      <Zap className="w-8 h-8 text-white" />
                    ) : (
                      <Sparkles className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plano.nome}
                  </CardTitle>
                  <p className="text-gray-600">{plano.subtitulo}</p>
                  
                  <div className="mt-6">
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        R${planoAnual ? plano.preco_anual : plano.preco_mensal}
                      </span>
                      <span className="text-gray-600">
                        /{planoAnual ? 'ano' : 'mês'}
                      </span>
                    </div>
                    
                    {planoAnual && plano.economia > 0 && (
                      <div className="mt-2">
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Economize R${plano.economia.toFixed(0)} ({plano.meses_gratis.toFixed(1)} meses grátis!)
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="border-t border-gray-100 my-4"></div>
                  
                  <ul className="space-y-3 mb-8">
                    {plano.recursos.map((recurso, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{recurso}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleEscolherPlano(plano.id)} 
                    className={`w-full bg-gradient-to-r ${plano.cor} text-white hover:shadow-lg transition-all duration-300 py-6`}
                  >
                    {user ? 'Escolher Plano' : 'Assinar Agora'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  {user && user.plano_atual && user.plano_atual !== plano.id && (
                    <div className="text-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpgrade(plano.id)}
                        className="text-sm"
                      >
                        Fazer upgrade
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ ou Depoimentos poderiam ser adicionados aqui */}
      </div>
    </div>
  );
}
