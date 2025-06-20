import { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { AgenteConfig } from "@/api/entities"; // Importar AgenteConfig
import { GetGeneratedImages, ConversarComAgente } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  ArrowLeft, 
  Bot,
  User as UserIcon,
  Sparkles,
  Wand2,
  Loader2,
  Settings,
  Trash2,
  ChevronRight
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DesignerInterface from "@/components/chat/DesignerInterface"; // Importar DesignerInterface
import { agentesConfig, planosConfig } from "@/config/agentes"; // Importar agentesConfig e planosConfig do arquivo centralizado

export default function Chat() {
  const [user, setUser] = useState(null);
  const [conversa, setConversa] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agenteConfigData, setAgenteConfigData] = useState(null); // Novo estado
  const [previousImages, setPreviousImages] = useState([]);
  const [showDesignerPanel, setShowDesignerPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pegar parâmetros da URL usando o hook do React Router
  const agenteParam = searchParams.get('agente');
  const conversaParam = searchParams.get('conversa');
  
  // Obter informações do agente atual
  const agenteAtual = conversa ? agentesConfig[conversa.agente_id] || {
    nome: "Agente",
    icon: "🤖",
    cor: "from-gray-500 to-gray-600"
  } : {
    nome: "Carregando...",
    icon: "⏳",
    cor: "from-gray-500 to-gray-600"
  };

  useEffect(() => {
    loadData();
  }, [agenteParam, conversaParam]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    if (conversa && !conversa.agente_id && conversa.agente) {
      setConversa({...conversa, agente_id: conversa.agente});
    }
  }, [conversa]);

  // Função para normalizar mensagens, garantindo que tipo e remetente estejam definidos
  const normalizarMensagem = (mensagem) => {
    // Se não tem tipo, mas tem remetente, usar remetente como tipo
    const tipo = mensagem.tipo || mensagem.remetente || 'agente';
    // Se não tem remetente, mas tem tipo, usar tipo como remetente
    const remetente = mensagem.remetente || mensagem.tipo || 'agente';
    
    return {
      ...mensagem,
      tipo,
      remetente
    };
  };

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Carregar configurações dos agentes do backend
      const agentesData = await AgenteConfig.filter({ ativo: true });
      const agentesConfigsData = agentesData || [];
      
      // Função para mapear IDs do MongoDB para códigos de agentes
      const mapearIdParaCodigo = (id) => {
        // Verificar se é um ID do MongoDB (24 caracteres hexadecimais)
        if (typeof id === 'string' && id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
          // Encontrar o agente com o ID fornecido
          const agenteConfig = agentesConfigsData.find(agente => agente._id === id);
          return agenteConfig ? agenteConfig.codigo : null;
        }
        // Se não for um ID válido, retornar o próprio valor (pode ser um código direto)
        return id;
      };

      if (conversaParam) {
        // Carregando conversa existente
        try {
          const conversaData = await Conversa.getById(conversaParam);
          
          if (conversaData) {
            // Verificar se usuário tem acesso ao agente da conversa (admin tem acesso a todos)
            if (userData.role !== 'admin') {
              console.log("Chat - Verificando acesso para conversa existente com agente:", conversaData.agente_id);
              
              // 1. Obter os agentes do plano do usuário
              const agentesDoPlano = planosConfig[userData.plano_atual]?.agentes || [];
              
              // 2. Obter os agentes liberados manualmente pelo admin
              const agentesLiberadosIds = userData.agentes_liberados || [];
              
              // 3. Mapear os IDs do MongoDB para códigos de agentes
              const agentesLiberadosCodigos = agentesLiberadosIds
                .map(id => mapearIdParaCodigo(id))
                .filter(codigo => codigo !== null);
              
              // 4. Verificar acesso
              const temAcessoPorPlano = agentesDoPlano.includes(conversaData.agente_id);
              const temAcessoManual = agentesLiberadosCodigos.includes(conversaData.agente_id);
              
              // Se não tem acesso, redirecionar para a página de conversas
              if (!temAcessoPorPlano && !temAcessoManual) {
                console.log("Chat - Usuário não tem mais acesso ao agente desta conversa, redirecionando");
                alert("Você não tem mais acesso a este agente. Faça upgrade do seu plano ou entre em contato com o suporte.");
                navigate("/app/conversas", { replace: true });
                return;
              }
            }
            
            setConversa(conversaData);
            setMensagens((conversaData.mensagens || []).map(normalizarMensagem));

            // Carregar configuração do agente para conversa existente
            try {
              const agentesConfigs = await AgenteConfig.filter({ codigo: conversaData.agente_id });
              if (agentesConfigs.length > 0) {
                setAgenteConfigData(agentesConfigs[0]);
              }
            } catch (error) {
              console.warn("Configuração do agente não encontrada para conversa existente:", error);
            }
          } else {
            // Usar o hook do React Router para navegar
            navigate("/app/agentes", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Erro ao buscar conversa:", error);
          navigate("/app/agentes", { replace: true });
          return;
        }
      } else if (agenteParam) {
        // Verificar se usuário tem acesso ao agente (admin tem acesso a todos)
        if (userData.role !== 'admin') {
          console.log("Chat - Verificando acesso para agente:", agenteParam);
          console.log("Chat - Dados do usuário:", userData);
          console.log("Chat - Agentes liberados:", userData.agentes_liberados);
          console.log("Chat - Plano atual:", userData.plano_atual);
          
          // Verificar se o agente existe na configuração
          if (!agentesConfig[agenteParam]) {
            console.log("Chat - Agente não encontrado na configuração");
            navigate("/app/agentes", { replace: true });
            return;
          }
          
          // 1. Obter os agentes do plano do usuário
          const agentesDoPlano = planosConfig[userData.plano_atual]?.agentes || [];
          console.log("Chat - Agentes do plano:", agentesDoPlano);
          
          // 2. Obter os agentes liberados manualmente pelo admin
          const agentesLiberadosIds = userData.agentes_liberados || [];
          console.log("Chat - Agentes liberados IDs:", agentesLiberadosIds);
          
          // 3. Mapear os IDs do MongoDB para códigos de agentes
          const agentesLiberadosCodigos = agentesLiberadosIds
            .map(id => mapearIdParaCodigo(id))
            .filter(codigo => codigo !== null);
          console.log("Chat - Agentes liberados mapeados para códigos:", agentesLiberadosCodigos);
          
          // 4. Verificar acesso
          const temAcessoPorPlano = agentesDoPlano.includes(agenteParam);
          const temAcessoManual = agentesLiberadosCodigos.includes(agenteParam);
          
          // Se não tem acesso, redirecionar
          if (!temAcessoPorPlano && !temAcessoManual) {
            console.log("Chat - Usuário não tem acesso ao agente, redirecionando");
            navigate("/app/planos", { replace: true });
            return;
          }
        }

        // Carregar configuração do agente
        try {
          const agentesConfigs = await AgenteConfig.filter({ codigo: agenteParam });
          if (agentesConfigs.length > 0) {
            setAgenteConfigData(agentesConfigs[0]);

            // Se for agente de designer, carregar imagens geradas anteriormente
            if (agenteParam === 'designer') {
              try {
                const imagesResult = await GetGeneratedImages(5); // Limite de 5 imagens
                setPreviousImages(imagesResult.images || []);
              } catch (error) {
                console.warn("Erro ao carregar imagens anteriores:", error);
              }
            }
          }
        } catch (error) {
          console.warn("Configuração do agente não encontrada:", error);
        }

        // Criar nova conversa com título e agente definidos corretamente
        const novaConversa = {
          usuario_id: userData.id,
          agente_id: agenteParam,
          titulo: `Conversa com ${agentesConfig[agenteParam]?.nome || 'Agente'}`,
          mensagens: []
        };
        
        console.log("Criando nova conversa inicial:", novaConversa);
        
        // Não salvar a conversa ainda, apenas definir no estado
        setConversa(novaConversa);
        setMensagens([]);
      } else {
        navigate("/app/agentes", { replace: true });
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      // Em vez de redirecionar para o dashboard, vamos para a página de agentes
      navigate("/app/agentes", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || carregando || !conversa) return;

    // Verificar créditos (admin tem créditos ilimitados)
    if (user?.role !== 'admin' && (user?.creditos_restantes <= 0)) {
      alert("Você não tem créditos suficientes. Faça upgrade do seu plano!");
      return;
    }

    // Verificar se o usuário ainda tem acesso ao agente (admin tem acesso a todos)
    if (user?.role !== 'admin') {
      try {
        // Carregar configurações dos agentes do backend para verificação atualizada
        const agentesData = await AgenteConfig.filter({ ativo: true });
        const agentesConfigsData = agentesData || [];
        
        // Função para mapear IDs do MongoDB para códigos de agentes
        const mapearIdParaCodigo = (id) => {
          // Verificar se é um ID do MongoDB (24 caracteres hexadecimais)
          if (typeof id === 'string' && id.length === 24 && /^[0-9a-f]{24}$/i.test(id)) {
            // Encontrar o agente com o ID fornecido
            const agenteConfig = agentesConfigsData.find(agente => agente._id === id);
            return agenteConfig ? agenteConfig.codigo : null;
          }
          // Se não for um ID válido, retornar o próprio valor (pode ser um código direto)
          return id;
        };
        
        // 1. Obter os agentes do plano do usuário
        const agentesDoPlano = planosConfig[user.plano_atual]?.agentes || [];
        
        // 2. Obter os agentes liberados manualmente pelo admin
        const agentesLiberadosIds = user.agentes_liberados || [];
        
        // 3. Mapear os IDs do MongoDB para códigos de agentes
        const agentesLiberadosCodigos = agentesLiberadosIds
          .map(id => mapearIdParaCodigo(id))
          .filter(codigo => codigo !== null);
        
        // 4. Verificar acesso
        const temAcessoPorPlano = agentesDoPlano.includes(conversa.agente_id);
        const temAcessoManual = agentesLiberadosCodigos.includes(conversa.agente_id);
        
        if (!temAcessoPorPlano && !temAcessoManual) {
          alert("Você não tem mais acesso a este agente. Faça upgrade do seu plano ou entre em contato com o suporte.");
          navigate("/app/conversas", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar acesso ao agente:", error);
        // Em caso de erro na verificação, permitir continuar para não interromper a experiência do usuário
      }
    }

    const mensagemUsuario = normalizarMensagem({
      tipo: "usuario",
      conteudo: novaMensagem.trim(),
      remetente: "usuario",
      timestamp: new Date().toISOString()
    });

    const novasMensagens = [...mensagens, mensagemUsuario];
    setMensagens(novasMensagens);
    setNovaMensagem("");
    setCarregando(true);

    try {
      // Verificar se o agente tem documentos ou prompt no arquivo de configuração
      const temDocumentos = agenteConfigData?.documentos_treinamento?.length > 0;
      
      console.log("Agente:", conversa.agente_id);
      console.log("Tem documentos:", temDocumentos, agenteConfigData?.documentos_treinamento);
      
      // Usar o prompt definido no arquivo de configuração centralizado
      const promptDoArquivoConfig = agentesConfig[conversa.agente_id]?.prompt;
      console.log("Prompt do arquivo de configuração:", promptDoArquivoConfig);
      
      // Se não há documentos e não há prompt no arquivo de configuração, não pode responder
      if (!temDocumentos && !promptDoArquivoConfig) {
        const mensagemErro = normalizarMensagem({
          tipo: "agente",
          conteudo: "Desculpe, este agente não está configurado corretamente. Entre em contato com o suporte.",
          remetente: "sistema",
          timestamp: new Date().toISOString()
        });
        setMensagens([...novasMensagens, mensagemErro]);
        setCarregando(false);
        return;
      }

      // Preparar histórico de mensagens para enviar para a API
      const historicoMensagens = novasMensagens.map(msg => ({
        role: msg.tipo === "usuario" ? "user" : "assistant",
        content: msg.conteudo
      }));

      // Adicionar prompt do sistema se existir no arquivo de configuração
      if (promptDoArquivoConfig) {
        historicoMensagens.unshift({
          role: "system",
          content: promptDoArquivoConfig
        });
      }

      // Chamar a API para obter resposta do agente
      console.log("Enviando histórico de mensagens:", historicoMensagens);
      
      // Obter a última mensagem do usuário (que deve ser a atual)
      const ultimaMensagemUsuario = novaMensagem.trim();
      
      // Verificar se temos as informações necessárias antes de chamar a API
      if (!conversa.agente_id) {
        console.error("ID do agente não definido");
        throw new Error("ID do agente não definido");
      }
      
      if (!ultimaMensagemUsuario) {
        console.error("Mensagem do usuário vazia");
        throw new Error("Mensagem do usuário vazia");
      }
      
      // Salvar a conversa primeiro, para garantir que não seja perdida mesmo se houver erro na API
      let conversaSalva = conversa;
      if (!conversa.id) {
        try {
          conversaSalva = await Conversa.create({
            ...conversa,
            mensagens: novasMensagens
          });
          setConversa(conversaSalva);
          // Atualizar URL para incluir o ID da conversa (sem replace: true para evitar problemas de navegação)
          navigate(`/app/chat?conversa=${conversaSalva.id}`);
        } catch (error) {
          console.error("Erro ao salvar conversa inicial:", error);
          // Continuar mesmo com erro para tentar obter a resposta
        }
      }
      
      const resposta = await ConversarComAgente(
        historicoMensagens,
        conversa.agente_id,
        temDocumentos ? agenteConfigData.documentos_treinamento : null
      );

      // Processar resposta
      if (resposta && resposta.resposta) {
        const mensagemAgente = normalizarMensagem({
          tipo: "agente",
          conteudo: resposta.resposta,
          remetente: "agente",
          timestamp: new Date().toISOString()
        });

        const mensagensAtualizadas = [...novasMensagens, mensagemAgente];
        setMensagens(mensagensAtualizadas);

        // Se já salvamos a conversa anteriormente, apenas atualizamos
        try {
          if (conversaSalva.id) {
            await Conversa.update(conversaSalva.id, {
              mensagens: mensagensAtualizadas
            });
          } else if (conversa.id) {
            // Caso tenha um ID mas não passamos pelo bloco anterior
            await Conversa.update(conversa.id, {
              mensagens: mensagensAtualizadas
            });
          } else {
            // Última tentativa para caso o salvamento anterior tenha falhado
            const novaSalva = await Conversa.create({
              ...conversa,
              mensagens: mensagensAtualizadas
            });
            setConversa(novaSalva);
            navigate(`/app/chat?conversa=${novaSalva.id}`);
          }
        } catch (error) {
          console.error("Erro ao atualizar conversa com resposta:", error);
          // Não interromper o fluxo por erro de salvamento
        }
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const mensagemErro = normalizarMensagem({
        tipo: "agente",
        conteudo: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
        remetente: "sistema",
        timestamp: new Date().toISOString()
      });
      setMensagens([...novasMensagens, mensagemErro]);
    } finally {
      setCarregando(false);
    }
  };

  const handleImageGenerated = async (imageUrl, prompt) => {
    if (!imageUrl || !conversa) return;

    // Limpar URL para evitar problemas com caracteres especiais
    const cleanUrl = imageUrl.trim()
      .replace(/[\n\r\t]/g, '')
      .replace(/&amp;/g, '&')
      .replace(/\\/g, '/');

    console.log("URL da imagem gerada:", cleanUrl);

    // Criar mensagem do usuário com o prompt
    const mensagemUsuario = normalizarMensagem({
      tipo: "usuario",
      conteudo: `Gere uma imagem: ${prompt}`,
      remetente: "usuario",
      timestamp: new Date().toISOString()
    });

    // Criar mensagem do agente com a imagem em formato JSON
    const mensagemAgente = normalizarMensagem({
      tipo: "agente",
      conteudo: JSON.stringify({
        image_url: cleanUrl,
        prompt: prompt || "Imagem gerada pela IA"
      }),
      remetente: "agente",
      timestamp: new Date().toISOString()
    });

    const novasMensagens = [...mensagens, mensagemUsuario, mensagemAgente];
    setMensagens(novasMensagens);

    // Rolar para o final
    setTimeout(scrollToBottom, 100);

    // Salvar ou atualizar conversa
    try {
      if (!conversa.id) {
        const conversaSalva = await Conversa.create({
          ...conversa,
          mensagens: novasMensagens
        });
        setConversa(conversaSalva);
        navigate(`/app/chat?conversa=${conversaSalva.id}`);
      } else {
        await Conversa.update(conversa.id, {
          mensagens: novasMensagens
        });
      }
    } catch (error) {
      console.error("Erro ao salvar conversa com imagem:", error);
    }
  };

  // Função para formatar datas corretamente, evitando "Invalid Date"
  const formatarData = (dataString) => {
    if (!dataString) return "Data desconhecida";
    
    try {
      const data = new Date(dataString);
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        return "Data inválida";
      }
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  // Função para alternar a visibilidade do painel do Designer
  const toggleDesignerPanel = () => {
    setShowDesignerPanel(!showDesignerPanel);
  };

  // Renderização condicional para estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-purple flex items-center justify-center mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Cabeçalho */}
      <header className={`fixed top-16 border-b border-border py-3 flex items-center justify-between z-10 bg-background ${
        conversa?.agente_id?.toLowerCase().includes('designer') && showDesignerPanel 
          ? 'lg:w-[60%] lg:left-64 left-0 right-0 border-r border-border px-4' 
          : 'lg:left-64 lg:right-0 left-0 right-0 px-4'
      }`}>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate("/app/agentes")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
              conversa?.agente_id?.includes('marketing') ? 'bg-gradient-blue' :
              conversa?.agente_id?.includes('visual') ? 'bg-gradient-purple' :
              conversa?.agente_id?.includes('seo') ? 'bg-gradient-green' :
              'bg-gradient-orange'
            }`}>
              {agenteAtual.icon ? (
                typeof agenteAtual.icon === 'string' ? (
                  <span className="text-white">{agenteAtual.icon}</span>
                ) : (
                  <agenteAtual.icon className="h-5 w-5 text-white" />
                )
              ) : (
                <Bot className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="font-medium text-lg">{agenteAtual.nome || "Agente IA"}</h1>
                <p className="text-xs text-muted-foreground">{conversa?.titulo || "Nova conversa"}</p>
              </div>
              
              {/* Botão para toggle do Designer IA (apenas para o agente Designer) */}
              {conversa?.agente_id?.toLowerCase().includes('designer') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 flex items-center gap-1"
                  onClick={toggleDesignerPanel}
                >
                  <Wand2 className="h-4 w-4 mr-1" />
                  {showDesignerPanel ? 'Esconder Designer' : 'Mostrar Designer'}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-glass border border-border z-50">
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja excluir esta conversa?")) {
                        // Implementar exclusão
                        navigate('/conversas');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir conversa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Área principal - Layout em duas colunas quando for Designer IA */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Coluna da conversa (sempre presente) */}
        <div className={`flex flex-col ${
          conversa?.agente_id?.toLowerCase().includes('designer') && showDesignerPanel 
            ? 'w-full lg:w-[70%] border-r border-border pr-8' 
            : 'w-full'
        } lg:ml-0 relative`}>
          {/* Área de mensagens com rolagem */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
            {/* Mensagem de boas-vindas */}
            {mensagens.length === 0 && (
              <div className="flex justify-center py-8">
                <div className="glass-card p-6 max-w-lg text-center">
                  <div className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    conversa?.agente_id?.includes('marketing') ? 'bg-gradient-blue' :
                    conversa?.agente_id?.includes('visual') ? 'bg-gradient-purple' :
                    conversa?.agente_id?.includes('seo') ? 'bg-gradient-green' :
                    'bg-gradient-orange'
                  }`}>
                    {agenteAtual.icon ? (
                      typeof agenteAtual.icon === 'string' ? (
                        <span className="text-white text-2xl">{agenteAtual.icon}</span>
                      ) : (
                        <agenteAtual.icon className="h-8 w-8 text-white" />
                      )
                    ) : (
                      <Bot className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    {agenteAtual.nome || "Agente IA"}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {agenteAtual.descricao || "Este agente está pronto para ajudar você com suas necessidades."}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {user?.role !== 'admin' && (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Créditos disponíveis: {user?.creditos_restantes || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de mensagens */}
            <AnimatePresence>
              {mensagens.map((mensagem, index) => {
                const isUserMessage = mensagem.tipo === "usuario";
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isUserMessage ? "justify-end pr-8" : "justify-start pl-2"} mb-4`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-lg p-4 shadow-sm ${
                        isUserMessage 
                          ? "bg-primary text-primary-foreground border border-primary/30" 
                          : "bg-card border border-border"
                      }`}
                      style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isUserMessage
                            ? "bg-primary-foreground/20"
                            : "bg-primary/20"
                        }`}>
                          {isUserMessage ? (
                            <UserIcon className={`w-4 h-4 ${isUserMessage ? "text-primary-foreground" : "text-primary"}`} />
                          ) : (
                            <Bot className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm font-medium">
                          {isUserMessage ? "Você" : agenteAtual.nome}
                        </p>
                        <p className="text-xs ml-auto opacity-70">
                          {formatarData(mensagem.timestamp)}
                        </p>
                      </div>
                      <div className="mt-2 break-words">
                        {formatMessageContent(mensagem.conteudo)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Indicador de digitação */}
            {carregando && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start pl-2 mb-4"
              >
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm max-w-[85%]" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium">{agenteAtual.nome || "Agente"}</div>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "400ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Referência para rolagem automática */}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de entrada de mensagem (sempre fixo no fundo) */}
          <div className={`border-t border-border p-4 fixed bottom-0 bg-background/95 backdrop-blur-sm z-20 shadow-lg ${
            conversa?.agente_id?.toLowerCase().includes('designer') && showDesignerPanel 
              ? 'lg:left-64 lg:right-[30%] left-0 right-0'
              : 'lg:left-64 lg:right-0 left-0 right-0'
          }`}>
            <div className="w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviarMensagem();
                }}
                className="flex gap-2 w-full"
              >
                <Input
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-secondary border-border focus:border-primary"
                  disabled={carregando}
                />
                <Button
                  type="submit"
                  disabled={!novaMensagem.trim() || carregando}
                  className="bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  {carregando ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {user?.role !== 'admin' && (
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Créditos disponíveis: {user?.creditos_restantes || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna do Designer (fixo à direita, condicional) */}
        {conversa?.agente_id?.toLowerCase().includes('designer') && showDesignerPanel && (
          <div className="w-full lg:w-[30%] bg-background flex flex-col h-full overflow-hidden fixed right-0 top-16 bottom-0 z-10 lg:block hidden">
            <div className="p-4 bg-muted/30 flex items-center justify-between border-b border-border sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Gerador de Imagens</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDesignerPanel}
                className="ml-auto"
                title="Esconder painel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto h-full pb-6">
              <DesignerInterface 
                onImageGenerated={handleImageGenerated}
                user={user}
                agenteConfigData={agenteConfigData}
                previousImages={previousImages}
              />
            </div>
          </div>
        )}

        {/* Versão móvel do Designer - Botão flutuante para mostrar/esconder */}
        {conversa?.agente_id?.toLowerCase().includes('designer') && (
          <div className="lg:hidden fixed right-4 bottom-20 z-30">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary shadow-lg"
              onClick={toggleDesignerPanel}
            >
              <Wand2 className="h-6 w-6 text-primary-foreground" />
            </Button>
          </div>
        )}

        {/* Painel móvel do Designer */}
        {conversa?.agente_id?.toLowerCase().includes('designer') && showDesignerPanel && (
          <div className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex flex-col">
            <div className="p-4 bg-muted/30 flex items-center justify-between border-b border-border sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Gerador de Imagens</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDesignerPanel}
                className="ml-auto"
                title="Fechar painel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DesignerInterface 
                onImageGenerated={(url, prompt) => {
                  handleImageGenerated(url, prompt);
                  toggleDesignerPanel(); // Fechar o painel após gerar a imagem em dispositivos móveis
                }}
                user={user}
                agenteConfigData={agenteConfigData}
                previousImages={previousImages}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Função para renderizar o conteúdo da mensagem, incluindo imagens
function formatMessageContent(content) {
  if (!content) return null;

  // Verificar se é um texto JSON
  if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
    try {
      const jsonContent = JSON.parse(content);
      
      // Se for um objeto com campo 'image_url' ou 'url'
      if (jsonContent && (jsonContent.image_url || jsonContent.url)) {
        const imageUrl = jsonContent.image_url || jsonContent.url;
        
        // Verificar se é um URL válido e limpar caracteres problemáticos
        try {
          const cleanUrl = imageUrl.trim()
            .replace(/[\n\r\t]/g, '')
            .replace(/&amp;/g, '&')
            .replace(/\\/g, '/');
            
          return (
            <div className="flex flex-col items-center my-4 w-full">
              <div className="relative w-full max-w-md bg-secondary/20 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={cleanUrl} 
                  alt="Imagem gerada" 
                  className="w-full h-auto object-contain rounded-lg"
                  style={{ maxHeight: '400px' }}
                  loading="lazy"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem:", cleanUrl);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzJhMmEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+SW1hZ2VtIGluZGlzcG9uw612ZWw8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5FcnJvIGFvIGNhcnJlZ2FyIGltYWdlbTwvdGV4dD48L3N2Zz4=';
                    e.target.alt = 'Imagem indisponível';
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{jsonContent.prompt || "Imagem gerada pela IA"}</p>
            </div>
          );
        } catch (error) {
          console.error("Erro ao processar URL da imagem:", error);
          return <p className="text-rose-500">Erro ao carregar imagem: URL inválida</p>;
        }
      }
      
      // Se for outro tipo de objeto JSON, exibir como texto formatado
      return <pre className="bg-secondary/30 p-3 rounded-md overflow-auto text-xs my-2">{JSON.stringify(jsonContent, null, 2)}</pre>;
    } catch (error) {
      // Se falhar ao analisar JSON, tratar como texto normal
      console.error("Erro ao analisar JSON:", error);
    }
  }

  // Processar links em texto normal
  let processedContent = content;
  
  // Substituir URLs por links clicáveis
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  processedContent = processedContent.replace(urlRegex, (url) => {
    // Verificar se parece ser uma URL de imagem
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImageUrl = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    
    if (isImageUrl) {
      return `<img-url>${url}</img-url>`;
    }
    
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
  });
  
  // Processar tags de imagem Markdown ![alt](url)
  const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  processedContent = processedContent.replace(markdownImageRegex, (match, alt, url) => {
    return `<img-url data-alt="${alt || 'Imagem'}">${url}</img-url>`;
  });
  
  // Processar tags de imagem especiais
  const parts = processedContent.split(/<img-url.*?>|<\/img-url>/);
  const imgMatches = processedContent.match(/<img-url.*?>(.*?)<\/img-url>/g) || [];
  
  if (imgMatches.length > 0) {
    return (
      <div>
        {parts.map((part, index) => {
          // Índices pares são texto normal, ímpares são URLs de imagens
          if (index % 2 === 0) {
            return part ? <div key={index} dangerouslySetInnerHTML={{ __html: part }} /> : null;
          } else {
            const imgMatch = imgMatches[Math.floor(index / 2)];
            const urlMatch = /<img-url.*?>(.*?)<\/img-url>/.exec(imgMatch);
            const altMatch = /data-alt="(.*?)"/.exec(imgMatch);
            
            if (urlMatch && urlMatch[1]) {
              const url = urlMatch[1];
              const alt = altMatch ? altMatch[1] : 'Imagem';
              
              // Limpar URLs que possam conter caracteres inválidos
              const cleanUrl = url.trim()
                .replace(/[\n\r\t]/g, '')
                .replace(/&amp;/g, '&')
                .replace(/\\/g, '/');
              
              return (
                <div key={index} className="my-4 flex flex-col items-center">
                  <div className="relative w-full max-w-md bg-secondary/20 rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={cleanUrl} 
                      alt={alt} 
                      className="w-full h-auto object-contain rounded-lg"
                      style={{ maxHeight: '400px' }}
                      loading="lazy"
                      onError={(e) => {
                        console.error("Erro ao carregar imagem:", cleanUrl);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzJhMmEyYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+SW1hZ2VtIGluZGlzcG9uw612ZWw8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5FcnJvIGFvIGNhcnJlZ2FyIGltYWdlbTwvdGV4dD48L3N2Zz4=';
                        e.target.alt = 'Imagem indisponível';
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{alt}</p>
                </div>
              );
            } else {
              return null;
            }
          }
        })}
      </div>
    );
  }
  
  // Formatar markdown básico: ** para negrito, * para itálico
  processedContent = processedContent
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-secondary/30 px-1 py-0.5 rounded text-xs">$1</code>');
  
  // Substituir quebras de linha por <br>
  processedContent = processedContent.replace(/\n/g, '<br>');
  
  return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
}

