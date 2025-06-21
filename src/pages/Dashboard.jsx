import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig, planosConfig } from "@/config/agentes";
import ThemeToggle from "@/components/ui/theme-toggle";
import { AgenteConfig } from "@/api/entities";
import { Input } from "@/components/ui/input";
import UsageChart from "@/components/charts/UsageChart";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [todasConversas, setTodasConversas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agenteUsageData, setAgenteUsageData] = useState({});
  const [agentesConfigs, setAgentesConfigs] = useState([]);
  const [consultaAgente, setConsultaAgente] = useState("");
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
      const todasConversasData = await Conversa.filter({ usuario_id: userData.id }, '-updated_date');
      setTodasConversas(todasConversasData);
      const usageCounts = {};
      
      // Contar uso de cada agente
      todasConversasData.forEach(conversa => {
        const agenteId = conversa.agente_id;
        if (agenteId && agentesConfig[agenteId]) {
          usageCounts[agenteId] = (usageCounts[agenteId] || 0) + 1;
        }
      });
      
      setAgenteUsageData(usageCounts);
      
      // Carregar configurações dos agentes do backend
      const agentesData = await AgenteConfig.filter({ ativo: true });
      setAgentesConfigs(agentesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const navegarParaChat = (conversaId) => {
    navigate(`/app/chat?conversa=${conversaId}`);
  };

  const navegarParaAgente = (agenteId) => {
    navigate(`/app/chat?agente=${agenteId}`);
  };

  const buscarAgenteRecomendado = (e) => {
    e.preventDefault();
    if (consultaAgente.trim()) {
      navigate(`/app/diagnostico?consulta=${encodeURIComponent(consultaAgente)}`);
    }
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

  // Função para mapear IDs do MongoDB para códigos de agentes
  const mapearIdParaCodigo = (id) => {
    // Verificar se é um ID do MongoDB (24 caracteres hexadecimais)
    if (typeof id === 'string' && id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
      // Encontrar o agente com o ID fornecido
      const agenteConfig = agentesConfigs.find(agente => agente._id === id);
      return agenteConfig ? agenteConfig.codigo : null;
    }
    // Se não for um ID válido, retornar o próprio valor (pode ser um código direto)
    return id;
  };

  const agentesDisponiveis = user ? (
    user.role === 'admin'
      ? Object.keys(agentesConfig)
      : (() => {
          console.log("Dashboard - Dados do usuário:", user);
          console.log("Dashboard - Agentes liberados:", user.agentes_liberados);
          console.log("Dashboard - Plano atual:", user.plano_atual);
          
          // Para usuários não-admin, precisamos verificar quais agentes estão disponíveis
          
          // 1. Obter os agentes do plano do usuário
          const agentesDoPlano = planosConfig[user.plano_atual]?.agentes || [];
          console.log("Dashboard - Agentes do plano:", agentesDoPlano);
          
          // 2. Obter os agentes liberados manualmente pelo admin
          const agentesLiberadosIds = user.agentes_liberados || [];
          console.log("Dashboard - Agentes liberados IDs:", agentesLiberadosIds);
          
          // 3. Mapear os IDs do MongoDB para códigos de agentes
          const agentesLiberadosCodigos = agentesLiberadosIds
            .map(id => mapearIdParaCodigo(id))
            .filter(codigo => codigo !== null);
          console.log("Dashboard - Agentes liberados mapeados para códigos:", agentesLiberadosCodigos);
          
          // 4. Se o usuário tiver agentes liberados manualmente, usar esses
          // Caso contrário, usar os agentes do plano
          return agentesLiberadosCodigos.length > 0 
            ? agentesLiberadosCodigos 
            : agentesDoPlano;
        })()
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
    <div className="min-h-screen px-8">
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
              Bem-vindo ao seu painel da BrandLab!
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

      {/* Seção de diagnóstico/consulta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3">O que você precisa?</h2>
            <p className="text-white/80 text-lg">Irá indicar qual Agente é ideal para sua necessidade!</p>
          </div>
          <form onSubmit={buscarAgenteRecomendado} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Escreva aqui!"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 rounded-lg py-6 px-4 w-full focus:ring-2 focus:ring-white/50 focus:border-transparent"
                value={consultaAgente}
                onChange={(e) => setConsultaAgente(e.target.value)}
              />
            </div>
            <Button 
              type="submit"
              className="bg-white text-purple-600 hover:bg-white/90 py-6 px-6 rounded-lg font-semibold flex items-center justify-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </Button>
          </form>
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
                  <p className="text-3xl font-bold mt-1">{todasConversas.length}</p>
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
        {agenteChartData.length > 0 ? (
          <UsageChart 
            data={agenteChartData}
            maxValue={maxUsage}
            onAgenteClick={navegarParaAgente}
          />
        ) : (
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mb-4 mx-auto">
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
            </CardContent>
          </Card>
        )}
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
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                      conversa.agente_id && agentesConfig[conversa.agente_id] 
                        ? agentesConfig[conversa.agente_id].cor 
                        : "from-slate-500 to-slate-600"
                    } flex items-center justify-center mr-4`}>
                      {conversa.agente_id && agentesConfig[conversa.agente_id]
                        ? agentesConfig[conversa.agente_id].icon 
                        : <MessageSquare className="h-5 w-5 text-white" />
                      }
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
