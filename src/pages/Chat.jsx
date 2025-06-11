import { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { AgenteConfig } from "@/api/entities"; // Importar AgenteConfig
import { InvokeLLM, GetGeneratedImages } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  ArrowLeft, 
  Bot,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  Wand2Icon
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  const [showDesignerInterface, setShowDesignerInterface] = useState(false);
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

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (conversaParam) {
        // Carregando conversa existente
        try {
          const conversaData = await Conversa.getById(conversaParam);
          
          if (conversaData) {
            setConversa(conversaData);
            setMensagens(conversaData.mensagens || []);

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
            navigate("/agentes", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Erro ao buscar conversa:", error);
          navigate("/agentes", { replace: true });
          return;
        }
      } else if (agenteParam) {
        // Verificar se o agente existe na configuração
        if (!agentesConfig[agenteParam]) {
          navigate("/agentes", { replace: true });
          return;
        }
        
        // Verificar se usuário tem acesso ao agente (admin tem acesso a todos)
        if (userData.role !== 'admin') {
          const planoAtual = planosConfig[userData.plano_atual] || planosConfig['basico'];
          const agentesDisponiveis = planoAtual.agentes;
          if (!agentesDisponiveis.includes(agenteParam)) {
            navigate("/planos", { replace: true });
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
        navigate("/agentes", { replace: true });
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      navigate("/dashboard", { replace: true });
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

    const mensagemUsuario = {
      tipo: "usuario",
      conteudo: novaMensagem.trim(),
      remetente: "usuario",
      timestamp: new Date().toISOString()
    };

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
        const mensagemErro = {
          tipo: "agente",
          conteudo: `Desculpe, este agente ainda não foi treinado. Para que eu possa ajudar você adequadamente, um administrador precisa:

1. Configurar instruções específicas para este agente no painel Admin
2. Fazer upload de documentos de treinamento

${user?.role === 'admin' ? `Como você é um administrador, pode [sincronizar os agentes](/admin?tab=agentes&sync=true) para resolver possíveis problemas de configuração.` : 'Acesse o painel Admin → Agentes IA para configurar este agente.'}`,
          remetente: "agente",
          timestamp: new Date().toISOString()
        };

        const mensagensFinais = [...novasMensagens, mensagemErro];
        setMensagens(mensagensFinais);
        setCarregando(false);
        return;
      }

      // Preparar contexto para o agente
      const contexto = novasMensagens.map(m => 
        `${m.tipo === 'usuario' ? 'Usuário' : 'Assistente'}: ${m.conteudo}`
      ).join('\n');

      // Usar apenas o prompt do arquivo de configuração
      const promptEspecifico = promptDoArquivoConfig || '';
      
      const prompt = `${promptEspecifico}

INSTRUÇÕES IMPORTANTES:
1. Use PRIMARIAMENTE as informações dos documentos de treinamento anexados
2. Mantenha sempre o foco na sua especialidade conforme definido nos documentos
3. Você pode usar conhecimento geral para complementar e enriquecer suas respostas, mas sempre dentro do contexto da sua especialidade
4. Se uma pergunta não estiver relacionada à sua área de especialidade definida nos documentos, redirecione educadamente para sua especialidade
5. Seja inteligente, útil e prático, sempre baseando suas respostas principais no conteúdo dos documentos

Histórico da conversa:
${contexto}

Responda de forma inteligente e útil, priorizando o conhecimento dos documentos de treinamento, mas complementando com expertise relevante quando apropriado:`;

      // Preparar URLs dos documentos
      const documentUrls = agenteConfigData?.documentos_treinamento?.map(doc => doc.caminho) || [];

      // Adicionar log para depuração
      if (documentUrls.length > 0) {
        console.log(`Enviando ${documentUrls.length} documentos para o LLM:`, documentUrls);
      } else {
        console.log('Nenhum documento anexado para enviar ao LLM');
      }

      // Chamar IA
      const requestParams = {
        prompt: prompt,
        agente_id: conversa.agente_id || agenteParam || conversa.agente || ''
      };

      console.log("Enviando request com agente_id:", requestParams.agente_id);

      // Adicionar documentos se existirem
      if (documentUrls.length > 0) {
        requestParams.file_urls = documentUrls;
      }

      const resposta = await InvokeLLM(requestParams);

      const mensagemAgente = {
        tipo: "agente",
        conteudo: resposta,
        remetente: "agente",
        timestamp: new Date().toISOString()
      };

      const mensagensFinais = [...novasMensagens, mensagemAgente];
      setMensagens(mensagensFinais);

      // Preparar dados da conversa para salvar
      let conversaParaSalvar = {
        ...conversa,
        mensagens: mensagensFinais
      };

      // Garantir que todos os campos obrigatórios estejam presentes
      if (!conversaParaSalvar.titulo) {
        conversaParaSalvar.titulo = `Conversa com ${agenteAtual.nome || 'Agente'}`;
      }
      
      // Garantir que o campo agente_id esteja sempre presente e seja o mesmo do agenteParam
      if (!conversaParaSalvar.agente_id) {
        conversaParaSalvar.agente_id = agenteParam || (conversaParaSalvar.agente ? conversaParaSalvar.agente : '');
      }

      try {
        let conversaSalva;
        
        if (conversa.id) {
          // Atualizar conversa existente
          conversaSalva = await Conversa.update(conversa.id, conversaParaSalvar);
        } else {
          // Criar nova conversa
          console.log("Criando nova conversa com dados:", JSON.stringify(conversaParaSalvar));
          conversaSalva = await Conversa.create(conversaParaSalvar);
          console.log("Conversa criada:", JSON.stringify(conversaSalva));
          
          if (conversaSalva && conversaSalva.id) {
            // Atualizar o estado com a conversa salva que contém o ID
            setConversa(conversaSalva);
            // Atualizar URL sem recarregar a página
            const novaUrl = createPageUrl(`Chat?conversa=${conversaSalva.id}`);
            window.history.replaceState({}, '', novaUrl);
          } else {
            console.error("Conversa criada sem ID:", conversaSalva);
            throw new Error("Conversa criada sem ID válido");
          }
        }
      } catch (error) {
        console.error("Erro ao salvar conversa:", error);
        // Não redirecionar em caso de erro, apenas mostrar alerta
        alert("Erro ao salvar conversa: " + (error.message || "Erro desconhecido"));
      }

      // Descontar crédito (apenas para não-admin)
      if (user?.role !== 'admin') {
        await User.updateMyUserData({
          creditos_restantes: (user.creditos_restantes || 0) - 1
        });
        setUser(prev => ({
          ...prev,
          creditos_restantes: (prev.creditos_restantes || 0) - 1
        }));
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleImageGenerated = async (imageUrl, prompt) => {
    setCarregando(true);
    try {
      const mensagemImagem = {
        tipo: "agente",
        conteudo: `Imagem gerada com sucesso! 

**Prompt usado:** ${prompt}

![Imagem gerada](${imageUrl})

Você pode fazer download da imagem clicando com o botão direito sobre ela e selecionando "Salvar imagem como...".

Precisa de alguma modificação ou outra imagem?`,
        remetente: "agente",
        timestamp: new Date().toISOString()
      };

      const mensagensFinais = [...mensagens, mensagemImagem];
      setMensagens(mensagensFinais);

      // Preparar dados da conversa para salvar
      let conversaParaSalvar = {
        ...conversa,
        mensagens: mensagensFinais
      };

      // Garantir que todos os campos obrigatórios estejam presentes
      if (!conversaParaSalvar.titulo) {
        conversaParaSalvar.titulo = `Conversa com ${agenteAtual.nome || 'Agente'}`;
      }
      
      if (!conversaParaSalvar.agente_id && conversaParaSalvar.agente) {
        conversaParaSalvar.agente_id = conversaParaSalvar.agente;
      }

      try {
        let conversaSalva;
        
        if (conversa.id) {
          // Atualizar conversa existente
          conversaSalva = await Conversa.update(conversa.id, conversaParaSalvar);
        } else {
          // Criar nova conversa
          console.log("Criando nova conversa com dados:", JSON.stringify(conversaParaSalvar));
          conversaSalva = await Conversa.create(conversaParaSalvar);
          console.log("Conversa criada:", JSON.stringify(conversaSalva));
          
          if (conversaSalva && conversaSalva.id) {
            // Atualizar o estado com a conversa salva que contém o ID
            setConversa(conversaSalva);
            // Atualizar URL sem recarregar a página
            const novaUrl = createPageUrl(`Chat?conversa=${conversaSalva.id}`);
            window.history.replaceState({}, '', novaUrl);
          } else {
            console.error("Conversa criada sem ID:", conversaSalva);
            throw new Error("Conversa criada sem ID válido");
          }
        }
      } catch (error) {
        console.error("Erro ao salvar conversa:", error);
        // Não redirecionar em caso de erro, apenas mostrar alerta
        alert("Erro ao salvar conversa: " + (error.message || "Erro desconhecido"));
      }

      // Descontar crédito (apenas para não-admin) for image generation
      if (user?.role !== 'admin') {
        await User.updateMyUserData({
          creditos_restantes: (user.creditos_restantes || 0) - 1
        });
        setUser(prev => ({
          ...prev,
          creditos_restantes: (prev.creditos_restantes || 0) - 1
        }));
      }

    } catch (error) {
      console.error("Erro ao processar imagem gerada:", error);
      alert("Erro ao processar imagem gerada.");
    } finally {
      setCarregando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!conversa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversa não encontrada</h2>
          <Link to={createPageUrl("Agentes")}>
            <Button>Voltar aos Agentes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Agentes")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${agenteAtual.cor} rounded-full flex items-center justify-center text-xl`}>
                {agenteAtual.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{agenteAtual.nome}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Agente IA Especializado</p>
                  {agenteConfigData?.documentos_treinamento?.length > 0 && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {agenteConfigData.documentos_treinamento.length} docs treinados
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-100 text-indigo-800">
              <Sparkles className="w-3 h-3 mr-1" />
              {user?.role === 'admin' ? '∞' : (user?.creditos_restantes || 0)} créditos
            </Badge>
            {user?.role === 'admin' && (
              <Badge className="bg-red-100 text-red-800">
                Admin
              </Badge>
            )}
            {(conversa.agente === 'designer' || conversa.agente_id === 'designer') && (
              <Button
                variant={showDesignerInterface ? "default" : "outline"}
                size="sm"
                className="ml-2"
                onClick={() => setShowDesignerInterface(!showDesignerInterface)}
              >
                <Wand2Icon className="w-4 h-4 mr-1" /> Gerador de Imagens
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Interface do Designer quando o botão é clicado ou quando é a primeira vez */}
          {((conversa.agente === 'designer' || conversa.agente_id === 'designer') && 
            (showDesignerInterface || mensagens.length === 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {mensagens.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Gerador de Imagens</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDesignerInterface(false)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              
              {mensagens.length === 0 && (
                <div className="text-center py-8">
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${agenteAtual.cor} rounded-full flex items-center justify-center text-3xl`}>
                    {agenteAtual.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Olá! Eu sou seu especialista em {agenteAtual.nome}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    Estou aqui para criar imagens personalizadas para sua marca. Posso gerar logotipos, artes para redes sociais, banners e muito mais!
                  </p>
                </div>
              )}
              
              <DesignerInterface 
                onImageGenerated={handleImageGenerated} 
                user={user} 
                agenteConfigData={agenteConfigData}
              />
            </motion.div>
          )}
          
          {mensagens.length === 0 && !(conversa.agente === 'designer' || conversa.agente_id === 'designer') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${agenteAtual.cor} rounded-full flex items-center justify-center text-3xl`}>
                {agenteAtual.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Olá! Eu sou seu especialista em {agenteAtual.nome}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Estou aqui para ajudar sua marca a crescer com estratégias comprovadas. Pode me perguntar qualquer coisa sobre {agenteAtual.nome.toLowerCase()}!
              </p>
            </motion.div>
          )}
          
          <AnimatePresence>
            {mensagens.map((mensagem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-3xl ${
                  mensagem.tipo === 'usuario' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    mensagem.tipo === 'usuario' 
                      ? 'bg-indigo-600' 
                      : `bg-gradient-to-r ${agenteAtual.cor}`
                  }`}>
                    {mensagem.tipo === 'usuario' ? (
                      <UserIcon className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    mensagem.tipo === 'usuario' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/80 backdrop-blur-sm text-gray-900 shadow-lg'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {/* Renderizar markdown simples para imagens */}
                      {mensagem.conteudo.includes('![') ? (
                        <div>
                          {mensagem.conteudo.split('\n').map((linha, i) => {
                            if (linha.includes('![') && linha.includes('](')) {
                              const match = linha.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                              if (match) {
                                return (
                                  <div key={i} className="my-4">
                                    <img 
                                      src={match[2]} 
                                      alt={match[1]} 
                                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                                      style={{ maxHeight: '400px' }}
                                    />
                                  </div>
                                );
                              }
                            }
                            return <p key={i}>{linha}</p>;
                          })}
                        </div>
                      ) : (
                        mensagem.conteudo
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {carregando && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${agenteAtual.cor}`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Pensando...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de Mensagem */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Interface especial para Designer quando há mensagens */}
          {conversa.agente === 'designer' && mensagens.length > 0 && (
            <div className="mb-4">
              <DesignerInterface 
                onImageGenerated={handleImageGenerated} 
                user={user} 
                agenteConfigData={agenteConfigData}
              />
            </div>
          )}
          
          {conversa.agente_id === 'designer' && previousImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Imagens recentes</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {previousImages.map((image, index) => (
                  <div 
                    key={image._id || index} 
                    className="flex-shrink-0 relative cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // Ao clicar na imagem, sugerir um prompt similar
                      setNovaMensagem(`Crie uma imagem similar a esta que eu gerei antes: ${image.prompt}`);
                    }}
                  >
                    <img 
                      src={image.image_url} 
                      alt={`Imagem ${index + 1}`}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-md flex items-center justify-center">
                      <span className="text-white opacity-0 hover:opacity-100">Usar</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Input
              placeholder={conversa.agente === 'designer' ? 
                "Descreva modificações ou peça uma nova imagem..." : 
                "Digite sua pergunta..."
              }
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && enviarMensagem()}
              disabled={carregando || (user?.role !== 'admin' && user?.creditos_restantes <= 0)}
              className="flex-1 bg-white/60 border-gray-200"
            />
            <Button 
              onClick={enviarMensagem}
              disabled={!novaMensagem.trim() || carregando || (user?.role !== 'admin' && user?.creditos_restantes <= 0)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {user?.role !== 'admin' && user?.creditos_restantes <= 0 && (
            <p className="text-center text-red-600 text-sm mt-2">
              Sem créditos disponíveis. 
              <Link to={createPageUrl("Planos")} className="underline ml-1">
                Faça upgrade do seu plano
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
