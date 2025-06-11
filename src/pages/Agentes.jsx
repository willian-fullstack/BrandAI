import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, Lock, ArrowRight, Crown, Zap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig, planosConfig } from "@/config/agentes";

export default function Agentes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const navegarParaAgente = (agenteId) => {
    navigate(`/chat?agente=${agenteId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-t-2 border-primary/70 animate-spin-slow"></div>
          </div>
          <span className="text-muted-foreground font-medium">Carregando agentes...</span>
        </div>
      </div>
    );
  }

  // Admin tem acesso a todos os agentes
  const agentesDisponiveis = user ? (
    user.role === 'admin' 
      ? Object.keys(agentesConfig)
      : planosConfig[user.plano_atual]?.agentes || []
  ) : [];
  
  const agentesIndisponiveis = user?.role === 'admin' 
    ? [] 
    : Object.keys(agentesConfig).filter(agente => !agentesDisponiveis.includes(agente));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Seus Agentes IA Especializados
                {user?.role === 'admin' && <span className="text-destructive ml-2">(Admin)</span>}
              </h1>
              <p className="text-lg text-muted-foreground">
                Cada agente é um especialista treinado para resolver desafios específicos da sua marca
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`px-4 py-2 text-sm font-semibold ${
                user?.role === 'admin'
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white border-0'
                  : user?.plano_atual === 'premium' 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-600 text-white border-0' 
                  : user?.plano_atual === 'intermediario'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0'
                  : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0'
              }`}>
                <Crown className="w-4 h-4 mr-2" />
                {user?.role === 'admin' 
                  ? `Todos os ${Object.keys(agentesConfig).length} Agentes (Admin)`
                  : `${agentesDisponiveis.length} de ${Object.keys(agentesConfig).length} Agentes`
                }
              </Badge>
              {user?.role !== 'admin' && (
                <Link to={createPageUrl("Planos")}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Zap className="w-4 h-4 mr-2" />
                    Desbloquear Mais
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Agentes Disponíveis */}
        {agentesDisponiveis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <MessageSquare className="w-7 h-7 text-primary" />
                  {user?.role === 'admin' ? 'Todos os Agentes (Acesso Admin)' : 'Agentes Disponíveis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agentesDisponiveis.map((agenteTipo, index) => {
                    const agente = agentesConfig[agenteTipo];
                    return (
                      <motion.div
                        key={agenteTipo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                        <div onClick={() => navegarParaAgente(agenteTipo)}>
                          <motion.div
                            whileHover={{ 
                              scale: 1.03, 
                              y: -5,
                              boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.3)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="h-full"
                          >
                            <Card className={`h-full bg-gradient-to-br ${agente.cor} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group`}>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 blur-sm transform -rotate-12 transition-all duration-1000 ease-out"></div>
                              
                              <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                  <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">{agente.icon}</span>
                                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                                <h3 className="font-bold text-xl mb-3">{agente.nome}</h3>
                                <p className="text-sm opacity-90 mb-4 leading-relaxed">
                                  {agente.descricao}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {agente.especialidades.slice(0, 2).map((especialidade) => (
                                    <Badge 
                                      key={especialidade}
                                      variant="secondary" 
                                      className="bg-white/20 text-white border-0 text-xs shadow-sm"
                                    >
                                      {especialidade}
                                    </Badge>
                                  ))}
                                  {agente.especialidades.length > 2 && (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-white/20 text-white border-0 text-xs shadow-sm"
                                    >
                                      +{agente.especialidades.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Agentes Indisponíveis (apenas para não-admin) */}
        {agentesIndisponiveis.length > 0 && user?.role !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Lock className="w-7 h-7 text-muted-foreground" />
                  Agentes Premium (Upgrade Necessário)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agentesIndisponiveis.map((agenteTipo, index) => {
                    const agente = agentesConfig[agenteTipo];
                    return (
                      <motion.div
                        key={agenteTipo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <Card className="h-full relative bg-secondary/50 border-border shadow-md backdrop-blur-sm">
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                            <div className="text-center p-6">
                              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 border border-border">
                                <Lock className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <h3 className="text-foreground text-lg font-medium mb-2">{agente.nome}</h3>
                              <p className="text-muted-foreground text-sm mb-4">Disponível em planos superiores</p>
                              <Link to={createPageUrl("Planos")}>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                  <Crown className="w-4 h-4 mr-2" />
                                  Fazer Upgrade
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <CardContent className="p-6 opacity-30">
                            <div className="flex items-start justify-between mb-4">
                              <span className="text-3xl">{agente.icon}</span>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-foreground">{agente.nome}</h3>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                              {agente.descricao}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {agente.especialidades.slice(0, 2).map((especialidade) => (
                                <Badge 
                                  key={especialidade}
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {especialidade}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
