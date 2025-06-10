import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Indicacao } from "@/api/entities";
import { Conversa } from "@/api/entities";
import { AgenteConfig } from "@/api/entities";
import { ConfiguracaoPagamento } from "@/api/entities";
import { ConfiguracaoIA } from "@/api/entities";
import { ConfiguracaoPlanos } from "@/api/entities";
import { UploadFile, UploadTrainingDocument } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Crown,
  CheckCircle,
  Clock,
  BarChart,
  Settings,
  Upload,
  FileText,
  Bot,
  Save,
  Trash2,
  Edit,
  CreditCard,
  KeyRound,
  Brain,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from 'react-router-dom';

// Importar o agentesConfig do arquivo centralizado
import { agentesConfig } from "@/config/agentes";

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [indicacoes, setIndicacoes] = useState([]);
  const [conversas, setConversas] = useState([]);
  const [agentesConfigs, setAgentesConfigs] = useState([]);
  const [configPagamento, setConfigPagamento] = useState({});
  const [configIA, setConfigIA] = useState({});
  const [configPlanos, setConfigPlanos] = useState({});
  const [loading, setLoading] = useState(true);
  const [editandoAgente, setEditandoAgente] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modalAgente, setModalAgente] = useState(false);
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

  const loadData = async () => {
    try {
      // Carregar dados básicos primeiro
      const [usuariosData, indicacoesData, conversasData] = await Promise.all([
        User.getAll(),
        Indicacao.getAll(),
        Conversa.getAll()
      ]);

      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setIndicacoes(Array.isArray(indicacoesData) ? indicacoesData : []);
      setConversas(Array.isArray(conversasData) ? conversasData : []);

      // Tentar carregar configurações de agentes (pode não existir ainda)
      try {
        const agentesData = await AgenteConfig.getAll();
        setAgentesConfigs(agentesData);
        
        // Calcular quantos agentes extras existem no banco
        const agentesFrontend = Object.keys(agentesConfig);
        const agentesExcedentes = agentesData.filter(
          agente => !agentesFrontend.includes(agente.codigo)
        ).length;
        
        setSincronizacaoInfo({
          ...sincronizacaoInfo,
          agentesExcedentes
        });
      } catch (error) {
        console.warn("AgenteConfig não encontrado ou erro ao carregar:", error);
        setAgentesConfigs([]); // Inicializa como array vazio para evitar erros no map/filter
      }

      // Tentar carregar configurações de pagamento
      try {
        const pagamentoDataResults = await ConfiguracaoPagamento.getAll();
        if (pagamentoDataResults && pagamentoDataResults.length > 0) {
          setConfigPagamento(pagamentoDataResults[0]);
        } else {
          setConfigPagamento({
            gateway_mundpay_client_id: "",
            gateway_mundpay_client_secret: "",
            gateway_mercadopago_public_key: "",
            gateway_mercadopago_access_token: "",
            gateway_mercadopago_webhook_secret: ""
          });
        }
      } catch (error) {
        console.warn("ConfiguracaoPagamento não encontrado ou erro ao carregar:", error);
        setConfigPagamento({
          gateway_mundpay_client_id: "",
          gateway_mundpay_client_secret: "",
          gateway_mercadopago_public_key: "",
          gateway_mercadopago_access_token: "",
          gateway_mercadopago_webhook_secret: ""
        });
      }

      // Tentar carregar configurações de IA
      try {
        const iaDataResults = await ConfiguracaoIA.getAll();
        if (iaDataResults && iaDataResults.length > 0) {
          setConfigIA(iaDataResults[0]);
        } else {
          setConfigIA({
            gpt_api_key: "",
            modelo_preferencial_ia: "gpt-3.5-turbo"
          });
        }
      } catch (error) {
        console.warn("ConfiguracaoIA não encontrado ou erro ao carregar:", error);
        setConfigIA({
          gpt_api_key: "",
          modelo_preferencial_ia: "gpt-3.5-turbo"
        });
      }

      // Tentar carregar configurações de planos
      try {
        const planosDataResults = await ConfiguracaoPlanos.getAll();
        if (planosDataResults && planosDataResults.length > 0) {
          setConfigPlanos(planosDataResults[0]);
        } else {
          setConfigPlanos({
            plano_basico_preco_mensal: 67,
            plano_basico_preco_anual: 597,
            plano_intermediario_preco_mensal: 97,
            plano_intermediario_preco_anual: 870,
            plano_premium_preco_mensal: 127,
            plano_premium_preco_anual: 997
          });
        }
      } catch (error) {
        console.warn("ConfiguracaoPlanos não encontrado:", error);
        setConfigPlanos({
          plano_basico_preco_mensal: 67,
          plano_basico_preco_anual: 597,
          plano_intermediario_preco_mensal: 97,
          plano_intermediario_preco_anual: 870,
          plano_premium_preco_mensal: 127,
          plano_premium_preco_anual: 997
        });
      }

    } catch (error) {
      console.error("Erro ao carregar dados principais:", error);
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
      if (agenteConfigParaSalvar.id) {
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
      ultima_atualizacao: new Date().toISOString(),
      prompt_base: agentesConfig[tipo].prompt || ''
    }));

    try {
      console.log("Inicializando agentes:", agentesBase.map(a => a.codigo));
      console.log("Agentes existentes:", agentesConfigs.map(a => a.codigo));
      
      let atualizou = false;
      for (const agente of agentesBase) {
        const existe = Array.isArray(agentesConfigs) ? agentesConfigs.find(a => a.codigo === agente.codigo) : null;
        if (!existe) {
          console.log(`Criando agente: ${agente.codigo}`);
          await AgenteConfig.create(agente);
          atualizou = true;
        }
      }
      if (atualizou) {
        loadData();
        alert("Agentes base inicializados incluindo o novo Designer IA!");
      } else {
        alert("Todos os agentes base já estão configurados.");
      }
    } catch (error) {
      console.error("Erro ao inicializar agentes:", error);
      alert("Erro ao inicializar agentes: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleSalvarConfigPlanos = async () => {
    try {
      if (configPlanos.id) {
        await ConfiguracaoPlanos.update(configPlanos.id, configPlanos);
      } else {
        const createdConfig = await ConfiguracaoPlanos.create(configPlanos);
        setConfigPlanos(createdConfig);
      }
      alert("Configurações de planos salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar config de planos:", error);
      alert("Erro ao salvar configurações de planos.");
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

  const atualizarConfigPlanos = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Verificar se já existe uma configuração
      if (configPlanos.id) {
        await ConfiguracaoPlanos.update(configPlanos.id, configPlanos);
      } else {
        await ConfiguracaoPlanos.create(configPlanos);
      }
      
      // Recarregar dados
      await loadConfigPlanos();
      
      setNotificacao({
        tipo: 'sucesso',
        mensagem: 'Configurações de planos atualizadas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações de planos:', error);
      setNotificacao({
        tipo: 'erro',
        mensagem: `Erro ao atualizar planos: ${error.message || 'Erro desconhecido'}`
      });
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-xl text-gray-600">
            Gestão completa da plataforma BrandLab
          </p>
        </motion.div>

        {/* Notificação */}
        {notificacao.tipo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg ${
              notificacao.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {notificacao.tipo === 'sucesso' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {notificacao.mensagem}
            </div>
          </motion.div>
        )}

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agentes">
              Agentes IA
              {sincronizacaoInfo.agentesExcedentes > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{sincronizacaoInfo.agentesExcedentes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="planos">Planos</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="space-y-6">
             {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Usuários</p>
                      <p className="text-3xl font-bold text-gray-900">{totalUsuarios}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Receita Total Estimada</p>
                      <p className="text-3xl font-bold text-green-600">R$ {totalReceita.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Conversas Totais</p>
                      <p className="text-3xl font-bold text-gray-900">{conversas.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Afiliados Ativos</p>
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart className="w-6 h-6 text-indigo-600" />
                  Distribuição de Planos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{usuariosBasico}</div>
                    <div className="text-sm text-gray-600">Plano Básico</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{usuariosIntermediario}</div>
                    <div className="text-sm text-gray-600">Plano Intermediário</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{usuariosPremium}</div>
                    <div className="text-sm text-gray-600">Plano Premium</div>
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
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                    <p className="text-amber-800">
                      Foram detectados {sincronizacaoInfo.agentesExcedentes} agentes no banco de dados que não estão definidos no frontend. 
                      Clique em "Sincronizar Agentes" para remover estes agentes extras e resolver o problema.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {agentesConfigs.map((config) => (
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
                    <div className="text-sm text-gray-600 mb-4">{config.descricao}</div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Modelo</p>
                        <p className="font-semibold">{config.modelo_ia}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Documentos</p>
                        <p className="font-semibold">{config?.documentos_treinamento?.length || 0} arquivos</p>
                      </div>
                    </div>
                    
                    {/* Documentos de treinamento */}
                    {config.documentos_treinamento && config.documentos_treinamento.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Documentos de treinamento:</h4>
                        <div className="space-y-2">
                          {config.documentos_treinamento.map((doc) => (
                            <div key={doc._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm">{doc.nome}</span>
                                <span className="ml-2 text-xs text-gray-500">
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
                        className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {uploadingFile ? 'Enviando...' : 'Adicionar documento de treinamento'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                        <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                          <div className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-600"/>
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
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                              disabled={uploadingFile}
                            />
                          </div>
                          {uploadingFile && <p className="text-sm text-indigo-600">Enviando arquivo(s)...</p>}

                          {editandoAgente.documentos_treinamento?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm">Documentos de treinamento:</h4>
                              <div className="space-y-2 mt-2">
                                {editandoAgente.documentos_treinamento.map((doc, index) => (
                                  <div key={doc._id || index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-gray-600" />
                                      <span className="text-sm">{doc.nome}</span>
                                      <span className="ml-2 text-xs text-gray-500">
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nome</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Plano</th>
                        <th className="text-left p-3">Créditos</th>
                        <th className="text-left p-3">Afiliado</th>
                        <th className="text-left p-3">Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(usuarios) && usuarios.map((usuario) => (
                        <tr key={usuario.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{usuario.full_name}</td>
                          <td className="p-3">{usuario.email}</td>
                          <td className="p-3">
                            <Badge className={
                              usuario.plano_atual === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                              usuario.plano_atual === 'intermediario' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {usuario.plano_atual?.charAt(0).toUpperCase() + usuario.plano_atual?.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-3">{usuario.creditos_restantes || 0}</td>
                          <td className="p-3">
                            {usuario.eh_afiliado ? (
                              <Badge className="bg-green-100 text-green-800">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </td>
                          <td className="p-3">{new Date(usuario.created_date).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                      {(!Array.isArray(usuarios) || usuarios.length === 0) && (
                        <tr>
                          <td colSpan="6" className="p-3 text-center text-gray-500">Nenhum usuário encontrado</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financeiro Content */}
          <TabsContent value="financeiro">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Receita Total Estimada:</span>
                      <span className="font-bold text-green-600">R$ {totalReceita.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Comissoes:</span>
                      <span className="font-bold text-orange-600">R$ {totalComissoes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Líquido Estimado:</span>
                      <span className="font-bold text-blue-600">R$ {(totalReceita - totalComissoes).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Indicações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(indicacoes) && indicacoes.slice(0, 5).map((indicacao) => (
                    <div key={indicacao.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">Plano {indicacao.plano_contratado}</p>
                        <p className="text-sm text-gray-600">{new Date(indicacao.data_conversao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ {indicacao.valor_comissao.toFixed(2)}</p>
                        <Badge className={indicacao.status_pagamento === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {indicacao.status_pagamento}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(indicacoes) || indicacoes.length === 0) && <p className="text-sm text-gray-500">Nenhuma indicação recente.</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nova Aba Planos */}
          <TabsContent value="planos" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                  Configuração de Preços dos Planos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">Plano Básico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Mensal (R$)</label>
                      <Input
                        type="number"
                        value={configPlanos.plano_basico_preco_mensal || ""}
                        onChange={(e) => setConfigPlanos({...configPlanos, plano_basico_preco_mensal: Number(e.target.value)})}
                        placeholder="67"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Anual (R$)</label>
                      <Input
                        type="number"
                        value={configPlanos.plano_basico_preco_anual || ""}
                        onChange={(e) => setConfigPlanos({...configPlanos, plano_basico_preco_anual: Number(e.target.value)})}
                        placeholder="597"
                      />
                    </div>
                  </div>
                </div>
                
                <hr/>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">Plano Intermediário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Mensal (R$)</label>
                      <Input
                        type="number"
                        value={configPlanos.plano_intermediario_preco_mensal || ""}
                        onChange={(e) => setConfigPlanos({...configPlanos, plano_intermediario_preco_mensal: Number(e.target.value)})}
                        placeholder="97"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Anual (R$)</label>
                      <Input
                        type="number"
                        value={configPlanos.plano_intermediario_preco_anual || ""}
                        onChange={(e) => setConfigPlanos({...configPlanos, plano_intermediario_preco_anual: Number(e.target.value)})}
                        placeholder="870"
                      />
                    </div>
                  </div>
                </div>
                
                <hr/>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">Plano Premium</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Mensal (R$)</label>
                      <Input
                        type="number"
                        value={configPlanos.plano_premium_preco_mensal || ""}
                        onChange={(e) => setConfigPlanos({...configPlanos, plano_premium_preco_mensal: Number(e.target.value)})}
                        placeholder="127"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preço Anual (R$)</label>
                      <Input
                        type="number"
                        value={configPlanos.plano_premium_preco_anual || ""}
                        onChange={(e) => setConfigPlanos({...configPlanos, plano_premium_preco_anual: Number(e.target.value)})}
                        placeholder="997"
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleSalvarConfigPlanos} className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2"/>
                  Salvar Configurações de Planos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Content */}
          <TabsContent value="configuracoes" className="space-y-6">
            {/* Configuração de Pagamento */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                  Configuração de Gateway de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">MundPagg</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Client ID</label>
                      <Input
                        type="password"
                        value={configPagamento.gateway_mundpay_client_id || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mundpay_client_id: e.target.value})}
                        placeholder="Chave Client ID do MundPagg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Client Secret</label>
                      <Input
                        type="password"
                        value={configPagamento.gateway_mundpay_client_secret || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mundpay_client_secret: e.target.value})}
                        placeholder="Chave Client Secret do MundPagg"
                      />
                    </div>
                  </div>
                </div>
                <hr/>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">Mercado Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Public Key</label>
                      <Input
                        type="password"
                        value={configPagamento.gateway_mercadopago_public_key || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mercadopago_public_key: e.target.value})}
                        placeholder="Public Key do Mercado Pago"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Access Token</label>
                      <Input
                        type="password"
                        value={configPagamento.gateway_mercadopago_access_token || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mercadopago_access_token: e.target.value})}
                        placeholder="Access Token do Mercado Pago"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Webhook Secret (Opcional)</label>
                      <Input
                        type="password"
                        value={configPagamento.gateway_mercadopago_webhook_secret || ""}
                        onChange={(e) => setConfigPagamento({...configPagamento, gateway_mercadopago_webhook_secret: e.target.value})}
                        placeholder="Webhook Secret para notificações"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSalvarConfigPagamento} className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2"/>
                  Salvar Configurações de Pagamento
                </Button>
              </CardContent>
            </Card>

            {/* Configuração de IA */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  Configuração da API de Inteligência Artificial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chave da API (ex: OpenAI GPT)</label>
                  <Input
                    type="password"
                    value={configIA.gpt_api_key || ""}
                    onChange={(e) => setConfigIA({...configIA, gpt_api_key: e.target.value})}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo de IA Preferencial</label>
                  <Input
                    value={configIA.modelo_preferencial_ia || ""}
                    onChange={(e) => setConfigIA({...configIA, modelo_preferencial_ia: e.target.value})}
                    placeholder="ex: gpt-4, gpt-3.5-turbo"
                  />
                  <p className="text-xs text-gray-500 mt-1">Este modelo será usado como padrão pelos agentes, se aplicável e suportado pela integração.</p>
                </div>
                <Button onClick={handleSalvarConfigIA} className="bg-purple-600 hover:bg-purple-700">
                  <KeyRound className="w-4 h-4 mr-2"/>
                  Salvar Configurações de IA
                </Button>
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
