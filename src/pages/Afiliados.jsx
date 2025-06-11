import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Indicacao } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Share2,
  Gift,
  Crown,
  CheckCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-t-2 border-primary/70 animate-spin-slow"></div>
          </div>
          <span className="text-muted-foreground font-medium">Carregando programa de afiliados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Programa de Afiliados 🤝
          </h1>
          <p className="text-xl text-muted-foreground">
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
            <Card className="bg-gradient-to-br from-indigo-800/80 to-purple-900/80 backdrop-blur-md text-white border-0 shadow-xl rounded-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
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
                  <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-white mb-2">30%</div>
                    <p className="text-indigo-100">Comissão por venda</p>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-white mb-2">R$20-150</div>
                    <p className="text-indigo-100">Por indicação</p>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-white mb-2">∞</div>
                    <p className="text-indigo-100">Indicações ilimitadas</p>
                  </div>
                </div>

                <Button 
                  onClick={tornarAfiliado}
                  className="bg-white text-indigo-600 hover:bg-white/90 text-lg px-8 py-3 rounded-xl font-semibold"
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Indicações</p>
                        <p className="text-3xl font-bold text-foreground">{indicacoes.length}</p>
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Ganhos Totais</p>
                        <p className="text-3xl font-bold text-green-500">{`R$ ${totalComissoes.toFixed(2)}`}</p>
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Comissões Pagas</p>
                        <p className="text-3xl font-bold text-foreground">{`R$ ${comissoesPagas.toFixed(2)}`}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Pendente</p>
                        <p className="text-3xl font-bold text-amber-500">{`R$ ${comissoesPendentes.toFixed(2)}`}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            {/* Link do Afiliado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Seu Link de Afiliado</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input 
                        value={`${window.location.origin}?ref=${user.codigo_afiliado}`}
                        readOnly
                        className="font-mono text-sm"
                      />
                    </div>
                    <Button
                      onClick={copiarLink}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {linkCopiado ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={compartilharLink}
                      variant="outline"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Compartilhe este link. Você recebe 30% de cada venda que vier por ele.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Tabela de Indicações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Histórico de Indicações</CardTitle>
                </CardHeader>
                <CardContent>
                  {indicacoes.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma indicação ainda</h3>
                      <p className="text-muted-foreground">
                        Compartilhe seu link e comece a ganhar comissões!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 text-muted-foreground font-medium">Cliente</th>
                            <th className="text-left py-3 text-muted-foreground font-medium">Plano</th>
                            <th className="text-left py-3 text-muted-foreground font-medium">Data</th>
                            <th className="text-right py-3 text-muted-foreground font-medium">Valor</th>
                            <th className="text-right py-3 text-muted-foreground font-medium">Comissão</th>
                            <th className="text-center py-3 text-muted-foreground font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {indicacoes.map((indicacao, index) => (
                            <tr 
                              key={indicacao.id || index} 
                              className="border-b border-border hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-3 text-foreground">
                                {indicacao.usuario_nome || 'Anônimo'}
                              </td>
                              <td className="py-3">
                                <Badge variant="outline" className="bg-card border-border">
                                  {indicacao.plano_adquirido === 'premium' && 'Premium'}
                                  {indicacao.plano_adquirido === 'intermediario' && 'Intermediário'}
                                  {indicacao.plano_adquirido === 'basico' && 'Básico'}
                                </Badge>
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {new Date(indicacao.data_compra).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="py-3 text-right text-foreground font-medium">
                                R$ {indicacao.valor_venda?.toFixed(2) || '0.00'}
                              </td>
                              <td className="py-3 text-right text-green-500 font-bold">
                                R$ {indicacao.valor_comissao?.toFixed(2) || '0.00'}
                              </td>
                              <td className="py-3 text-center">
                                {indicacao.status_pagamento === 'pago' ? (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                                    Pago
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                                    Pendente
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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