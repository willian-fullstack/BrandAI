import { useState, useEffect } from "react";
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
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { agentesConfig } from "@/config/agentes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Conversas() {
  const [, setUser] = useState(null);
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
    navigate(`/app/chat?conversa=${conversaId}`);
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
      if (!dataString) return "Data indisponível";
      
      const data = new Date(dataString);
      if (isNaN(data.getTime())) {
        return "Data indisponível";
      }
      
      return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data indisponível";
    }
  };

  const formatarHora = (dataString) => {
    try {
      if (!dataString) return "";
      
      const data = new Date(dataString);
      if (isNaN(data.getTime())) {
        return "";
      }
      
      return format(data, "HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar hora:", error);
      return "";
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
          <span className="text-muted-foreground font-medium">Carregando conversas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Suas Conversas
              </h1>
              <p className="text-muted-foreground">
                Histórico completo de conversas com agentes IA
              </p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Buscar por título ou conteúdo..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && buscarConversas()}
                  className="flex-1"
                />
                <Button 
                  onClick={buscarConversas}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Histórico de Conversas
                </div>
                <span className="text-sm font-normal text-muted-foreground">
                  {totalConversas} {totalConversas === 1 ? 'conversa' : 'conversas'} encontradas
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {conversas.length > 0 ? (
                  <div className="space-y-3">
                    {conversas.map((conversa, index) => (
                      <motion.div
                        key={conversa.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navegarParaChat(conversa.id)}
                        className="p-4 hover:bg-secondary/50 rounded-lg transition-all duration-300 cursor-pointer border border-border backdrop-blur-sm"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)"
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-r ${agentesConfig[conversa.agente_id]?.cor || "from-gray-500 to-gray-600"} shadow-lg`}>
                              {agentesConfig[conversa.agente_id]?.icon || "🤖"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {conversa.titulo}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {agentesConfig[conversa.agente_id]?.nome || "Agente"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right text-sm text-muted-foreground">
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
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => excluirConversa(conversa.id, e)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">Nenhuma conversa encontrada</h3>
                    <p className="text-muted-foreground mb-6">Você ainda não iniciou conversas ou nenhuma corresponde à sua busca.</p>
                    <Link to={createPageUrl("Agentes")}>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Iniciar Nova Conversa
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex justify-between items-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={paginaAtual === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPaginaAtual(page)}
                        className={paginaAtual === page 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                          : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="disabled:opacity-50"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 