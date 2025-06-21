import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart } from 'lucide-react';
import { MessageSquare } from 'lucide-react';

const ChartTypes = {
  BAR: 'bar',
  PIE: 'pie'
};

// Função para extrair a cor do gradiente
const extractColor = (gradientClass) => {
  if (!gradientClass) return '#666666';
  
  // Mapear classes de gradiente para cores sólidas
  const colorMap = {
    'from-pink-500': '#ec4899',
    'from-blue-500': '#3b82f6',
    'from-purple-500': '#a855f7',
    'from-green-500': '#22c55e',
    'from-orange-500': '#f97316',
    'from-yellow-500': '#eab308',
    'from-teal-500': '#14b8a6',
    'from-indigo-500': '#6366f1',
    'from-violet-500': '#8b5cf6',
    'from-amber-500': '#f59e0b',
    'from-rose-500': '#f43f5e',
    'from-gray-500': '#6b7280'
  };
  
  // Encontrar a parte "from-*" no gradiente
  const fromPart = gradientClass.split(' ').find(part => part.startsWith('from-'));
  
  return fromPart && colorMap[fromPart] ? colorMap[fromPart] : '#666666';
};

UsageChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nome: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      cor: PropTypes.string
    })
  ).isRequired,
  maxValue: PropTypes.number.isRequired,
  onAgenteClick: PropTypes.func.isRequired
};

export default function UsageChart({ data, maxValue, onAgenteClick }) {
  const [chartType, setChartType] = useState(ChartTypes.BAR);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Hook para detectar o tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    // Verificar tamanho inicial
    checkScreenSize();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const renderBarChart = () => (
    <div className="h-64 w-full">
      <div className="flex h-full items-end">
        <div className="relative h-full w-full">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex md:grid md:grid-cols-6 gap-1 md:gap-2">
            {data.map((agente) => (
              <div 
                key={agente.id} 
                className="flex-1 min-w-0 flex flex-col justify-end cursor-pointer group h-full"
                onClick={() => onAgenteClick(agente.id)}
              >
                <div className="relative h-full flex flex-col justify-end">
                  <div 
                    className={`bg-gradient-to-br ${
                      agente.cor || 'from-gray-500 to-gray-600'
                    } opacity-80 rounded-t-md transition-all duration-300 group-hover:opacity-100`} 
                    style={{ height: `${Math.max(20, (agente.count / maxValue) * 100)}%`, minHeight: '20px' }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {agente.count} {agente.count === 1 ? 'uso' : 'usos'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex md:grid md:grid-cols-6 gap-1 md:gap-2 text-xs text-muted-foreground">
        {data.map((agente) => (
          <div key={agente.id} className="flex-1 min-w-0 truncate text-center px-1" title={agente.nome}>
            {agente.nome.length > 8 && isMobile ? `${agente.nome.substring(0, 6)}...` : agente.nome}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => {
    // Calcular o total para porcentagens
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((agente, index) => {
              // Calcular ângulos para o gráfico de pizza
              const percentage = (agente.count / total) * 100;
              const startAngle = data.slice(0, index).reduce((acc, curr) => acc + ((curr.count / total) * 360), 0);
              const endAngle = startAngle + ((agente.count / total) * 360);
              
              // Converter ângulos para coordenadas
              const startRadians = (startAngle - 90) * Math.PI / 180;
              const endRadians = (endAngle - 90) * Math.PI / 180;
              
              const startX = 50 + 50 * Math.cos(startRadians);
              const startY = 50 + 50 * Math.sin(startRadians);
              const endX = 50 + 50 * Math.cos(endRadians);
              const endY = 50 + 50 * Math.sin(endRadians);
              
              // Determinar se o arco é maior que 180 graus
              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
              
              // Cor do agente
              const color = extractColor(agente.cor);
              
              return (
                <g key={agente.id} className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onAgenteClick(agente.id)}>
                  <path
                    d={`M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="0.5"
                  >
                    <title>{agente.nome}: {agente.count} ({percentage.toFixed(1)}%)</title>
                  </path>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 text-xs max-w-full">
          {data.map((agente) => {
            const color = extractColor(agente.cor);
            const displayName = agente.nome.length > 12 && isSmallScreen ? 
              `${agente.nome.substring(0, 10)}...` : agente.nome;
            
            return (
              <div key={agente.id} className="flex items-center gap-1 justify-center">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                <span className="truncate text-xs" title={agente.nome}>{displayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl font-semibold">Uso de Agentes IA</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <Button
                variant={chartType === ChartTypes.BAR ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8"
                onClick={() => setChartType(ChartTypes.BAR)}
                title="Gráfico de Barras"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === ChartTypes.PIE ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8"
                onClick={() => setChartType(ChartTypes.PIE)}
                title="Gráfico de Pizza"
              >
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              Agentes mais utilizados
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data.length === 0 ? (
          <div className="h-64 w-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-muted-foreground mb-2">Nenhum uso de agente registrado</p>
            <p className="text-sm text-muted-foreground">
              Comece a conversar com agentes para ver estatísticas de uso
            </p>
          </div>
        ) : (
          <>
            {chartType === ChartTypes.BAR && renderBarChart()}
            {chartType === ChartTypes.PIE && renderPieChart()}
          </>
        )}
      </CardContent>
    </Card>
  );
} 