import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquare, 
  Search, 
  ArrowLeft,
  Trash2,
  Calendar,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig } from "@/config/agentes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Conversas() {
  const [user, setUser] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalConversas, setTotalConversas] = useState(0);
  const itensPorPagina = 20;
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [paginaAtual]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Buscar todas as conversas com paginação
      const response = await Conversa.getAll(paginaAtual, itensPorPagina, pesquisa);
      setConversas(response.conversas || []);
      setTotalPaginas(response.pages || 1);
      setTotalConversas(response.total || 0);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarConversas = async () => {
    setPaginaAtual(1);
    await loadData();
  };

  const navegarParaChat = (conversaId) => {
    navigate(`/chat?conversa=${conversaId}`);
  };

  const excluirConversa = async (id, e) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta conversa?")) {
      try {
        await Conversa.delete(id);
        setConversas(conversas.filter(c => c.id !== id));
        alert("Conversa excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir conversa:", error);
        alert("Erro ao excluir conversa");
      }
    }
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (_) {
      return "Data desconhecida";
    }
  };

  const formatarHora = (dataString) => {
    try {
      const data = new Date(dataString);
      return format(data, "HH:mm", { locale: ptBR });
    } catch (_) {
      return "";
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Suas Conversas
              </h1>
              <p className="text-gray-600">
                Histórico completo de conversas com agentes IA
              </p>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-6">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Buscar por título ou conteúdo..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && buscarConversas()}
                  className="flex-1"
                />
                <Button onClick={buscarConversas}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                  Histórico de Conversas
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {totalConversas} {totalConversas === 1 ? 'conversa' : 'conversas'} encontradas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversas.length > 0 ? (
                <div className="space-y-3">
                  {conversas.map((conversa) => (
                    <div
                      key={conversa.id}
                      onClick={() => navegarParaChat(conversa.id)}
                      className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-r ${agentesConfig[conversa.agente_id]?.cor || "from-gray-500 to-gray-600"}`}>
                            {agentesConfig[conversa.agente_id]?.icon || "🤖"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {conversa.titulo}
                            </p>
                            <p className="text-sm text-gray-500">
                              {agentesConfig[conversa.agente_id]?.nome || "Agente"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatarData(conversa.updatedAt || conversa.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatarHora(conversa.updatedAt || conversa.createdAt)}</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={(e) => excluirConversa(conversa.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Paginação */}
                  {totalPaginas > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginaAtual === 1}
                        onClick={() => setPaginaAtual(paginaAtual - 1)}
                      >
                        Anterior
                      </Button>
                      
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPaginas || (p >= paginaAtual - 1 && p <= paginaAtual + 1))
                        .map((pagina, index, array) => (
                          <React.Fragment key={pagina}>
                            {index > 0 && array[index - 1] !== pagina - 1 && (
                              <Button variant="ghost" size="sm" disabled>
                                ...
                              </Button>
                            )}
                            <Button
                              variant={paginaAtual === pagina ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPaginaAtual(pagina)}
                            >
                              {pagina}
                            </Button>
                          </React.Fragment>
                        ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginaAtual === totalPaginas}
                        onClick={() => setPaginaAtual(paginaAtual + 1)}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-500 mb-2">Nenhuma conversa encontrada</p>
                  <p className="text-gray-400 mb-6">
                    {pesquisa ? 'Tente buscar com outros termos' : 'Comece conversando com os agentes IA'}
                  </p>
                  <Link to={createPageUrl("Agentes")}>
                    <Button>
                      Iniciar uma conversa
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 