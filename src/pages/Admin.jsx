import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Indicacao } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { AgenteConfig } from "@/api/entities";
import { ConfiguracaoPagamento } from "@/api/entities";
import { ConfiguracaoIA } from "@/api/entities";
import { ConfiguracaoPlanos } from "@/api/entities";
import { UploadTrainingDocument } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  DollarSign,
  MessageSquare,
  Crown,
  CheckCircle,
  BarChart,
  Settings,
  Upload,
  FileText,
  Bot,
  Save,
  Trash2,
  Edit,
  RefreshCcw,
  AlertCircle,
  ArrowLeft,
  Plus,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Importar o agentesConfig do arquivo centralizado
import { agentesConfig, planosConfig } from "@/config/agentes";

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [indicacoes, setIndicacoes] = useState([]);
  const [conversas, setConversas] = useState([]);
  const [agentesConfigs, setAgentesConfigs] = useState([]);
  const [configPagamento, setConfigPagamento] = useState({});
  const [configIA, setConfigIA] = useState({});
  const [configPlanos, setConfigPlanos] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingOfertas, setLoadingOfertas] = useState(false);
  const [editandoAgente, setEditandoAgente] = useState(null);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [agenteAtual, setAgenteAtual] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    instrucoes_sistema: '',
    modelo_ia: 'gpt-4o',
    temperatura: 0.7,
    max_tokens: 4000,
    icon: 'robot',
    cor: '#3B82F6',
    ativo: true,
    documentos_treinamento: []
  });
  const [notificacao, setNotificacao] = useState({ tipo: null, mensagem: '' });
  const [sincronizacaoInfo, setSincronizacaoInfo] = useState({
    agentesExcedentes: 0,
    sincronizando: false
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  // Verificar parâmetro de sincronização na URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shouldSync = queryParams.get('sync') === 'true';
    const tabParam = queryParams.get('tab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (shouldSync && sincronizacaoInfo.agentesExcedentes > 0) {
      // Remover o parâmetro da URL para evitar sincronizações repetidas
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Executar sincronização após um pequeno delay para garantir que a interface foi carregada
      setTimeout(() => {
        sincronizarAgentes();
      }, 1000);
    }
  }, [location.search, sincronizacaoInfo.agentesExcedentes]);

  // Adicionar useEffect para detectar mudanças de tema
  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail.theme);
    };
    
    document.addEventListener('themeChanged', handleThemeChange);
    return () => document.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Adicionar um useEffect para recarregar os dados quando o usuário muda para a aba de ofertas
  useEffect(() => {
    if (activeTab === "ofertas") {
      console.log("Aba de ofertas selecionada, recarregando dados...");
      loadConfigPlanos();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar usuários com informações completas
      const usersResponse = await User.getAll();
      if (usersResponse && usersResponse.users) {
        // Garantir que os dados dos usuários estejam completos
        const usuariosCompletos = await Promise.all(
          usersResponse.users.map(async (user) => {
            try {
              // Buscar informações detalhadas de cada usuário
              const userDetails = await User.getById(user._id);
              return userDetails;
            } catch (error) {
              console.error(`Erro ao carregar detalhes do usuário ${user._id}:`, error);
              return user; // Retornar usuário original em caso de erro
            }
          })
        );
        setUsuarios(usuariosCompletos);
      } else {
        setUsuarios([]);
      }
      
      // Carregar agentes
      const agentesResponse = await AgenteConfig.getAll();
      setAgentesConfigs(agentesResponse || []);
      
      // Carregar conversas
      const conversasResponse = await Conversa.getAll();
      setConversas(conversasResponse || []);
      
      // Carregar indicações
      const indicacoesResponse = await Indicacao.getAll();
      setIndicacoes(indicacoesResponse || []);
      
      // Carregar configurações de planos
      await loadConfigPlanos();
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarConfigPagamento = async () => {
    try {
      if (configPagamento.id) {
        await ConfiguracaoPagamento.update(configPagamento.id, configPagamento);
      } else {
        const createdConfig = await ConfiguracaoPagamento.create(configPagamento);
        setConfigPagamento(createdConfig); // Atualiza com o ID retornado
      }
      alert("Configurações de pagamento salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar config de pagamento:", error);
      alert("Erro ao salvar configurações de pagamento.");
    }
  };

  const handleSalvarConfigIA = async () => {
    try {
      if (configIA.id) {
        await ConfiguracaoIA.update(configIA.id, configIA);
      } else {
        const createdConfig = await ConfiguracaoIA.create(configIA);
        setConfigIA(createdConfig); // Atualiza com o ID retornado
      }
      alert("Configurações de IA salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar config de IA:", error);
      alert("Erro ao salvar configurações de IA.");
    }
  };

  const handleSalvarAgente = async (agenteConfigParaSalvar) => {
    try {
      // Sempre usar o código do agente como identificador principal
      if (agenteConfigParaSalvar.codigo) {
        await AgenteConfig.update(agenteConfigParaSalvar.codigo, {
          ...agenteConfigParaSalvar,
          ultima_atualizacao: new Date().toISOString()
        });
      } else {
                  // Garantir que todos os campos obrigatórios estejam presentes
          const agenteCompleto = {
            codigo: agenteConfigParaSalvar.codigo || '',
            nome: agenteConfigParaSalvar.nome || '',
            descricao: agenteConfigParaSalvar.descricao || '',
            instrucoes_sistema: agenteConfigParaSalvar.instrucoes_sistema || '',
            modelo_ia: agenteConfigParaSalvar.modelo_ia || 'gpt-4o',
            temperatura: agenteConfigParaSalvar.temperatura || 0.7,
            max_tokens: agenteConfigParaSalvar.max_tokens || 4000,
            icon: agenteConfigParaSalvar.icon || 'robot',
            cor: agenteConfigParaSalvar.cor || '#3B82F6',
            ativo: agenteConfigParaSalvar.ativo !== undefined ? agenteConfigParaSalvar.ativo : true,
            ultima_atualizacao: new Date().toISOString()
          };
        
        await AgenteConfig.create(agenteCompleto);
      }
      setEditandoAgente(null);
      await loadData();
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Agente salvo com sucesso!'
      });
    } catch (error) {
      console.error("Erro ao salvar agente:", error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao salvar agente: ${error.message || 'Erro desconhecido'}`
      });
    }
  };

  const handleUploadDocumento = async (file, agenteConfig) => {
    setUploadingFile(true);
    try {
      // Usar a função de upload de documento de treinamento
      await uploadDocumentoTreinamento(agenteConfig.codigo, file);
      
      // Recarregar os dados dos agentes para mostrar o documento adicionado
      await loadData();
      
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Documento de treinamento enviado com sucesso!'
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao fazer upload do documento: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const inicializarAgentes = async () => {
    console.log("Iniciando função inicializarAgentes...");
    setSincronizacaoInfo({
      ...sincronizacaoInfo,
      sincronizando: true
    });
    
    const agentesBase = Object.keys(agentesConfig).map(tipo => ({
      codigo: tipo,
      nome: agentesConfig[tipo].nome,
      descricao: `Agente especializado em ${agentesConfig[tipo].nome} para marcas de roupa.`,
      instrucoes_sistema: tipo === 'designer' ? 
        `Você é um designer especialista em criação de imagens para marcas de roupa usando IA.

SUAS CARACTERÍSTICAS:
- Você cria imagens personalizadas baseadas nas instruções dos documentos de treinamento
- Suas criações são focadas em marcas de roupa e moda
- Você pode gerar logos, artes para redes sociais, banners, embalagens e materiais visuais
- Você é criativo mas sempre alinhado com o briefing fornecido nos documentos

IMPORTANTE: Use os documentos de treinamento para entender o estilo, cores, tipografia e identidade visual da marca antes de criar qualquer imagem.` :
        `Você é um especialista em ${agentesConfig[tipo].nome} para marcas de roupa. 

SUAS CARACTERÍSTICAS:
- Você é inteligente e experiente na sua área de especialidade
- Suas respostas são baseadas PRIMARIAMENTE nos documentos de treinamento fornecidos
- Você pode usar conhecimento geral para complementar e enriquecer suas respostas, mas sempre dentro do contexto da sua especialidade
- Você é prático, útil e focado em resultados reais

IMPORTANTE: Os documentos de treinamento definem sua personalidade, conhecimento específico e abordagem. Use-os como base principal, mas seja inteligente e completo nas suas respostas.`,
      modelo_ia: 'gpt-4o',
      temperatura: 0.7,
      max_tokens: 4000,
      icon: agentesConfig[tipo].icon || 'robot',
      cor: agentesConfig[tipo].cor || '#3B82F6',
      ativo: true,
      documentos_treinamento: [],
      status: "ativo",
      ultima_atualizacao: new Date().toISOString()
    }));

    console.log("Agentes base preparados:", agentesBase.length);
    
    try {
      console.log("Agentes a inicializar:", agentesBase.map(a => a.codigo).join(", "));
      
      // Verificar se existem agentes no banco de dados
      console.log("Agentes existentes no banco:", 
        Array.isArray(agentesConfigs) 
          ? agentesConfigs.map(a => a.codigo).join(", ") || "Nenhum" 
          : "Nenhum"
      );
      
      let atualizou = false;
      let agentesAdicionados = [];
      
      for (const agente of agentesBase) {
        const existe = Array.isArray(agentesConfigs) 
          ? agentesConfigs.find(a => a.codigo === agente.codigo) 
          : null;
          
        if (!existe) {
          console.log(`Criando agente no banco: ${agente.codigo}`);
          try {
            const resultado = await AgenteConfig.create(agente);
            console.log(`Agente ${agente.codigo} criado com sucesso:`, resultado);
            agentesAdicionados.push(agente.codigo);
            atualizou = true;
          } catch (err) {
            console.error(`Erro ao criar agente ${agente.codigo}:`, err);
          }
        } else {
          console.log(`Agente ${agente.codigo} já existe, pulando.`);
        }
      }
      
      if (atualizou) {
        console.log("Agentes adicionados:", agentesAdicionados.join(", "));
        await loadData(); // Recarregar dados após a criação
        setNotificacao({
          tipo: 'sucesso',
          mensagem: `Agentes inicializados com sucesso! Adicionados: ${agentesAdicionados.join(", ")}`
        });
      } else {
        console.log("Nenhum agente novo foi adicionado");
        setNotificacao({
          tipo: 'info',
          mensagem: "Todos os agentes base já estão configurados."
        });
      }
    } catch (error) {
      console.error("Erro geral ao inicializar agentes:", error);
      console.error("Detalhes do erro:", error.response || error.message || error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao inicializar agentes: ${error.message || "Erro desconhecido"}`
      });
    } finally {
      setSincronizacaoInfo({
        ...sincronizacaoInfo,
        sincronizando: false
      });
    }
  };

  const handleSalvarConfigPlanos = async () => {
    try {
      setLoading(true);
      
      // Converter valores para número, garantindo que não sejam strings
      const configPlanosFormatado = {
        ...configPlanos,
        plano_basico_preco_mensal: Number(configPlanos.plano_basico_preco_mensal || 67),
        plano_basico_preco_anual: Number(configPlanos.plano_basico_preco_anual || 597),
        plano_intermediario_preco_mensal: Number(configPlanos.plano_intermediario_preco_mensal || 97),
        plano_intermediario_preco_anual: Number(configPlanos.plano_intermediario_preco_anual || 897),
        plano_premium_preco_mensal: Number(configPlanos.plano_premium_preco_mensal || 197),
        plano_premium_preco_anual: Number(configPlanos.plano_premium_preco_anual || 1997)
      };
      
      console.log("Salvando configurações de planos:", configPlanosFormatado);
      
      try {
        // Primeiro, buscar todas as configurações existentes
        const todasConfiguracoes = await ConfiguracaoPlanos.getAll();
        
        if (configPlanosFormatado.id) {
          // Se já temos um ID, atualizamos diretamente
          await ConfiguracaoPlanos.update(configPlanosFormatado.id, configPlanosFormatado);
          setNotificacao({
            tipo: 'sucesso',
            mensagem: 'Configurações de planos atualizadas com sucesso!'
          });
        } else if (todasConfiguracoes && todasConfiguracoes.length > 0) {
          // Se não temos ID mas existem configurações, atualizamos a primeira encontrada
          const primeiraConfig = todasConfiguracoes[0];
          console.log("Atualizando configuração existente:", primeiraConfig._id);
          
          await ConfiguracaoPlanos.update(primeiraConfig._id, {
            ...configPlanosFormatado,
            // Manter os campos originais que não estamos alterando
            codigo: primeiraConfig.codigo,
            nome: primeiraConfig.nome,
            descricao: primeiraConfig.descricao,
            ativo: primeiraConfig.ativo,
            recursos: primeiraConfig.recursos || []
          });
          
          setNotificacao({
            tipo: 'sucesso',
            mensagem: 'Configurações de planos atualizadas com sucesso!'
          });
        } else {
          // Se não existem configurações, criamos uma nova
          const novaConfiguracao = {
            codigo: 'config-principal',
            nome: 'Configuração Principal',
            descricao: 'Configuração principal de planos do sistema',
            preco_mensal: configPlanosFormatado.plano_basico_preco_mensal,
            preco_anual: configPlanosFormatado.plano_basico_preco_anual,
            limite_conversas_diarias: 100,
            limite_mensagens_por_conversa: 100,
            plano_basico_preco_mensal: configPlanosFormatado.plano_basico_preco_mensal,
            plano_basico_preco_anual: configPlanosFormatado.plano_basico_preco_anual,
            plano_intermediario_preco_mensal: configPlanosFormatado.plano_intermediario_preco_mensal,
            plano_intermediario_preco_anual: configPlanosFormatado.plano_intermediario_preco_anual,
            plano_premium_preco_mensal: configPlanosFormatado.plano_premium_preco_mensal,
            plano_premium_preco_anual: configPlanosFormatado.plano_premium_preco_anual,
            recursos_inclusos: [],
            recursos_exclusivos: [],
            agentes_disponiveis: []
          };
          
          console.log("Criando nova configuração de planos:", novaConfiguracao);
          const createdConfig = await ConfiguracaoPlanos.create(novaConfiguracao);
          setConfigPlanos(createdConfig);
          setNotificacao({
            tipo: 'sucesso',
            mensagem: 'Configurações de planos criadas com sucesso!'
          });
        }
      } catch (apiError) {
        console.error("Erro na API:", apiError);
        setNotificacao({
          tipo: 'erro',
          mensagem: `Erro na API: ${apiError.message || 'Erro desconhecido'}`
        });
      }
      
      // Recarregar dados para garantir que estamos com os valores mais atualizados
      await loadConfigPlanos();
    } catch (error) {
      console.error("Erro ao salvar configurações de planos:", error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao salvar configurações de planos: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocumentoTreinamento = async (agenteId, file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('document', file);
      
      const resultado = await UploadTrainingDocument(agenteId, formData);
      
      // Atualizar a lista de agentes após o upload
      await loadData();
      
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Documento de treinamento enviado com sucesso!'
      });
      return resultado;
    } catch (error) {
      console.error('Erro ao enviar documento de treinamento:', error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao enviar documento: ${error.message || 'Erro desconhecido'}`
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const atualizarConfigPlanos = (e) => {
    const { name, value } = e.target;
    
    // Garantir que o valor seja um número quando for um campo numérico
    const valorProcessado = name.includes('preco') ? 
      (value === '' ? '' : Number(value)) : 
      value;
    
    setConfigPlanos(prev => ({
      ...prev,
      [name]: valorProcessado
    }));
  };

  const handleExcluirDocumento = async (agenteConfig, documentoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento de treinamento?')) {
      return;
    }
    
    try {
      setLoading(true);
      await AgenteConfig.deleteDocumento(agenteConfig.codigo, documentoId);
      
      // Recarregar os dados dos agentes para atualizar a lista
      await loadData();
      
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Documento de treinamento excluído com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao excluir documento: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirAgente = async (agente) => {
    if (!window.confirm(`Tem certeza que deseja excluir o agente "${agente.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await AgenteConfig.delete(agente.codigo);
      
      // Recarregar os dados dos agentes
      await loadData();
      
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Agente excluído com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao excluir agente:', error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao excluir agente: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const sincronizarAgentes = async () => {
    if (!window.confirm('Tem certeza que deseja sincronizar os agentes? Esta ação excluirá agentes que não estão definidos no frontend.')) {
      return;
    }
    
    try {
      setSincronizacaoInfo({ ...sincronizacaoInfo, sincronizando: true });
      setLoading(true);
      
      // Obter lista de códigos de agentes definidos no frontend
      const agentesFrontend = Object.keys(agentesConfig);
      
      // Filtrar agentes que existem no banco mas não no frontend
      const agentesParaExcluir = agentesConfigs.filter(
        agente => !agentesFrontend.includes(agente.codigo)
      );
      
      console.log("Agentes no frontend:", agentesFrontend);
      console.log("Agentes no banco:", agentesConfigs.map(a => a.codigo));
      console.log("Agentes para excluir:", agentesParaExcluir.map(a => a.codigo));
      
      if (agentesParaExcluir.length === 0) {
        setNotificacao({
          tipo: 'sucesso',
          mensagem: 'Não há agentes para excluir. Tudo já está sincronizado!'
        });
        setLoading(false);
        setSincronizacaoInfo({ ...sincronizacaoInfo, sincronizando: false });
        return;
      }
      
      // Excluir cada agente não definido no frontend
      for (const agente of agentesParaExcluir) {
        console.log(`Excluindo agente: ${agente.codigo}`);
        await AgenteConfig.delete(agente.codigo);
      }
      
      // Recarregar dados
      await loadData();
      
      setNotificacao({
        tipo: 'sucesso',
        mensagem: `Sincronização concluída! ${agentesParaExcluir.length} agentes foram removidos.`
      });
      
      setSincronizacaoInfo({
        agentesExcedentes: 0,
        sincronizando: false
      });
    } catch (error) {
      console.error('Erro ao sincronizar agentes:', error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao sincronizar agentes: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setLoading(false);
      setSincronizacaoInfo({ ...sincronizacaoInfo, sincronizando: false });
    }
  };

  // Função para atualizar um usuário
  const handleSalvarUsuario = async () => {
    try {
      if (!editandoUsuario) return;
      
      // Garantir que os campos estejam no formato correto
      const userData = {
        nome: editandoUsuario.nome,
        email: editandoUsuario.email,
        role: editandoUsuario.role,
        plano_atual: editandoUsuario.plano_atual,
        status: editandoUsuario.status,
        creditos_restantes: parseInt(editandoUsuario.creditos_restantes || 0),
        agentes_liberados: Array.isArray(editandoUsuario.agentes_liberados) 
          ? editandoUsuario.agentes_liberados 
          : [],
        creditos_ilimitados: Boolean(editandoUsuario.creditos_ilimitados)
      };
      
      // Atualizar o usuário no servidor
      const response = await User.updateAdmin(editandoUsuario._id, userData);
      
      // Atualizar a lista de usuários com os dados completos
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(user => 
          user._id === editandoUsuario._id ? response : user
        )
      );
      
      setEditandoUsuario(null);
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Usuário atualizado com sucesso!'
      });
      
      // Recarregar todos os dados para garantir consistência
      loadData();
      
      // Limpar notificação após 3 segundos
      setTimeout(() => {
        setNotificacao({ tipo: null, mensagem: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao atualizar usuário: ${error.message || 'Erro desconhecido'}`
      });
      
      // Limpar notificação após 5 segundos
      setTimeout(() => {
        setNotificacao({ tipo: null, mensagem: '' });
      }, 5000);
    }
  };

  // Função para adicionar créditos a um usuário
  const adicionarCreditos = (usuario, creditos) => {
    setEditandoUsuario({
      ...usuario,
      creditos_restantes: (parseInt(usuario.creditos_restantes || 0) + parseInt(creditos))
    });
  };

  // Função para alternar status de admin de um usuário
  const toggleAdmin = (usuario) => {
    setEditandoUsuario({
      ...usuario,
      role: usuario.role === 'admin' ? 'user' : 'admin'
    });
  };

  // Função para alternar a liberação de um agente para um usuário
  const toggleAgenteParaUsuario = (usuario, agenteId) => {
    // Garantir que agentes_liberados seja um array
    const agentesLiberados = Array.isArray(usuario.agentes_liberados) 
      ? [...usuario.agentes_liberados] 
      : [];
    
    // Verificar se o ID do agente já está na lista
    const agenteIndex = agentesLiberados.findIndex(id => id === agenteId);
    
    // Criar nova lista de agentes liberados
    let novaLista;
    if (agenteIndex >= 0) {
      // Se já existe, remover
      novaLista = [...agentesLiberados];
      novaLista.splice(agenteIndex, 1);
    } else {
      // Se não existe, adicionar
      novaLista = [...agentesLiberados, agenteId];
    }
    
    // Atualizar o usuário com a nova lista
    setEditandoUsuario({
      ...usuario,
      agentes_liberados: novaLista
    });
  };

  // Função para atualizar os agentes liberados com base no plano selecionado
  const atualizarAgentesPorPlano = (plano) => {
    if (!editandoUsuario) return;
    
    // Obter os códigos dos agentes disponíveis para o plano selecionado
    const codigosAgentesDoPlano = planosConfig[plano]?.agentes || [];
    
    // Mapear os códigos para IDs do MongoDB
    const idsAgentesDoPlano = codigosAgentesDoPlano
      .map(codigo => {
        const agente = agentesConfigs.find(a => a.codigo === codigo);
        return agente ? agente._id : null;
      })
      .filter(id => id !== null); // Remover valores nulos
    
    // Atualizar o usuário com o novo plano e os agentes correspondentes
    setEditandoUsuario({
      ...editandoUsuario,
      plano_atual: plano,
      agentes_liberados: idsAgentesDoPlano // Usar os IDs do MongoDB
    });
  };

  // Função para carregar configurações de planos
  const loadConfigPlanos = async () => {
    try {
      setLoadingOfertas(true);
      const configsPlanos = await ConfiguracaoPlanos.getAll();
      
      console.log("Dados de configuração de planos carregados:", configsPlanos);
      
      if (configsPlanos && configsPlanos.length > 0) {
        // Usar a primeira configuração encontrada
        const config = configsPlanos[0];
        console.log("Configuração de planos carregada:", config);
        console.log("Cupons encontrados:", config.cupons || []);
        
        setConfigPlanos({
          id: config._id || config.id,
          plano_basico_preco_mensal: config.plano_basico_preco_mensal || 67,
          plano_basico_preco_anual: config.plano_basico_preco_anual || 597,
          plano_intermediario_preco_mensal: config.plano_intermediario_preco_mensal || 97,
          plano_intermediario_preco_anual: config.plano_intermediario_preco_anual || 897,
          plano_premium_preco_mensal: config.plano_premium_preco_mensal || 197,
          plano_premium_preco_anual: config.plano_premium_preco_anual || 1997,
          descontoAfiliados: config.descontoAfiliados || 10,
          periodoPadrao: config.periodoPadrao || 'mensal',
          // Adicionar campos de oferta
          oferta_ativa: config.oferta_ativa || false,
          oferta_titulo: config.oferta_titulo || '',
          oferta_descricao: config.oferta_descricao || '',
          oferta_data_inicio: config.oferta_data_inicio,
          oferta_data_fim: config.oferta_data_fim,
          // Preços originais para ofertas
          plano_basico_preco_original_mensal: config.plano_basico_preco_original_mensal || 0,
          plano_basico_preco_original_anual: config.plano_basico_preco_original_anual || 0,
          plano_intermediario_preco_original_mensal: config.plano_intermediario_preco_original_mensal || 0,
          plano_intermediario_preco_original_anual: config.plano_intermediario_preco_original_anual || 0,
          plano_premium_preco_original_mensal: config.plano_premium_preco_original_mensal || 0,
          plano_premium_preco_original_anual: config.plano_premium_preco_original_anual || 0,
          // Cupons
          cupons: Array.isArray(config.cupons) ? config.cupons : [],
          plano_anual_ativo: config.plano_anual_ativo || false,
          recursos_planos: config.recursos_planos || {}
        });
      } else {
        console.log("Nenhuma configuração de planos encontrada, usando valores padrão");
        // Definir valores padrão
        setConfigPlanos({
          plano_basico_preco_mensal: 67,
          plano_basico_preco_anual: 597,
          plano_intermediario_preco_mensal: 97,
          plano_intermediario_preco_anual: 897,
          plano_premium_preco_mensal: 197,
          plano_premium_preco_anual: 1997,
          descontoAfiliados: 10,
          periodoPadrao: 'mensal',
          oferta_ativa: false,
          oferta_titulo: '',
          oferta_descricao: '',
          cupons: [],
          plano_anual_ativo: false,
          recursos_planos: {}
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de planos:", error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao carregar configurações de planos: ${error.message || 'Erro desconhecido'}`
      });
      
      // Definir valores padrão em caso de erro
      setConfigPlanos({
        plano_basico_preco_mensal: 67,
        plano_basico_preco_anual: 597,
        plano_intermediario_preco_mensal: 97,
        plano_intermediario_preco_anual: 897,
        plano_premium_preco_mensal: 197,
        plano_premium_preco_anual: 1997,
        descontoAfiliados: 10,
        periodoPadrao: 'mensal',
        oferta_ativa: false,
        oferta_titulo: '',
        oferta_descricao: '',
        cupons: [],
        plano_anual_ativo: false,
        recursos_planos: {}
      });
    } finally {
      setLoadingOfertas(false);
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
          <span className="text-muted-foreground font-medium">Carregando painel administrativo...</span>
        </div>
      </div>
    );
  }

  const totalUsuarios = Array.isArray(usuarios) ? usuarios.length : 0;
  const usuariosBasico = Array.isArray(usuarios) ? usuarios.filter(u => u.plano_atual === 'basico').length : 0;
  const usuariosIntermediario = Array.isArray(usuarios) ? usuarios.filter(u => u.plano_atual === 'intermediario').length : 0;
  const usuariosPremium = Array.isArray(usuarios) ? usuarios.filter(u => u.plano_atual === 'premium').length : 0;
  const totalReceita = Array.isArray(indicacoes) ? indicacoes.reduce((sum, ind) => sum + (ind.valor_comissao || 0), 0) * 3.33 : 0; // Estimativa baseada na comissão
  const totalComissoes = Array.isArray(indicacoes) ? indicacoes.reduce((sum, ind) => sum + (ind.valor_comissao || 0), 0) : 0;
  const afiliados = Array.isArray(usuarios) ? usuarios.filter(u => u.eh_afiliado).length : 0;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">
              Painel Administrativo
            </h1>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="agentes" className="flex items-center gap-2">
              <Bot className="w-4 h-4" /> Agentes
            </TabsTrigger>
            <TabsTrigger value="planos" className="flex items-center gap-2">
              <Crown className="w-4 h-4" /> Planos
            </TabsTrigger>
            <TabsTrigger value="ofertas" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Ofertas
            </TabsTrigger>
            <TabsTrigger value="indicacoes" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Indicações
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Config
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="space-y-6">
             {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Usuários</p>
                      <p className="text-3xl font-bold">{totalUsuarios}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Receita Total Estimada</p>
                      <p className="text-3xl font-bold text-green-600">R$ {totalReceita.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Conversas Totais</p>
                      <p className="text-3xl font-bold">{conversas.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Afiliados Ativos</p>
                      <p className="text-3xl font-bold text-yellow-600">{afiliados}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição de Planos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart className="w-6 h-6 text-primary" />
                  Distribuição de Planos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-card border border-blue-200 dark:border-blue-900 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{usuariosBasico}</div>
                    <div className="text-sm text-muted-foreground">Plano Básico</div>
                  </div>
                  <div className="text-center p-4 bg-card border border-purple-200 dark:border-purple-900 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{usuariosIntermediario}</div>
                    <div className="text-sm text-muted-foreground">Plano Intermediário</div>
                  </div>
                  <div className="text-center p-4 bg-card border border-yellow-200 dark:border-yellow-900 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{usuariosPremium}</div>
                    <div className="text-sm text-muted-foreground">Plano Premium</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestão de Agentes Content */}
          <TabsContent value="agentes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Agentes IA</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={sincronizarAgentes} 
                  className={`${sincronizacaoInfo.agentesExcedentes > 0 ? 'bg-amber-600' : 'bg-green-600'}`}
                  disabled={sincronizacaoInfo.sincronizando || sincronizacaoInfo.agentesExcedentes === 0}
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${sincronizacaoInfo.sincronizando ? 'animate-spin' : ''}`} />
                  {sincronizacaoInfo.sincronizando 
                    ? 'Sincronizando...' 
                    : sincronizacaoInfo.agentesExcedentes > 0 
                      ? `Sincronizar Agentes (${agentesConfigs.length} → ${Object.keys(agentesConfig).length})` 
                      : 'Agentes Sincronizados'}
                </Button>
                <Button onClick={inicializarAgentes} className="bg-indigo-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Inicializar/Verificar Agentes Base
                </Button>
              </div>
            </div>

            {sincronizacaoInfo.agentesExcedentes > 0 && (
              <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mr-2" />
                    <p className="text-amber-800 dark:text-amber-300">
                      Foram detectados {sincronizacaoInfo.agentesExcedentes} agentes no banco de dados que não estão definidos no frontend. 
                      Clique em "Sincronizar Agentes" para remover estes agentes extras e resolver o problema.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {!agentesConfigs || !Array.isArray(agentesConfigs) || agentesConfigs.length === 0 ? (
                <div className="col-span-3 p-8 text-center bg-card rounded-lg">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Bot className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-xl font-medium">Nenhum agente configurado</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Parece que ainda não há agentes configurados no sistema. Clique no botão "Inicializar/Verificar Agentes Base" acima para configurar os agentes padrão.
                    </p>
                    <Button 
                      onClick={inicializarAgentes} 
                      className="mt-2 bg-indigo-600"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Inicializar Agentes
                    </Button>
                  </div>
                </div>
              ) : (
                // Renderizar os cards dos agentes existentes
                agentesConfigs.map((config) => (
                  <Card key={config._id} className="overflow-hidden">
                    <CardHeader className={`bg-gradient-to-r ${config.cor ? '' : 'from-blue-500 to-indigo-600'}`} style={{ background: config.cor ? config.cor : undefined }}>
                      <CardTitle className="flex justify-between items-center text-white">
                        <span>{config.nome}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setEditandoAgente(config)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleExcluirAgente(config)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-4">{config.descricao}</div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-card p-2 rounded border">
                          <p className="text-xs text-muted-foreground">Modelo</p>
                          <p className="font-semibold">{config.modelo_ia}</p>
                        </div>
                        <div className="bg-card p-2 rounded border">
                          <p className="text-xs text-muted-foreground">Documentos</p>
                          <p className="font-semibold">{config?.documentos_treinamento?.length || 0} arquivos</p>
                        </div>
                      </div>
                      
                      {/* Documentos de treinamento */}
                      {config.documentos_treinamento && config.documentos_treinamento.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Documentos de treinamento:</h4>
                          <div className="space-y-2">
                            {config.documentos_treinamento.map((doc) => (
                              <div key={doc._id} className="flex items-center justify-between bg-card p-2 rounded border">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{doc.nome}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({(doc.tamanho / 1024).toFixed(2)} KB)
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleExcluirDocumento(config, doc._id)}
                                  disabled={uploadingFile}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <input
                          type="file"
                          id={`file-upload-${config._id}`}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadDocumento(e.target.files[0], config);
                              e.target.value = '';
                            }
                          }}
                        />
                        <label
                          htmlFor={`file-upload-${config._id}`}
                          className="flex items-center justify-center w-full p-2 border-2 border-dashed border-muted rounded-md cursor-pointer hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-2">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {uploadingFile ? 'Enviando...' : 'Adicionar documento de treinamento'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Modal de Edição de Agente */}
            {editandoAgente && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Card className="bg-white border-2 border-indigo-200 shadow-2xl mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Bot className="w-6 h-6 text-indigo-600" />
                      Configurando Agente: {agentesConfig[editandoAgente.codigo]?.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição do Agente:</label>
                        <Textarea
                          value={editandoAgente.descricao}
                          onChange={(e) => setEditandoAgente({...editandoAgente, descricao: e.target.value})}
                          rows={4}
                          className="w-full"
                          placeholder="Digite uma descrição do agente..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Instruções do Sistema:</label>
                        <Textarea
                          value={editandoAgente.instrucoes_sistema}
                          onChange={(e) => setEditandoAgente({...editandoAgente, instrucoes_sistema: e.target.value})}
                          rows={8}
                          className="w-full"
                          placeholder="Digite as instruções do sistema para o agente..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Documentos de Treinamento:</label>
                        <div className="border rounded-lg p-4 space-y-3 bg-card">
                          <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary"/>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.docx,.txt,.md"
                              onChange={(e) => {
                                const files = Array.from(e.target.files);
                                files.forEach(file => {
                                  if (file) handleUploadDocumento(file, editandoAgente);
                                })
                                e.target.value = null; // Reset input
                              }}
                              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                              disabled={uploadingFile}
                            />
                          </div>
                          {uploadingFile && <p className="text-sm text-primary">Enviando arquivo(s)...</p>}

                          {editandoAgente.documentos_treinamento?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm">Documentos de treinamento:</h4>
                              <div className="space-y-2 mt-2">
                                {editandoAgente.documentos_treinamento.map((doc, index) => (
                                  <div key={doc._id || index} className="flex items-center justify-between bg-card p-2 rounded border">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2" />
                                      <span className="text-sm">{doc.nome}</span>
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({(doc.tamanho / 1024).toFixed(2)} KB)
                                      </span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => {
                                          if (doc._id) {
                                            handleExcluirDocumento(editandoAgente, doc._id);
                                          } else {
                                            const novosDocumentos = editandoAgente.documentos_treinamento.filter((_, i) => i !== index);
                                            setEditandoAgente({...editandoAgente, documentos_treinamento: novosDocumentos});
                                          }
                                        }}
                                        disabled={uploadingFile}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleSalvarAgente(editandoAgente)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Agente
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditandoAgente(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Usuários Content */}
          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-3 text-left">Nome</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Plano</th>
                        <th className="p-3 text-left">Créditos</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Admin</th>
                        <th className="p-3 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(usuarios) && usuarios.map((usuario) => (
                        <tr key={usuario._id} className="border-b hover:bg-muted/30">
                          <td className="p-3">{usuario.nome}</td>
                          <td className="p-3">{usuario.email}</td>
                          <td className="p-3">
                            <Badge variant={
                              usuario.plano_atual === 'premium' ? 'yellow' : 
                              usuario.plano_atual === 'intermediario' ? 'purple' : 
                              'blue'
                            }>
                              {usuario.plano_atual === 'premium' ? 'Premium' : 
                               usuario.plano_atual === 'intermediario' ? 'Intermediário' : 
                               'Básico'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {usuario.creditos_ilimitados ? 
                              <span className="text-green-500 font-medium">Ilimitado</span> : 
                              usuario.creditos_restantes || 0}
                          </td>
                          <td className="p-3">
                            <Badge variant={usuario.status === 'ativo' ? 'success' : 'destructive'}>
                              {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={usuario.role === 'admin' ? 'success' : 'outline'}>
                              {usuario.role === 'admin' ? 'Sim' : 'Não'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditandoUsuario(usuario)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {(!Array.isArray(usuarios) || usuarios.length === 0) && (
                        <tr>
                          <td colSpan="7" className="p-3 text-center text-muted-foreground">Nenhum usuário encontrado</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Modal de Edição de Usuário */}
            {editandoUsuario && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              >
                <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Editar Usuário: {editandoUsuario.nome}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setEditandoUsuario(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informações Básicas</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome</Label>
                          <Input 
                            id="nome"
                            value={editandoUsuario.nome || ''}
                            onChange={(e) => setEditandoUsuario({...editandoUsuario, nome: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            value={editandoUsuario.email || ''}
                            onChange={(e) => setEditandoUsuario({...editandoUsuario, email: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status e Permissões */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Status e Permissões</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={editandoUsuario.status || 'ativo'}
                            onValueChange={(value) => setEditandoUsuario({...editandoUsuario, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="inativo">Inativo</SelectItem>
                              <SelectItem value="pendente">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="plano">Plano</Label>
                          <Select 
                            value={editandoUsuario.plano_atual || 'basico'}
                            onValueChange={(value) => {
                              setEditandoUsuario({...editandoUsuario, plano_atual: value});
                              atualizarAgentesPorPlano(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basico">Básico</SelectItem>
                              <SelectItem value="intermediario">Intermediário</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="admin"
                          checked={editandoUsuario.role === 'admin'}
                          onCheckedChange={() => toggleAdmin(editandoUsuario)}
                        />
                        <Label htmlFor="admin" className="font-medium">Usuário Administrador</Label>
                      </div>
                    </div>

                    {/* Créditos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Gerenciamento de Créditos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="creditos">Créditos Atuais</Label>
                          <Input 
                            id="creditos"
                            type="number"
                            value={editandoUsuario.creditos_restantes || 0}
                            onChange={(e) => setEditandoUsuario({...editandoUsuario, creditos_restantes: parseInt(e.target.value)})}
                            disabled={editandoUsuario.creditos_ilimitados}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button 
                            onClick={() => adicionarCreditos(editandoUsuario, 10)}
                            disabled={editandoUsuario.creditos_ilimitados}
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-1" /> 10
                          </Button>
                          <Button 
                            onClick={() => adicionarCreditos(editandoUsuario, 50)}
                            disabled={editandoUsuario.creditos_ilimitados}
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-1" /> 50
                          </Button>
                          <Button 
                            onClick={() => adicionarCreditos(editandoUsuario, 100)}
                            disabled={editandoUsuario.creditos_ilimitados}
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-1" /> 100
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="creditos_ilimitados"
                          checked={editandoUsuario.creditos_ilimitados || false}
                          onCheckedChange={(checked) => setEditandoUsuario({...editandoUsuario, creditos_ilimitados: checked})}
                        />
                        <Label htmlFor="creditos_ilimitados" className="font-medium">Créditos Ilimitados</Label>
                      </div>
                    </div>

                    {/* Agentes Liberados */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Agentes Liberados</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Array.isArray(agentesConfigs) && agentesConfigs.map((agente) => (
                          <div key={agente._id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`agente-${agente._id}`}
                              checked={(editandoUsuario.agentes_liberados || []).includes(agente._id)}
                              onCheckedChange={() => toggleAgenteParaUsuario(editandoUsuario, agente._id)}
                            />
                            <Label 
                              htmlFor={`agente-${agente._id}`} 
                              className="font-medium"
                              style={{ color: agente.cor }}
                            >
                              {agente.nome}
                            </Label>
                          </div>
                        ))}
                        {(!Array.isArray(agentesConfigs) || agentesConfigs.length === 0) && (
                          <p className="text-muted-foreground col-span-2">Nenhum agente configurado no sistema.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setEditandoUsuario(null)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSalvarUsuario}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Financeiro Content */}
          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <CardTitle>Últimas Conversões de Afiliados</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(indicacoes) && indicacoes.slice(0, 5).map((indicacao) => (
                  <div key={indicacao.id} className="flex justify-between items-center py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Plano {indicacao.plano_contratado}</p>
                        <p className="text-sm text-muted-foreground">{new Date(indicacao.data_conversao).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {indicacao.valor_comissao.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Afiliado: {indicacao.afiliado_id}
                      </p>
                    </div>
                  </div>
                ))}
                {(!Array.isArray(indicacoes) || indicacoes.length === 0) && <p className="text-sm text-muted-foreground">Nenhuma indicação recente.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nova Aba Planos */}
          <TabsContent value="planos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Planos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Configurações Gerais</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="plano_anual_ativo" 
                      checked={configPlanos?.plano_anual_ativo !== false}
                      onCheckedChange={(checked) => {
                        setConfigPlanos({
                          ...configPlanos,
                          plano_anual_ativo: checked
                        });
                      }}
                    />
                    <label
                      htmlFor="plano_anual_ativo"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Plano Anual Ativo
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Plano Básico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Mensal (R$)</label>
                      <Input
                        type="number"
                        name="plano_basico_preco_mensal"
                        value={configPlanos?.plano_basico_preco_mensal || 67}
                        onChange={atualizarConfigPlanos}
                        placeholder="ex: 67.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Anual (R$)</label>
                      <Input
                        type="number"
                        name="plano_basico_preco_anual"
                        value={configPlanos?.plano_basico_preco_anual || 597}
                        onChange={atualizarConfigPlanos}
                        placeholder="ex: 597.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Recursos do Plano (um por linha)</label>
                    <Textarea
                      name="recursos_planos_basico"
                      value={(configPlanos?.recursos_planos?.basico || [
                        '4 Agentes IA Especializados',
                        'Marketing & Mídias Sociais',
                        'E-commerce Estratégico',
                        'Criação de Coleção',
                        'Fornecedores',
                        '100 Créditos/mês',
                        'Suporte por Email'
                      ]).join('\n')}
                      onChange={(e) => {
                        const recursos = e.target.value.split('\n');
                        setConfigPlanos({
                          ...configPlanos,
                          recursos_planos: {
                            ...(configPlanos.recursos_planos || {}),
                            basico: recursos
                          }
                        });
                      }}
                      placeholder="Digite um recurso por linha"
                      className="min-h-[150px] whitespace-pre-wrap"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Plano Intermediário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Mensal (R$)</label>
                      <Input
                        type="number"
                        name="plano_intermediario_preco_mensal"
                        value={configPlanos?.plano_intermediario_preco_mensal || 97}
                        onChange={atualizarConfigPlanos}
                        placeholder="ex: 97.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Anual (R$)</label>
                      <Input
                        type="number"
                        name="plano_intermediario_preco_anual"
                        value={configPlanos?.plano_intermediario_preco_anual || 897}
                        onChange={atualizarConfigPlanos}
                        placeholder="ex: 897.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Recursos do Plano (um por linha)</label>
                    <Textarea
                      name="recursos_planos_intermediario"
                      value={(configPlanos?.recursos_planos?.intermediario || [
                        '7 Agentes IA Especializados',
                        'Todos do plano Básico +',
                        'Tráfego Pago',
                        'Gestão Financeira', 
                        'Construção de Comunidade',
                        '250 Créditos/mês',
                        'Suporte Prioritário',
                        'Webinars Exclusivos'
                      ]).join('\n')}
                      onChange={(e) => {
                        const recursos = e.target.value.split('\n');
                        setConfigPlanos({
                          ...configPlanos,
                          recursos_planos: {
                            ...(configPlanos.recursos_planos || {}),
                            intermediario: recursos
                          }
                        });
                      }}
                      placeholder="Digite um recurso por linha"
                      className="min-h-[150px] whitespace-pre-wrap"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Plano Premium</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Mensal (R$)</label>
                      <Input
                        type="number"
                        name="plano_premium_preco_mensal"
                        value={configPlanos?.plano_premium_preco_mensal || 197}
                        onChange={atualizarConfigPlanos}
                        placeholder="ex: 197.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Preço Anual (R$)</label>
                      <Input
                        type="number"
                        name="plano_premium_preco_anual"
                        value={configPlanos?.plano_premium_preco_anual || 1997}
                        onChange={atualizarConfigPlanos}
                        placeholder="ex: 1997.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Recursos do Plano (um por linha)</label>
                    <Textarea
                      name="recursos_planos_premium"
                      value={(configPlanos?.recursos_planos?.premium || [
                        'TODOS os 11 Agentes IA',
                        'IA de Geração de Imagens',
                        'Networking & Relações',
                        'Branding & Posicionamento',
                        'Experiência de Unboxing',
                        'Créditos ILIMITADOS',
                        'Suporte VIP 24/7',
                        'Consultoria Mensal 1:1',
                        'Acesso Antecipado a Novos Agentes'
                      ]).join('\n')}
                      onChange={(e) => {
                        const recursos = e.target.value.split('\n');
                        setConfigPlanos({
                          ...configPlanos,
                          recursos_planos: {
                            ...(configPlanos.recursos_planos || {}),
                            premium: recursos
                          }
                        });
                      }}
                      placeholder="Digite um recurso por linha"
                      className="min-h-[150px] whitespace-pre-wrap"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSalvarConfigPlanos} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações de Planos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Content */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">MundPagg</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Client ID</label>
                      <Input
                        name="gateway_mundpay_client_id"
                        value={configPagamento?.gateway_mundpay_client_id || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mundpay_client_id: e.target.value})}
                        placeholder="Client ID do MundPay"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Client Secret</label>
                      <Input
                        type="password"
                        name="gateway_mundpay_client_secret"
                        value={configPagamento?.gateway_mundpay_client_secret || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mundpay_client_secret: e.target.value})}
                        placeholder="Client Secret do MundPay"
                      />
                    </div>
                  </div>
                </div>
                <hr/>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Mercado Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Public Key</label>
                      <Input
                        name="gateway_mercadopago_public_key"
                        value={configPagamento?.gateway_mercadopago_public_key || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mercadopago_public_key: e.target.value})}
                        placeholder="Public Key do Mercado Pago"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Access Token</label>
                      <Input
                        type="password"
                        name="gateway_mercadopago_access_token"
                        value={configPagamento?.gateway_mercadopago_access_token || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mercadopago_access_token: e.target.value})}
                        placeholder="Access Token do Mercado Pago"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Webhook Secret</label>
                      <Input
                        name="gateway_mercadopago_webhook_secret"
                        value={configPagamento?.gateway_mercadopago_webhook_secret || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mercadopago_webhook_secret: e.target.value})}
                        placeholder="Webhook Secret do Mercado Pago"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSalvarConfigPagamento} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações de Pagamento
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações da IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Chave de API OpenAI</label>
                  <Input
                    type="password"
                    name="gpt_api_key"
                    value={configIA?.gpt_api_key || ""}
                    onChange={(e) => setConfigIA({...configIA, gpt_api_key: e.target.value})}
                    placeholder="Chave de API para OpenAI/ChatGPT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Modelo Preferencial</label>
                  <Input
                    name="modelo_preferencial_ia"
                    value={configIA?.modelo_preferencial_ia || "gpt-3.5-turbo"}
                    onChange={(e) => setConfigIA({...configIA, modelo_preferencial_ia: e.target.value})}
                    placeholder="ex: gpt-4, gpt-3.5-turbo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Este modelo será usado como padrão pelos agentes, se aplicável e suportado pela integração.</p>
                </div>
                <Button onClick={handleSalvarConfigIA} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações de IA
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ofertas Content */}
          <TabsContent value="ofertas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Gerenciar Ofertas e Cupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Seção de Ofertas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configurar Oferta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="oferta_ativa">Status da Oferta</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="oferta_ativa" 
                            checked={configPlanos.oferta_ativa || false}
                            onCheckedChange={(checked) => {
                              setConfigPlanos({
                                ...configPlanos,
                                oferta_ativa: checked
                              });
                            }}
                          />
                          <label
                            htmlFor="oferta_ativa"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Oferta ativa
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="oferta_titulo">Título da Oferta</Label>
                        <Input
                          id="oferta_titulo"
                          placeholder="Ex: Promoção de Lançamento"
                          value={configPlanos.oferta_titulo || ''}
                          onChange={(e) => {
                            setConfigPlanos({
                              ...configPlanos,
                              oferta_titulo: e.target.value
                            });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="oferta_descricao">Descrição da Oferta</Label>
                        <Input
                          id="oferta_descricao"
                          placeholder="Ex: Aproveite 30% de desconto por tempo limitado"
                          value={configPlanos.oferta_descricao || ''}
                          onChange={(e) => {
                            setConfigPlanos({
                              ...configPlanos,
                              oferta_descricao: e.target.value
                            });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Período da Oferta</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="oferta_data_inicio" className="text-xs">Data Início</Label>
                            <Input
                              id="oferta_data_inicio"
                              type="date"
                              value={configPlanos.oferta_data_inicio ? new Date(configPlanos.oferta_data_inicio).toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  oferta_data_inicio: e.target.value ? new Date(e.target.value).toISOString() : null
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="oferta_data_fim" className="text-xs">Data Fim</Label>
                            <Input
                              id="oferta_data_fim"
                              type="date"
                              value={configPlanos.oferta_data_fim ? new Date(configPlanos.oferta_data_fim).toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  oferta_data_fim: e.target.value ? new Date(e.target.value).toISOString() : null
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mt-6 flex items-center justify-between">
                      <span>Preços Originais (Para Exibir como Riscados)</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          // Limpar todos os preços originais
                          setConfigPlanos({
                            ...configPlanos,
                            plano_basico_preco_original_mensal: 0,
                            plano_basico_preco_original_anual: 0,
                            plano_intermediario_preco_original_mensal: 0,
                            plano_intermediario_preco_original_anual: 0,
                            plano_premium_preco_original_mensal: 0,
                            plano_premium_preco_original_anual: 0,
                            oferta_ativa: false,
                            oferta_titulo: '',
                            oferta_descricao: ''
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Limpar Oferta
                      </Button>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Plano Básico</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="plano_basico_preco_original_mensal" className="text-xs">Preço Original Mensal</Label>
                            <Input
                              id="plano_basico_preco_original_mensal"
                              type="number"
                              placeholder="0"
                              value={configPlanos.plano_basico_preco_original_mensal || ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  plano_basico_preco_original_mensal: e.target.value === '' ? 0 : Number(e.target.value)
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="plano_basico_preco_original_anual" className="text-xs">Preço Original Anual</Label>
                            <Input
                              id="plano_basico_preco_original_anual"
                              type="number"
                              placeholder="0"
                              value={configPlanos.plano_basico_preco_original_anual || ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  plano_basico_preco_original_anual: e.target.value === '' ? 0 : Number(e.target.value)
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Plano Intermediário</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="plano_intermediario_preco_original_mensal" className="text-xs">Preço Original Mensal</Label>
                            <Input
                              id="plano_intermediario_preco_original_mensal"
                              type="number"
                              placeholder="0"
                              value={configPlanos.plano_intermediario_preco_original_mensal || ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  plano_intermediario_preco_original_mensal: e.target.value === '' ? 0 : Number(e.target.value)
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="plano_intermediario_preco_original_anual" className="text-xs">Preço Original Anual</Label>
                            <Input
                              id="plano_intermediario_preco_original_anual"
                              type="number"
                              placeholder="0"
                              value={configPlanos.plano_intermediario_preco_original_anual || ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  plano_intermediario_preco_original_anual: e.target.value === '' ? 0 : Number(e.target.value)
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Plano Premium</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="plano_premium_preco_original_mensal" className="text-xs">Preço Original Mensal</Label>
                            <Input
                              id="plano_premium_preco_original_mensal"
                              type="number"
                              placeholder="0"
                              value={configPlanos.plano_premium_preco_original_mensal || ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  plano_premium_preco_original_mensal: e.target.value === '' ? 0 : Number(e.target.value)
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="plano_premium_preco_original_anual" className="text-xs">Preço Original Anual</Label>
                            <Input
                              id="plano_premium_preco_original_anual"
                              type="number"
                              placeholder="0"
                              value={configPlanos.plano_premium_preco_original_anual || ''}
                              onChange={(e) => {
                                setConfigPlanos({
                                  ...configPlanos,
                                  plano_premium_preco_original_anual: e.target.value === '' ? 0 : Number(e.target.value)
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seção de Cupons */}
                  <div className="pt-6 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Cupons de Desconto</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => {
                            // Remover todos os cupons
                            if (window.confirm('Tem certeza que deseja remover todos os cupons?')) {
                              setConfigPlanos({
                                ...configPlanos,
                                cupons: []
                              });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remover Todos
                        </Button>
                        <Button 
                          onClick={() => {
                            // Adicionar novo cupom vazio
                            const novosCupons = [...(configPlanos.cupons || []), {
                              codigo: '',
                              descricao: '',
                              tipo: 'percentual',
                              valor: 10,
                              data_inicio: new Date().toISOString(),
                              data_expiracao: null,
                              limite_usos: 0,
                              usos_atuais: 0,
                              planos_aplicaveis: ['basico', 'intermediario', 'premium'],
                              ativo: true
                            }];
                            
                            setConfigPlanos({
                              ...configPlanos,
                              cupons: novosCupons
                            });
                          }}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Novo Cupom
                        </Button>
                      </div>
                    </div>
                    
                    {Array.isArray(configPlanos.cupons) && configPlanos.cupons.length > 0 ? (
                      <div className="space-y-4">
                        {configPlanos.cupons.map((cupom, index) => (
                          <Card key={index} className="border border-border">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                  <div className="space-y-1">
                                    <Label htmlFor={`cupom-codigo-${index}`} className="text-xs">Código do Cupom</Label>
                                    <Input
                                      id={`cupom-codigo-${index}`}
                                      placeholder="CUPOM10"
                                      value={cupom.codigo || ''}
                                      onChange={(e) => {
                                        const novosCupons = [...configPlanos.cupons];
                                        novosCupons[index] = {
                                          ...novosCupons[index],
                                          codigo: e.target.value
                                        };
                                        setConfigPlanos({
                                          ...configPlanos,
                                          cupons: novosCupons
                                        });
                                      }}
                                      className="w-full"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 mt-6">
                                    <Checkbox 
                                      id={`cupom-ativo-${index}`} 
                                      checked={cupom.ativo}
                                      onCheckedChange={(checked) => {
                                        const novosCupons = [...configPlanos.cupons];
                                        novosCupons[index] = {
                                          ...novosCupons[index],
                                          ativo: checked
                                        };
                                        setConfigPlanos({
                                          ...configPlanos,
                                          cupons: novosCupons
                                        });
                                      }}
                                    />
                                    <label
                                      htmlFor={`cupom-ativo-${index}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Ativo
                                    </label>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const novosCupons = [...configPlanos.cupons];
                                    novosCupons.splice(index, 1);
                                    setConfigPlanos({
                                      ...configPlanos,
                                      cupons: novosCupons
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`cupom-descricao-${index}`}>Descrição</Label>
                                  <Input
                                    id={`cupom-descricao-${index}`}
                                    placeholder="Descrição do cupom"
                                    value={cupom.descricao || ''}
                                    onChange={(e) => {
                                      const novosCupons = [...configPlanos.cupons];
                                      novosCupons[index] = {
                                        ...novosCupons[index],
                                        descricao: e.target.value
                                      };
                                      setConfigPlanos({
                                        ...configPlanos,
                                        cupons: novosCupons
                                      });
                                    }}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`cupom-tipo-${index}`}>Tipo</Label>
                                    <Select
                                      value={cupom.tipo || 'percentual'}
                                      onValueChange={(value) => {
                                        const novosCupons = [...configPlanos.cupons];
                                        novosCupons[index] = {
                                          ...novosCupons[index],
                                          tipo: value
                                        };
                                        setConfigPlanos({
                                          ...configPlanos,
                                          cupons: novosCupons
                                        });
                                      }}
                                    >
                                      <SelectTrigger id={`cupom-tipo-${index}`}>
                                        <SelectValue placeholder="Tipo de desconto" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                                        <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`cupom-valor-${index}`}>
                                      {cupom.tipo === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'}
                                    </Label>
                                    <Input
                                      id={`cupom-valor-${index}`}
                                      type="number"
                                      placeholder={cupom.tipo === 'percentual' ? "10" : "50"}
                                      value={cupom.valor || ''}
                                      onChange={(e) => {
                                        const novosCupons = [...configPlanos.cupons];
                                        novosCupons[index] = {
                                          ...novosCupons[index],
                                          valor: e.target.value === '' ? 0 : Number(e.target.value)
                                        };
                                        setConfigPlanos({
                                          ...configPlanos,
                                          cupons: novosCupons
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Validade</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`cupom-data-inicio-${index}`} className="text-xs">Data Início</Label>
                                      <Input
                                        id={`cupom-data-inicio-${index}`}
                                        type="date"
                                        value={cupom.data_inicio ? new Date(cupom.data_inicio).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                          const novosCupons = [...configPlanos.cupons];
                                          novosCupons[index] = {
                                            ...novosCupons[index],
                                            data_inicio: e.target.value ? new Date(e.target.value).toISOString() : null
                                          };
                                          setConfigPlanos({
                                            ...configPlanos,
                                            cupons: novosCupons
                                          });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`cupom-data-expiracao-${index}`} className="text-xs">Data Expiração</Label>
                                      <Input
                                        id={`cupom-data-expiracao-${index}`}
                                        type="date"
                                        value={cupom.data_expiracao ? new Date(cupom.data_expiracao).toISOString().split('T')[0] : ''}
                                        onChange={(e) => {
                                          const novosCupons = [...configPlanos.cupons];
                                          novosCupons[index] = {
                                            ...novosCupons[index],
                                            data_expiracao: e.target.value ? new Date(e.target.value).toISOString() : null
                                          };
                                          setConfigPlanos({
                                            ...configPlanos,
                                            cupons: novosCupons
                                          });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`cupom-limite-usos-${index}`}>Limite de Usos</Label>
                                    <Input
                                      id={`cupom-limite-usos-${index}`}
                                      type="number"
                                      placeholder="0 = ilimitado"
                                      value={cupom.limite_usos || ''}
                                      onChange={(e) => {
                                        const novosCupons = [...configPlanos.cupons];
                                        novosCupons[index] = {
                                          ...novosCupons[index],
                                          limite_usos: e.target.value === '' ? 0 : Number(e.target.value)
                                        };
                                        setConfigPlanos({
                                          ...configPlanos,
                                          cupons: novosCupons
                                        });
                                      }}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`cupom-usos-atuais-${index}`}>Usos Atuais</Label>
                                    <Input
                                      id={`cupom-usos-atuais-${index}`}
                                      type="number"
                                      placeholder="0"
                                      value={cupom.usos_atuais || ''}
                                      onChange={(e) => {
                                        const novosCupons = [...configPlanos.cupons];
                                        novosCupons[index] = {
                                          ...novosCupons[index],
                                          usos_atuais: e.target.value === '' ? 0 : Number(e.target.value)
                                        };
                                        setConfigPlanos({
                                          ...configPlanos,
                                          cupons: novosCupons
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2 col-span-2">
                                  <Label>Planos Aplicáveis</Label>
                                  <div className="flex flex-wrap gap-4">
                                    {['basico', 'intermediario', 'premium'].map((plano) => (
                                      <div key={plano} className="flex items-center space-x-2">
                                        <Checkbox 
                                          id={`cupom-${index}-plano-${plano}`} 
                                          checked={(cupom.planos_aplicaveis || []).includes(plano)}
                                          onCheckedChange={(checked) => {
                                            const novosCupons = [...configPlanos.cupons];
                                            const planosAtuais = novosCupons[index].planos_aplicaveis || [];
                                            
                                            novosCupons[index] = {
                                              ...novosCupons[index],
                                              planos_aplicaveis: checked 
                                                ? [...planosAtuais, plano]
                                                : planosAtuais.filter(p => p !== plano)
                                            };
                                            
                                            setConfigPlanos({
                                              ...configPlanos,
                                              cupons: novosCupons
                                            });
                                          }}
                                        />
                                        <label
                                          htmlFor={`cupom-${index}-plano-${plano}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {plano.charAt(0).toUpperCase() + plano.slice(1)}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">Nenhum cupom de desconto cadastrado.</p>
                        <p className="text-muted-foreground text-sm mt-1">Clique em "Novo Cupom" para adicionar.</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={handleSalvarConfigPlanos}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loading ? (
                          <>
                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Cupons
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
