import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, AlertCircle, Wifi, UserX, Check, Database, HardDrive, RefreshCw, Search, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from 'axios';
import { agentesConfig } from "@/config/agentes";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Diagnostico() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiInfo, setApiInfo] = useState({ url: API_URL });
  const [searchParams] = useSearchParams();
  const [consulta, setConsulta] = useState('');
  const [agentesRecomendados, setAgentesRecomendados] = useState([]);
  const [modoConsulta, setModoConsulta] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Exibir informações do ambiente
    setApiInfo({
      url: API_URL,
      env: import.meta.env.MODE,
      variables: {
        VITE_API_URL: import.meta.env.VITE_API_URL || 'não definido'
      }
    });

    // Verificar se há uma consulta nos parâmetros da URL
    const consultaParam = searchParams.get('consulta');
    if (consultaParam) {
      setConsulta(consultaParam);
      setModoConsulta(true);
      buscarAgentesRecomendados(consultaParam);
    }
  }, [searchParams]);

  const buscarAgentesRecomendados = async (texto) => {
    setLoading(true);
    
    try {
      // Em um cenário real, isso seria uma chamada para a API
      // Aqui estamos simulando uma recomendação baseada em palavras-chave
      const palavrasChave = texto.toLowerCase().split(' ');
      
      // Pontuação para cada agente com base nas palavras-chave
      const pontuacao = {};
      
      Object.keys(agentesConfig).forEach(agenteId => {
        const agente = agentesConfig[agenteId];
        pontuacao[agenteId] = 0;
        
        // Verificar nome, descrição e especialidades
        const textoAgente = `${agente.nome} ${agente.descricao} ${agente.especialidades?.join(' ') || ''}`.toLowerCase();
        
        palavrasChave.forEach(palavra => {
          if (palavra.length > 3 && textoAgente.includes(palavra)) {
            pontuacao[agenteId] += 1;
          }
        });
      });
      
      // Ordenar agentes por pontuação
      const recomendados = Object.keys(pontuacao)
        .filter(id => pontuacao[id] > 0)
        .sort((a, b) => pontuacao[b] - pontuacao[a])
        .slice(0, 3)
        .map(id => ({
          id,
          ...agentesConfig[id],
          pontuacao: pontuacao[id]
        }));
      
      // Se não houver correspondências, mostrar os 3 primeiros agentes
      if (recomendados.length === 0) {
        const primeirosAgentes = Object.keys(agentesConfig)
          .slice(0, 3)
          .map(id => ({
            id,
            ...agentesConfig[id],
            pontuacao: 0
          }));
        
        setAgentesRecomendados(primeirosAgentes);
      } else {
        setAgentesRecomendados(recomendados);
      }
    } catch (error) {
      console.error('Erro ao buscar agentes recomendados:', error);
    } finally {
      setLoading(false);
    }
  };

  const navegarParaAgente = (agenteId) => {
    navigate(`/app/chat?agente=${agenteId}`);
  };

  const limparUsuario = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log(`Tentando acessar: ${API_URL}/users/debug/clean-users/${email}`);
      const response = await axios.get(`${API_URL}/users/debug/clean-users/${email}`);
      setResult(`Sucesso: ${response.data.message}`);
    } catch (error) {
      console.error('Erro completo:', error);
      setResult(`Erro: ${error.response?.data?.message || error.message}
Status: ${error.response?.status || 'Desconhecido'}
Detalhes: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const verificarStatusUsuario = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Verificar se o usuário existe
      await axios.post(`${API_URL}/users/login`, { 
        email, 
        password: 'senha-invalida-para-teste-123'
      });
      setResult('O usuário existe e conseguiu fazer login (improvável com senha de teste)');
    } catch (error) {
      if (error.response?.status === 401) {
        setResult('O usuário existe, mas a senha está incorreta (esperado para este teste)');
      } else if (error.response?.status === 400) {
        setResult(`Erro de validação: ${error.response.data.message}`);
      } else {
        setResult(`Erro ao verificar status: ${error.response?.data?.message || error.message}
Status: ${error.response?.status || 'Desconhecido'}
Detalhes: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const limparLocalStorage = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setResult('LocalStorage limpo. Os dados de autenticação foram removidos.');
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Testar o endpoint raiz primeiro
      const response = await axios.get('http://localhost:5000/');
      setResult(`Conexão com o backend bem-sucedida! Status: ${response.status}
Resposta: ${JSON.stringify(response.data, null, 2)}`);
    // eslint-disable-next-line no-unused-vars
    } catch (_) {
      // Tentar outro endpoint conhecido
      try {
        const response = await axios.get(`${API_URL}/users/login`);
        setResult(`Backend está funcionando (retornou status ${response.status})`);
      } catch (err) {
        if (err.response) {
          // Mesmo um erro 401 ou 404 significa que o backend está rodando
          setResult(`Backend está funcionando (retornou status ${err.response.status})`);
        } else {
          setResult(`Erro ao conectar com o backend: ${err.message}
Detalhes: ${JSON.stringify(err, null, 2)}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const testarLimpezaDireta = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Tentar acessar diretamente sem usar axios
      const url = `http://localhost:5000/api/users/debug/clean-users/${email}`;
      setResult(`Testando URL direta: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      setResult(`Resposta direta: 
Status: ${response.status}
Dados: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Erro ao testar diretamente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultaSubmit = (e) => {
    e.preventDefault();
    if (consulta.trim()) {
      buscarAgentesRecomendados(consulta);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {modoConsulta ? (
            <Card className="border border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-md rounded-xl overflow-hidden">
              <CardHeader className="space-y-1 border-b border-slate-700/50 bg-gradient-to-r from-blue-600 to-purple-700 p-6">
                <CardTitle className="text-4xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                  Agentes Recomendados
                </CardTitle>
                <CardDescription className="text-white/80 text-lg mt-2">
                  Com base na sua consulta: &quot;{consulta}&quot;
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <form onSubmit={handleConsultaSubmit} className="flex gap-3">
                    <Input 
                      placeholder="O que você precisa?" 
                      value={consulta}
                      onChange={(e) => setConsulta(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                    />
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </form>
                  
                  {loading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-pulse flex flex-col items-center gap-2">
                        <div className="w-12 h-12 relative">
                          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                        </div>
                        <span className="text-slate-400 text-sm">Analisando sua consulta...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {agentesRecomendados.map((agente) => (
                        <Card 
                          key={agente.id} 
                          className="border border-slate-700/50 hover:border-slate-500/50 transition-all cursor-pointer bg-slate-800/70"
                          onClick={() => navegarParaAgente(agente.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-r ${agente.cor || 'from-slate-500 to-slate-600'} text-xl`}>
                                {agente.icon || <Sparkles className="h-6 w-6 text-white" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-white">{agente.nome}</h3>
                                <p className="text-slate-400 text-sm line-clamp-2">{agente.descricao}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="text-slate-300">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {agentesRecomendados.length === 0 && !loading && (
                        <div className="text-center p-8">
                          <p className="text-slate-400">Nenhum agente encontrado para sua consulta.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-700/50 shadow-xl bg-slate-800/50 backdrop-blur-md rounded-xl overflow-hidden">
              <CardHeader className="space-y-1 border-b border-slate-700/50">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Ferramenta de Diagnóstico
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Use esta ferramenta para diagnosticar problemas com usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="p-4 bg-slate-900/50 rounded-lg text-xs border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="font-semibold mb-2 text-slate-300 flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      Informações do Ambiente:
                    </h3>
                    <pre className="whitespace-pre-wrap overflow-auto text-slate-400 p-2 bg-slate-800/50 rounded border border-slate-700/30">
                      {JSON.stringify(apiInfo, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email do Usuário</Label>
                    <Input 
                      id="email" 
                      placeholder="email@exemplo.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={testBackendConnection}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={loading}
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
                      Testar Conexão com Backend
                    </Button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <Button 
                        onClick={limparUsuario} 
                        disabled={!email || loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Remover Usuário
                      </Button>
                      <Button 
                        onClick={verificarStatusUsuario} 
                        disabled={!email || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Verificar Status
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        onClick={limparLocalStorage}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={loading}
                      >
                        <HardDrive className="w-4 h-4 mr-2" />
                        Limpar LocalStorage
                      </Button>
                      
                      <Button 
                        onClick={testarLimpezaDireta}
                        disabled={!email || loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Testar URL Direta
                      </Button>
                    </div>
                  </div>
                  
                  {loading && (
                    <div className="p-4 flex justify-center">
                      <div className="animate-pulse flex flex-col items-center gap-2">
                        <div className="w-8 h-8 relative">
                          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                        </div>
                        <span className="text-slate-400 text-sm">Executando operação...</span>
                      </div>
                    </div>
                  )}
                  
                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm mt-4"
                    >
                      <h3 className="font-semibold mb-2 text-slate-300">Resultado:</h3>
                      <pre className="whitespace-pre-wrap overflow-auto text-slate-400 p-3 bg-slate-800/70 rounded border border-slate-700/30 text-xs">
                        {result}
                      </pre>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-slate-500 text-sm"
        >
          Esta ferramenta é destinada apenas para fins de diagnóstico e suporte.
        </motion.div>
      </div>
    </div>
  );
} 