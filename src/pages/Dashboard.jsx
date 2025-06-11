import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  Clock,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig, planosConfig } from "@/config/agentes";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agenteUsageData, setAgenteUsageData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const conversasData = await Conversa.filter({ usuario_id: userData.id }, '-updated_date', 5);
      setConversas(conversasData);
      
      // Processar dados de uso de agentes
      const todasConversas = await Conversa.filter({ usuario_id: userData.id }, '-updated_date');
      const usageCounts = {};
      
      // Contar uso de cada agente
      todasConversas.forEach(conversa => {
        const agenteId = conversa.agente_id;
        if (agenteId && agentesConfig[agenteId]) {
          usageCounts[agenteId] = (usageCounts[agenteId] || 0) + 1;
        }
      });
      
      setAgenteUsageData(usageCounts);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const navegarParaChat = (conversaId) => {
    navigate(`/chat?conversa=${conversaId}`);
  };

  const navegarParaAgente = (agenteId) => {
    navigate(`/chat?agente=${agenteId}`);
  };

  // Detectar mudanças de tema
  useEffect(() => {
    // Definir tema inicial
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Garantir que o tema é aplicado corretamente
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  const agentesDisponiveis = user ? (
    user.role === 'admin'
      ? Object.keys(agentesConfig)
      : planosConfig[user.plano_atual]?.agentes || []
  ) : [];
  
  // Preparar dados para o gráfico de uso de agentes
  const agenteChartData = Object.keys(agenteUsageData)
    .filter(agenteId => agentesConfig[agenteId]) // Filtrar apenas agentes válidos
    .map(agenteId => ({
      id: agenteId,
      nome: agentesConfig[agenteId]?.nome || "Agente Desconhecido",
      count: agenteUsageData[agenteId],
      cor: agentesConfig[agenteId]?.cor || "from-gray-500 to-gray-600"
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Top 6 agentes mais usados

  const maxUsage = Math.max(...agenteChartData.map(item => item.count || 0), 1);

  // Dentro do componente, adicionar esta função para formatar datas
  const formatarData = (dataString) => {
    try {
      if (!dataString) return "Data indisponível";
      
      const data = new Date(dataString);
      if (isNaN(data.getTime())) {
        return "Data indisponível";
      }
      
      return format(data, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data indisponível";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-t-2 border-purple-500 animate-spin-slow"></div>
          </div>
          <span className="text-slate-400 font-medium">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Olá, {user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
              {user?.role === 'admin' && <span className="text-red-500 ml-2">(Admin)</span>}
            </h1>
            <p className="text-muted-foreground">
              Pronto para acelerar sua marca com IA?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Badge className={`px-4 py-2 text-sm font-semibold ${
              user?.role === 'admin'
                ? 'bg-gradient-red text-white'
                : user?.plano_atual === 'premium'
                ? 'bg-gradient-purple text-white'
                : user?.plano_atual === 'intermediario'
                ? 'bg-gradient-blue text-white'
                : 'bg-gradient-green text-white'
            }`}>
              <Crown className="w-4 h-4 mr-2" />
              {user?.role === 'admin' ? 'Admin Premium' : `Plano ${user?.plano_atual?.charAt(0).toUpperCase() + user?.plano_atual?.slice(1)}`}
            </Badge>
            {user?.role !== 'admin' && (
              <Link to={createPageUrl("Planos")}>
                <Button className="bg-gradient-purple hover:opacity-90">
                  <Zap className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Agentes Disponíveis</p>
                  <p className="text-3xl font-bold mt-1">{agentesDisponiveis.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center shadow-glow">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Créditos Restantes</p>
                  <p className="text-3xl font-bold mt-1">
                    {user?.role === 'admin' ? '∞' : (user?.creditos_restantes || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-green rounded-xl flex items-center justify-center shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Conversas</p>
                  <p className="text-3xl font-bold mt-1">{conversas.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-blue rounded-xl flex items-center justify-center shadow-glow">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Comissões</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">R$ {(user?.total_comissoes || 0).toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-orange rounded-xl flex items-center justify-center shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico de uso de agentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card className="glass-card">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Uso de Agentes IA</CardTitle>
              <Badge variant="outline" className="border-primary text-primary">
                Agentes mais utilizados
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {agenteChartData.length > 0 ? (
              <div className="h-64 w-full">
                <div className="flex h-full items-end gap-2">
                  <div className="relative h-full w-full">
                    <div className="absolute bottom-0 left-0 right-0 top-0 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {agenteChartData.map((agente) => (
                        <div 
                          key={agente.id} 
                          className="flex flex-col justify-end cursor-pointer group h-full"
                          onClick={() => navegarParaAgente(agente.id)}
                        >
                          <div className="relative h-full flex flex-col justify-end">
                            <div 
                              className={`bg-gradient-to-br ${agente.cor} opacity-80 rounded-t-md transition-all duration-300 group-hover:opacity-100`} 
                              style={{ height: `${Math.max(20, (agente.count / maxUsage) * 100)}%`, minHeight: '20px' }}
                            >
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {agente.count} {agente.count === 1 ? 'uso' : 'usos'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs text-muted-foreground">
                  {agenteChartData.map((agente) => (
                    <div key={agente.id} className="truncate text-center px-1" title={agente.nome}>
                      {agente.nome}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-muted-foreground mb-2">Nenhum uso de agente registrado</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece a conversar com agentes para ver estatísticas de uso
                </p>
                <Button 
                  className="bg-gradient-purple hover:opacity-90"
                  onClick={() => navigate('/agentes')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Explorar Agentes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Seção de conversas recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Conversas Recentes</h2>
          <Link to={createPageUrl("Conversas")} className="text-primary hover:text-primary/80 flex items-center">
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {conversas.length > 0 ? (
            conversas.map((conversa) => (
              <Card 
                key={conversa.id} 
                className="glass-card hover-lift cursor-pointer transition-all"
                onClick={() => navegarParaChat(conversa.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${agentesConfig[conversa.agente_id]?.cor || "from-slate-500 to-slate-600"} flex items-center justify-center mr-4`}>
                      {agentesConfig[conversa.agente_id]?.icon || <MessageSquare className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{conversa.titulo || "Conversa sem título"}</h3>
                      <p className="text-muted-foreground text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatarData(conversa.created_date || conversa.createdAt || conversa.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Você ainda não tem conversas</p>
                <Button 
                  className="bg-gradient-purple hover:opacity-90"
                  onClick={() => navigate('/chat')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Iniciar Nova Conversa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Seção de agentes recomendados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Agentes Recomendados</h2>
          <Link to={createPageUrl("Agentes")} className="text-primary hover:text-primary/80 flex items-center">
            Ver todos <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentesDisponiveis.slice(0, 3).map((agenteId) => {
            const agente = agentesConfig[agenteId];
            return (
              <Card 
                key={agenteId} 
                className="glass-card hover-lift cursor-pointer transition-all"
                onClick={() => navegarParaAgente(agenteId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-r ${agente.cor || 'from-slate-500 to-slate-600'}`}>
                      {agente.icon || <Sparkles className="h-6 w-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{agente.nome}</h3>
                      <p className="text-muted-foreground text-xs">{agente.tipo || 'Especialista'}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {agente.descricao}
                  </p>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/80 text-foreground"
                  >
                    Iniciar Conversa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
