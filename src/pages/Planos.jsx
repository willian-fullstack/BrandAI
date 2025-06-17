import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ConfiguracaoPlanos } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  ArrowLeft,
  Tag,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { isAdmin } from "@/api/base44Client";
import { toast } from "sonner";

export default function Planos() {
  const [user, setUser] = useState(null);
  const [planoAnual, setPlanoAnual] = useState(true);
  const [loading, setLoading] = useState(true);
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [aplicandoCupom, setAplicandoCupom] = useState(false);
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
  const navigate = useNavigate();
  const location = useLocation();
  const userIsAdmin = isAdmin();

  useEffect(() => {
    loadData();
    // Forçar recarregamento dos dados quando a página é acessada
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, [location.key]); // Recarregar quando a URL muda

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
        const planosDataResults = await ConfiguracaoPlanos.getAll();
        console.log("Configurações de planos carregadas:", planosDataResults);
        
        if (planosDataResults && planosDataResults.length > 0) {
          const configData = planosDataResults[0];
          console.log("Configuração selecionada:", configData);
          console.log("Oferta ativa?", configData.oferta_ativa);
          console.log("Preços originais:", {
            basico_mensal: configData.plano_basico_preco_original_mensal,
            basico_anual: configData.plano_basico_preco_original_anual,
            intermediario_mensal: configData.plano_intermediario_preco_original_mensal,
            intermediario_anual: configData.plano_intermediario_preco_original_anual,
            premium_mensal: configData.plano_premium_preco_original_mensal,
            premium_anual: configData.plano_premium_preco_original_anual
          });
          
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
            },
            cupons: configData.cupons || []
          });
          
          // Se o plano anual não estiver ativo, forçar a exibição do plano mensal
          if (configData.plano_anual_ativo === false) {
            setPlanoAnual(false);
          }
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

  const aplicarCupom = async () => {
    if (!cupomCodigo.trim()) {
      toast.error("Digite um código de cupom válido");
      return;
    }

    setAplicandoCupom(true);
    try {
      // Chamar a API para verificar o cupom
      const response = await fetch(`/api/configuracao-planos/verificar-cupom/${cupomCodigo}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cupom inválido");
      }

      if (data.valido) {
        setCupomAplicado(data.cupom);
        toast.success("Cupom aplicado com sucesso!");
      } else {
        setCupomAplicado(null);
        toast.error(data.message || "Cupom inválido");
      }
    } catch (error) {
      console.error("Erro ao aplicar cupom:", error);
      toast.error(error.message || "Erro ao aplicar cupom");
      setCupomAplicado(null);
    } finally {
      setAplicandoCupom(false);
    }
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setCupomCodigo("");
    toast.info("Cupom removido");
  };

  // Calcular preços com desconto do cupom, se aplicável
  const calcularPrecoComDesconto = (preco, planoId) => {
    if (!cupomAplicado) return preco;
    
    // Verificar se o cupom é aplicável ao plano atual
    if (!cupomAplicado.planos_aplicaveis.includes(planoId)) return preco;
    
    if (cupomAplicado.tipo === 'percentual') {
      return preco - (preco * (cupomAplicado.valor / 100));
    } else if (cupomAplicado.tipo === 'valor_fixo') {
      return Math.max(0, preco - cupomAplicado.valor);
    }
    
    return preco;
  };

  const planos = [
    {
      id: 'basico',
      nome: 'Básico',
      subtitulo: 'Para quem está começando',
      preco_mensal: calcularPrecoComDesconto(configPlanos.plano_basico_preco_mensal || 67, 'basico'),
      preco_anual: calcularPrecoComDesconto(configPlanos.plano_basico_preco_anual || 597, 'basico'),
      preco_original: Number(configPlanos.plano_basico_preco_original_mensal) || 0,
      preco_original_anual: Number(configPlanos.plano_basico_preco_original_anual) || 0,
      economia: (configPlanos.plano_basico_preco_mensal * 12) - (configPlanos.plano_basico_preco_anual || 597),
      meses_gratis: ((configPlanos.plano_basico_preco_mensal * 12) - (configPlanos.plano_basico_preco_anual || 597)) / (configPlanos.plano_basico_preco_mensal || 67),
      agentes_inclusos: 4,
      cor: 'from-blue-500 to-cyan-600',
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
      preco_mensal: calcularPrecoComDesconto(configPlanos.plano_intermediario_preco_mensal || 97, 'intermediario'),
      preco_anual: calcularPrecoComDesconto(configPlanos.plano_intermediario_preco_anual || 897, 'intermediario'),
      preco_original: Number(configPlanos.plano_intermediario_preco_original_mensal) || 0,
      preco_original_anual: Number(configPlanos.plano_intermediario_preco_original_anual) || 0,
      economia: (configPlanos.plano_intermediario_preco_mensal * 12) - (configPlanos.plano_intermediario_preco_anual || 897),
      meses_gratis: ((configPlanos.plano_intermediario_preco_mensal * 12) - (configPlanos.plano_intermediario_preco_anual || 897)) / (configPlanos.plano_intermediario_preco_mensal || 97),
      agentes_inclusos: 7,
      cor: 'from-purple-500 to-indigo-600',
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
      preco_mensal: calcularPrecoComDesconto(configPlanos.plano_premium_preco_mensal || 197, 'premium'),
      preco_anual: calcularPrecoComDesconto(configPlanos.plano_premium_preco_anual || 997, 'premium'),
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

  const handleEscolherPlano = (planoId) => {
    if (!user) {
      // Se não estiver logado, redirecionar para a página de login
      navigate('/login');
      return;
    }
    
    // Aqui seria integrado com gateway de pagamento
    alert(`Implementar integração com gateway de pagamento para plano: ${planoId}`);
  };

  // Após a definição dos planos, adicionar logs para diagnóstico
  useEffect(() => {
    console.log("Planos atualizados:", planos);
    console.log("Configurações de planos:", configPlanos);
    console.log("Oferta ativa?", configPlanos.oferta_ativa);
  }, [planos, configPlanos]);

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
            
            {/* Toggle Anual/Mensal - Só exibir se o plano anual estiver ativo */}
            {configPlanos.plano_anual_ativo !== false && (
              <div className="inline-flex items-center bg-card border border-border p-1 rounded-full backdrop-blur-sm shadow-lg mx-auto mb-6">
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
            )}
            
            {/* Seção de Cupom */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Tem um cupom de desconto?"
                    value={cupomCodigo}
                    onChange={(e) => setCupomCodigo(e.target.value)}
                    disabled={!!cupomAplicado || aplicandoCupom}
                    className="pr-10"
                  />
                  {cupomAplicado && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/50"
                      onClick={removerCupom}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!cupomAplicado ? (
                  <Button 
                    onClick={aplicarCupom} 
                    disabled={aplicandoCupom || !cupomCodigo.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    {aplicandoCupom ? 'Aplicando...' : 'Aplicar'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="text-emerald-600 border-emerald-600"
                    disabled
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aplicado
                  </Button>
                )}
              </div>
              
              {cupomAplicado && (
                <div className="mt-2 text-sm flex items-center gap-2 justify-center">
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    {cupomAplicado.tipo === 'percentual' 
                      ? `${cupomAplicado.valor}% de desconto` 
                      : `R$${cupomAplicado.valor} de desconto`}
                  </Badge>
                  <span className="text-muted-foreground">{cupomAplicado.descricao}</span>
                </div>
              )}
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
                    
                    {/* Mostrar preço original riscado quando houver oferta */}
                    {planoAnual && configPlanos.oferta_ativa && 
                     plano.preco_original_anual > 0 && 
                     plano.preco_original_anual > plano.preco_anual && (
                      <div className="mt-1">
                        <span className="text-muted-foreground line-through text-sm">
                          De R${plano.preco_original_anual}
                        </span>
                        <Badge variant="outline" className="ml-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50">
                          {Math.round((1 - plano.preco_anual / plano.preco_original_anual) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                    
                    {!planoAnual && configPlanos.oferta_ativa && 
                     plano.preco_original > 0 && 
                     plano.preco_original > plano.preco_mensal && (
                      <div className="mt-1">
                        <span className="text-muted-foreground line-through text-sm">
                          De R${plano.preco_original}
                        </span>
                        <Badge variant="outline" className="ml-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50">
                          {Math.round((1 - plano.preco_mensal / plano.preco_original) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                    
                    {configPlanos.oferta_ativa && configPlanos.oferta_titulo && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                          {configPlanos.oferta_titulo}
                        </Badge>
                      </div>
                    )}
                    
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
