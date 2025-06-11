import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ConfiguracaoPlanos } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  TrendingUp,
  Gift,
  LogIn,
  ShieldCheck,
  ArrowLeft
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-t-2 border-primary/70 animate-spin-slow"></div>
          </div>
          <span className="text-muted-foreground font-medium">Carregando planos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Escolha Seu Plano
            </h1>
            
            {userIsAdmin ? (
              <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-lg p-4 mb-6 flex items-center justify-center gap-2 backdrop-blur-sm">
                <ShieldCheck className="text-emerald-400" size={24} />
                <p className="text-emerald-300 font-medium">
                  Como administrador, você já tem acesso ilimitado a todos os recursos e agentes da plataforma.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xl mb-8">
                Escolha o plano perfeito para acelerar o crescimento da sua marca
              </p>
            )}
            
            {/* Toggle Anual/Mensal */}
            <div className="inline-flex items-center bg-card border border-border p-1 rounded-full backdrop-blur-sm shadow-lg mx-auto mb-12">
              <Button
                variant={planoAnual ? "default" : "ghost"}
                className={planoAnual 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-muted-foreground hover:text-foreground"}
                onClick={() => setPlanoAnual(true)}
              >
                Anual <Badge variant="outline" className="ml-2 bg-primary/20 border-0">Até 2 meses grátis</Badge>
              </Button>
              <Button
                variant={!planoAnual ? "default" : "ghost"}
                className={!planoAnual 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-muted-foreground hover:text-foreground"}
                onClick={() => setPlanoAnual(false)}
              >
                Mensal
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planos.map((plano, index) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`${plano.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              <Card className={`h-full border ${
                plano.popular 
                  ? 'border-primary/50 shadow-lg shadow-primary/10'
                  : 'border-border shadow-md'
              } overflow-hidden`}>
                {plano.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 font-medium text-sm">
                    Recomendado para sua marca
                  </div>
                )}
                
                <CardHeader className={`pb-4 ${plano.popular ? 'bg-muted/50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        {plano.nome}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1 font-medium">
                        {plano.subtitulo}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${plano.cor}`}>
                      {plano.id === 'basico' && <TrendingUp className="w-6 h-6 text-white" />}
                      {plano.id === 'intermediario' && <Star className="w-6 h-6 text-white" />}
                      {plano.id === 'premium' && <Crown className="w-6 h-6 text-white" />}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-end gap-1">
                      <span className="text-foreground text-3xl font-bold">
                        R${planoAnual ? plano.preco_anual : plano.preco_mensal}
                      </span>
                      {planoAnual ? (
                        <span className="text-muted-foreground mb-1">/ano</span>
                      ) : (
                        <span className="text-muted-foreground mb-1">/mês</span>
                      )}
                    </div>
                    
                    {planoAnual && (
                      <div className="mt-2 flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          Equivalente a R${Math.floor(plano.preco_anual / 12)}/mês
                        </span>
                        <Badge variant="outline" className="mt-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 self-start">
                          <Gift className="w-3 h-3 mr-1" />
                          {Math.floor(plano.meses_gratis)} meses grátis
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    <Badge variant="outline" className="bg-card border-border px-3 py-1 flex items-center gap-2 self-start">
                      <Zap className="w-3.5 h-3.5 text-primary" /> 
                      <span className="text-foreground">{plano.agentes_inclusos} Agentes IA</span>
                    </Badge>
                    
                    <ul className="space-y-3">
                      {plano.recursos.map((recurso, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-foreground">
                          <Check className="min-w-5 h-5 text-emerald-500 mt-0.5" />
                          <span>{recurso}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4">
                      {!user && (
                        <Button 
                          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => handleEscolherPlano(plano.id)}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Criar Conta
                        </Button>
                      )}
                      
                      {user && user.plano_atual === plano.id && (
                        <Button 
                          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white cursor-default"
                          disabled
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Seu Plano Atual
                        </Button>
                      )}
                      
                      {user && user.plano_atual !== plano.id && (
                        <Button 
                          className={`w-full h-11 ${
                            plano.popular 
                              ? 'bg-gradient-to-r from-primary to-primary-foreground/90 hover:brightness-110 text-primary-foreground'
                              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          }`}
                          onClick={() => handleEscolherPlano(plano.id)}
                        >
                          {user.plano_atual === 'basico' && plano.id === 'intermediario' && (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Fazer Upgrade
                            </>
                          )}
                          {user.plano_atual === 'basico' && plano.id === 'premium' && (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Fazer Upgrade
                            </>
                          )}
                          {user.plano_atual === 'intermediario' && plano.id === 'premium' && (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Fazer Upgrade
                            </>
                          )}
                          {user.plano_atual === 'intermediario' && plano.id === 'basico' && (
                            'Mudar para Básico'
                          )}
                          {user.plano_atual === 'premium' && (
                            'Mudar para este Plano'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Garantia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="bg-slate-800/30 border-0 backdrop-blur-sm py-6 px-8 inline-block mx-auto">
            <CardContent className="flex flex-col md:flex-row items-center gap-4 p-0">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-white">Garantia de 7 dias</h3>
                <p className="text-slate-400">Se você não ficar satisfeito nos primeiros 7 dias, devolvemos seu dinheiro sem perguntas.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
