import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Diagnostico() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiInfo, setApiInfo] = useState({ url: API_URL });

  useEffect(() => {
    // Exibir informações do ambiente
    setApiInfo({
      url: API_URL,
      env: import.meta.env.MODE,
      variables: {
        VITE_API_URL: import.meta.env.VITE_API_URL || 'não definido'
      }
    });
  }, []);

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
      const response = await axios.post(`${API_URL}/users/login`, { 
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
    } catch (error) {
      // Tentar outro endpoint conhecido
      try {
        const response = await axios.get(`${API_URL}/users/login`);
        setResult(`Backend está funcionando (retornou status ${response.status})`);
      } catch (error) {
        if (error.response) {
          // Mesmo um erro 401 ou 404 significa que o backend está rodando
          setResult(`Backend está funcionando (retornou status ${error.response.status})`);
        } else {
          setResult(`Erro ao conectar com o backend: ${error.message}
Detalhes: ${JSON.stringify(error, null, 2)}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-indigo-600">
              Ferramenta de Diagnóstico
            </CardTitle>
            <CardDescription className="text-gray-500">
              Use esta ferramenta para diagnosticar problemas com usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 rounded-md text-xs">
                <h3 className="font-semibold mb-1">Informações do Ambiente:</h3>
                <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(apiInfo, null, 2)}</pre>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email do Usuário</Label>
                <Input 
                  id="email" 
                  placeholder="email@exemplo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={testBackendConnection}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Testar Conexão com Backend
                </Button>
                
                <div className="flex flex-col gap-2 sm:flex-row mt-2">
                  <Button 
                    onClick={limparUsuario} 
                    disabled={!email || loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remover Usuário
                  </Button>
                  <Button 
                    onClick={verificarStatusUsuario} 
                    disabled={!email || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Verificar Status
                  </Button>
                  <Button 
                    onClick={limparLocalStorage}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Limpar LocalStorage
                  </Button>
                </div>
                
                <Button 
                  onClick={testarLimpezaDireta}
                  disabled={!email || loading}
                  className="bg-purple-600 hover:bg-purple-700 mt-2"
                >
                  Testar URL Direta
                </Button>
              </div>
              
              {result && (
                <div className="p-4 bg-gray-100 rounded-md text-gray-800 mt-4">
                  <pre className="whitespace-pre-wrap overflow-auto">{result}</pre>
                </div>
              )}
              
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">Instruções:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Primeiro teste a conexão com o backend para verificar se está funcionando.</li>
                  <li>Para resolver problemas de "usuário já existe" mas não consegue fazer login, use "Remover Usuário" com o email problemático.</li>
                  <li>Use "Verificar Status" para checar se um usuário existe no banco de dados.</li>
                  <li>Se estiver com problemas de login após cadastro, use "Limpar LocalStorage" e tente fazer login novamente.</li>
                  <li>Se o botão "Remover Usuário" não funcionar, tente o "Testar URL Direta" que usa fetch em vez de axios.</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 