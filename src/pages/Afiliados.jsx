import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Indicacao } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Share2,
  Gift,
  Crown,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

export default function Afiliados() {
  const [user, setUser] = useState(null);
  const [indicacoes, setIndicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.eh_afiliado && userData.codigo_afiliado) {
        const indicacoesData = await Indicacao.filter(
          { codigo_afiliado: userData.codigo_afiliado }, 
          '-created_date'
        );
        setIndicacoes(indicacoesData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const tornarAfiliado = async () => {
    try {
      const codigoAfiliado = `BL${Date.now().toString(36).toUpperCase()}`;
      await User.updateMyUserData({
        eh_afiliado: true,
        codigo_afiliado: codigoAfiliado
      });
      setUser(prev => ({
        ...prev,
        eh_afiliado: true,
        codigo_afiliado: codigoAfiliado
      }));
    } catch (error) {
      console.error("Erro ao tornar afiliado:", error);
    }
  };

  const copiarLink = () => {
    const linkAfiliado = `${window.location.origin}?ref=${user.codigo_afiliado}`;
    navigator.clipboard.writeText(linkAfiliado);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  const compartilharLink = () => {
    const linkAfiliado = `${window.location.origin}?ref=${user.codigo_afiliado}`;
    const texto = `🚀 Descubra o BrandLab - A plataforma de IA que está revolucionando marcas de roupa! 

10 agentes especializados para turbinar sua marca:
📱 Marketing & Mídias Sociais 
🛒 E-commerce Estratégico
✨ Criação de Coleção
🎯 Tráfego Pago
💰 Gestão Financeira
E muito mais!

Use meu link e ganhe vantagens especiais: ${linkAfiliado}`;

    if (navigator.share) {
      navigator.share({
        title: 'BrandLab - IA para Marcas',
        text: texto,
        url: linkAfiliado,
      });
    } else {
      navigator.clipboard.writeText(texto);
      alert('Texto copiado! Cole onde quiser compartilhar.');
    }
  };

  const totalComissoes = indicacoes.reduce((sum, ind) => sum + (ind.valor_comissao || 0), 0);
  const comissoesPagas = indicacoes
    .filter(ind => ind.status_pagamento === 'pago')
    .reduce((sum, ind) => sum + (ind.valor_comissao || 0), 0);
  const comissoesPendentes = totalComissoes - comissoesPagas;

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
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Programa de Afiliados 🤝
          </h1>
          <p className="text-xl text-gray-600">
            Ganhe comissões indicando o BrandLab para outros empreendedores
          </p>
        </motion.div>

        {!user?.eh_afiliado ? (
          /* Seção para se tornar afiliado */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Torne-se um Afiliado BrandLab
                </h2>
                <p className="text-xl text-indigo-100 mb-6 max-w-2xl mx-auto">
                  Ganhe <strong>30% de comissão</strong> em cada venda que você indicar. 
                  Ideal para influenciadores e donos de marca que querem monetizar sua audiência.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">30%</div>
                    <p className="text-indigo-100">Comissão por venda</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">R$20-150</div>
                    <p className="text-indigo-100">Por indicação</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">∞</div>
                    <p className="text-indigo-100">Indicações ilimitadas</p>
                  </div>
                </div>

                <Button 
                  onClick={tornarAfiliado}
                  className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-xl font-semibold"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Quero ser Afiliado
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Dashboard do Afiliado */
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Indicações</p>
                        <p className="text-3xl font-bold text-gray-900">{indicacoes.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
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
                        <p className="text-gray-600 text-sm">Comissões Totais</p>
                        <p className="text-3xl font-bold text-gray-900">R$ {totalComissoes.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
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
                        <p className="text-gray-600 text-sm">Comissões Pagas</p>
                        <p className="text-3xl font-bold text-green-600">R$ {comissoesPagas.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
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
                        <p className="text-gray-600 text-sm">Pendentes</p>
                        <p className="text-3xl font-bold text-yellow-600">R$ {comissoesPendentes.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Link de Afiliado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Share2 className="w-6 h-6 text-indigo-600" />
                    Seu Link de Afiliado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        value={`${window.location.origin}?ref=${user.codigo_afiliado}`}
                        readOnly
                        className="flex-1 bg-gray-50"
                      />
                      <Button 
                        onClick={copiarLink}
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {linkCopiado ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button 
                        onClick={compartilharLink}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        <strong>Seu código:</strong> {user.codigo_afiliado}
                      </p>
                      <p className="text-sm text-indigo-600 mt-1">
                        Ganhe 30% de comissão em cada venda realizada através do seu link!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Histórico de Indicações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    Histórico de Indicações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {indicacoes.length > 0 ? (
                    <div className="space-y-4">
                      {indicacoes.map((indicacao) => (
                        <div key={indicacao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Plano {indicacao.plano_contratado?.charAt(0).toUpperCase() + indicacao.plano_contratado?.slice(1)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(indicacao.data_conversao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              R$ {(indicacao.valor_comissao || 0).toFixed(2)}
                            </p>
                            <Badge className={
                              indicacao.status_pagamento === 'pago' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {indicacao.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma indicação ainda</p>
                      <p className="text-sm text-gray-400">
                        Compartilhe seu link para começar a ganhar comissões!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}