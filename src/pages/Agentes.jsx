import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { AgenteConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, Lock, ArrowRight, Crown, Zap, ArrowLeft, Bot, Sparkles, Loader2, Search, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { agentesConfig, planosConfig } from "@/config/agentes";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

export default function Agentes() {
  const [user, setUser] = useState(null);
  const [agentesConfigs, setAgentesConfigs] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar usuário
        const userData = await User.me();
        setUser(userData);
        
        // Carregar configurações dos agentes do backend
        const agentesData = await AgenteConfig.filter({ ativo: true });
        setAgentesConfigs(agentesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Função para mapear IDs do MongoDB para códigos de agentes
  const mapearIdParaCodigo = (id) => {
    // Encontrar o agente com o ID fornecido
    const agenteConfig = agentesConfigs.find(agente => agente._id === id);
    return agenteConfig ? agenteConfig.codigo : null;
  };

  // Admin tem acesso a todos os agentes
  const agentesDisponiveis = user ? (
    user.role === 'admin' 
      ? Object.keys(agentesConfig)
      : (() => {
          console.log("Agentes.jsx - Dados do usuário:", user);
          console.log("Agentes.jsx - Agentes liberados:", user.agentes_liberados);
          console.log("Agentes.jsx - Plano atual:", user.plano_atual);
          
          // Para usuários não-admin, precisamos verificar quais agentes estão disponíveis
          
          // 1. Obter os agentes do plano do usuário
          const agentesDoPlano = planosConfig[user.plano_atual]?.agentes || [];
          console.log("Agentes.jsx - Agentes do plano:", agentesDoPlano);
          
          // 2. Obter os agentes liberados manualmente pelo admin
          const agentesLiberadosIds = user.agentes_liberados || [];
          console.log("Agentes.jsx - Agentes liberados IDs:", agentesLiberadosIds);
          
          // 3. Mapear os IDs do MongoDB para códigos de agentes
          const agentesLiberadosCodigos = agentesLiberadosIds
            .map(id => mapearIdParaCodigo(id))
            .filter(codigo => codigo !== null);
          console.log("Agentes.jsx - Agentes liberados mapeados para códigos:", agentesLiberadosCodigos);
          
          // 4. Se o usuário tiver agentes liberados manualmente, usar esses
          // Caso contrário, usar os agentes do plano
          return agentesLiberadosCodigos.length > 0 
            ? agentesLiberadosCodigos 
            : agentesDoPlano;
        })()
  ) : [];
  
  console.log("Agentes disponíveis final:", agentesDisponiveis);

  // Categorias únicas de todos os agentes
  const categorias = ["Todos", ...new Set(
    Object.values(agentesConfig)
      .flatMap(agente => agente.categorias || [])
      .filter(Boolean)
  )];

  // Filtrar agentes por texto e categoria
  const agentesFiltrados = Object.entries(agentesConfig)
    .filter(([codigo, agente]) => {
      // Filtro de texto
      const matchTexto = filtro === "" || 
        agente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        agente.descricao.toLowerCase().includes(filtro.toLowerCase());
      
      // Filtro de categoria
      const matchCategoria = categoriaFiltro === "Todos" || 
        (agente.categorias && agente.categorias.includes(categoriaFiltro));
      
      return matchTexto && matchCategoria;
    })
    .map(([codigo, agente]) => ({
      codigo,
      ...agente,
      disponivel: user?.role === 'admin' || agentesDisponiveis.includes(codigo)
    }));

  // Função para iniciar uma conversa com um agente
  const iniciarConversa = (codigo) => {
    navigate(`/app/chat?agente=${codigo}`);
  };

  // Função para redirecionar para a página de planos
  const irParaPlanos = () => {
    navigate('/app/planos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-purple flex items-center justify-center mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground">Carregando agentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Agentes IA</h1>
          <p className="text-muted-foreground">
            Escolha um agente para iniciar uma conversa
          </p>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar agentes..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-between">
                {categoriaFiltro}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {categorias.map((categoria) => (
                <DropdownMenuItem 
                  key={categoria}
                  onClick={() => setCategoriaFiltro(categoria)}
                  className={categoriaFiltro === categoria ? "bg-primary/10" : ""}
                >
                  {categoria}
                  {categoriaFiltro === categoria && (
                    <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentesFiltrados.map(({ codigo, nome, descricao, icon, categorias, disponivel }) => (
          <Card 
            key={codigo} 
            className={`overflow-hidden transition-all duration-200 ${
              disponivel ? 'hover:shadow-md' : 'opacity-70'
            }`}
          >
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    codigo.includes('marketing') ? 'bg-gradient-blue' :
                    codigo.includes('visual') ? 'bg-gradient-purple' :
                    codigo.includes('seo') ? 'bg-gradient-green' :
                    'bg-gradient-orange'
                  }`}>
                    {icon ? (
                      typeof icon === 'string' ? (
                        <span className="text-white text-xl">{icon}</span>
                      ) : (
                        <icon className="h-6 w-6 text-white" />
                      )
                    ) : (
                      <Bot className="h-6 w-6 text-white" />
                    )}
                  </div>
                  {!disponivel && (
                    <div className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Bloqueado
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{nome}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {descricao}
                </p>
                
                {categorias && categorias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categorias.map((categoria, index) => (
                      <div 
                        key={index}
                        className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-xs"
                      >
                        {categoria}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-auto">
                  {disponivel ? (
                    <Button 
                      className="w-full"
                      onClick={() => iniciarConversa(codigo)}
                    >
                      Conversar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={irParaPlanos}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-primary" />
                      Fazer upgrade
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
