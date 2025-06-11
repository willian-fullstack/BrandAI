import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Sparkles,
  Search,
  ArrowRight,
  Crown,
  Zap,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig, planosConfig } from "@/config/agentes";

// Mapeamento de agentes disponíveis por plano
const agentesDisponivelsPorPlano = {
  basico: ['marketing_midias_sociais', 'identidade_visual'],
  intermediario: ['marketing_midias_sociais', 'identidade_visual', 'publicidade', 'seo'],
  premium: Object.keys(agentesConfig),
  admin: Object.keys(agentesConfig)
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [recomendacao, setRecomendacao] = useState("");
  const [loading, setLoading] = useState(true);
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

  const agentesDisponiveis = user ? (
    user.role === 'admin'
      ? Object.keys(agentesConfig)
      : planosConfig[user.plano_atual]?.agentes || []
  ) : [];
  const totalAgentes = Object.keys(agentesConfig).length;

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Olá, {user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
                {user?.role === 'admin' && <span className="text-red-600 ml-2">(Admin)</span>}
              </h1>
              <p className="text-xl text-gray-600">
                Pronto para acelerar sua marca com IA?
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
                {user?.role === 'admin' ? 'Admin Premium' : `Plano ${user?.plano_atual?.charAt(0).toUpperCase() + user?.plano_atual?.slice(1)}`}
              </Badge>
              {user?.role !== 'admin' && (
                <Link to={createPageUrl("Planos")}>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Agentes Disponíveis</p>
                    <p className="text-3xl font-bold text-gray-900">{agentesDisponiveis.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Créditos Restantes</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {user?.role === 'admin' ? '∞' : (user?.creditos_restantes || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Conversas</p>
                    <p className="text-3xl font-bold text-gray-900">{conversas.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Comissões</p>
                    <p className="text-3xl font-bold text-green-600">R$ {(user?.total_comissoes || 0).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-xl text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Target className="w-6 h-6" />
                Recomendação Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-indigo-100">
                  Descreva o desafio ou objetivo da sua marca que você gostaria de resolver:
                </p>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ex: Como aumentar vendas no Instagram, melhorar conversão do site..."
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-indigo-200"
                  />
                  <Button
                    className="bg-white text-indigo-600 hover:bg-gray-100"
                    disabled={!pesquisa.trim()}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Recomendar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                    Seus Agentes IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {agentesDisponiveis.map((agenteTipo) => {
                      const agente = agentesConfig[agenteTipo];
                      return (
                        <div 
                          key={agenteTipo} 
                          onClick={() => navegarParaAgente(agenteTipo)}
                          className="cursor-pointer"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl bg-gradient-to-r ${agente.cor} text-white cursor-pointer hover:shadow-lg transition-all duration-200`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-2xl">{agente.icon}</span>
                              <ArrowRight className="w-5 h-5 opacity-70" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{agente.nome}</h3>
                            <p className="text-sm opacity-90">{agente.descricao}</p>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>

                  {agentesDisponiveis.length < totalAgentes && user?.role !== 'admin' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Desbloqueie {totalAgentes - agentesDisponiveis.length} agentes adicionais
                          </p>
                          <p className="text-sm text-gray-600">
                            Faça upgrade do seu plano para acessar todos os especialistas
                          </p>
                        </div>
                        <Link to={createPageUrl("Planos")}>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                            Ver Planos
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                      Conversas Recentes
                    </CardTitle>
                    <Link to={createPageUrl("Conversas")}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Ver todas
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {conversas.length > 0 ? (
                    <div className="space-y-3">
                      {conversas.map((conversa) => (
                        <div
                          key={conversa.id}
                          onClick={() => navegarParaChat(conversa.id)}
                          className="p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {agentesConfig[conversa.agente_id]?.icon || "🤖"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {conversa.titulo}
                              </p>
                              <p className="text-sm text-gray-500">
                                {agentesConfig[conversa.agente_id]?.nome || "Agente"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 text-center">
                        <Link to={createPageUrl("Conversas")}>
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 text-sm w-full">
                            Ver todas as {conversas.length > 5 ? 'outras' : ''} conversas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma conversa ainda</p>
                      <p className="text-sm text-gray-400">
                        Comece conversando com seus agentes IA
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
