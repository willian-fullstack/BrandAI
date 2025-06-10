import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, Lock, ArrowRight, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig, planosConfig } from "@/config/agentes";

export default function Agentes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Seus Agentes IA Especializados
                {user?.role === 'admin' && <span className="text-red-600 ml-2">(Admin)</span>}
              </h1>
              <p className="text-xl text-gray-600">
                Cada agente é um especialista treinado para resolver desafios específicos da sua marca
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`px-4 py-2 text-sm font-semibold ${
                user?.role === 'admin'
                  ? 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                  : user?.plano_atual === 'premium' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                  : user?.plano_atual === 'intermediario'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                <Crown className="w-4 h-4 mr-2" />
                {user?.role === 'admin' 
                  ? `Todos os ${Object.keys(agentesConfig).length} Agentes (Admin)`
                  : `${agentesDisponiveis.length} de ${Object.keys(agentesConfig).length} Agentes`
                }
              </Badge>
              {user?.role !== 'admin' && (
                <Link to={createPageUrl("Planos")}>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <MessageSquare className="w-7 h-7 text-indigo-600" />
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
                        <Link to={createPageUrl(`Chat?agente=${agenteTipo}`)}>
                          <motion.div
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className="h-full"
                          >
                            <Card className={`h-full bg-gradient-to-br ${agente.cor} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}>
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <span className="text-3xl">{agente.icon}</span>
                                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
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
                                      className="bg-white/20 text-white border-white/30 text-xs"
                                    >
                                      {especialidade}
                                    </Badge>
                                  ))}
                                  {agente.especialidades.length > 2 && (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-white/20 text-white border-white/30 text-xs"
                                    >
                                      +{agente.especialidades.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Link>
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Lock className="w-7 h-7 text-gray-400" />
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
                        <Card className="h-full relative bg-gray-50 border-0 shadow-sm">
                          <div className="absolute inset-0 bg-gray-900/10 rounded-lg z-10 flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                              <Link to={createPageUrl("Planos")}>
                                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                  Desbloquear
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <CardContent className="p-6 opacity-60">
                            <div className="flex items-start justify-between mb-4">
                              <span className="text-3xl grayscale">{agente.icon}</span>
                            </div>
                            <h3 className="font-bold text-xl mb-3 text-gray-700">{agente.nome}</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              {agente.descricao}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {agente.especialidades.slice(0, 2).map((especialidade) => (
                                <Badge 
                                  key={especialidade}
                                  variant="secondary" 
                                  className="bg-gray-200 text-gray-600 text-xs"
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
                
                <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">
                    🚀 Desbloqueie Todo o Potencial da Sua Marca
                  </h3>
                  <p className="text-indigo-100 mb-4">
                    Acesse todos os {Object.keys(agentesConfig).length} agentes especializados + IA de geração de imagens
                  </p>
                  <Link to={createPageUrl("Planos")}>
                    <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold">
                      <Crown className="w-4 h-4 mr-2" />
                      Ver Planos e Preços
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
