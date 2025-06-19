import { useState } from "react";
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion"; // Importando framer-motion para animações
import { 
  TextIcon,
  PaletteIcon,
  TypeIcon,
  LayoutIcon,
  MessageSquareIcon,
  SparklesIcon,
  ZapIcon
} from "lucide-react";
import { GenerateImageService } from '@/api/integrations'; // Serviço para gerar imagens

// Tamanhos de imagem disponíveis
const AVAILABLE_SIZES = [
  { id: 'square', name: 'Quadrado', value: '1024x1024', icon: '◼️' },
  { id: 'portrait', name: 'Retrato', value: '1024x1792', icon: '🖼️' },
  { id: 'landscape', name: 'Paisagem', value: '1792x1024', icon: '🏙️' }
];

// Estilos de imagem para sugestões rápidas
const IMAGE_STYLES = [
  'Fotografia', 'Ilustração 3D', 'Desenho Animado', 
  'Pixel Art', 'Minimalista', 'Aquarela', 'Flat Design'
];

export default function DesignerInterface({ onImageGenerated, user, agenteConfigData }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState('1024x1024'); // Tamanho padrão (quadrado)
  const [includeText, setIncludeText] = useState(false);
  const [textOverlay, setTextOverlay] = useState('');
  const [textPosition, setTextPosition] = useState('bottom');
  const [usarDocumentos, setUsarDocumentos] = useState(true);
  
  // Verificar se existem documentos disponíveis
  const hasDocuments = agenteConfigData?.documentos_treinamento?.length > 0;

  // Adicionar um estilo ao prompt atual
  const addStyleToPrompt = (style) => {
    setPrompt(current => 
      current ? `${current}, no estilo ${style}` : `Imagem no estilo ${style}`
    );
  };

  // Gerar imagem
  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      // Preparar os dados para a requisição
      const requestData = {
        prompt: prompt,
        size: imageSize,
        n: 1, // Número de imagens a gerar
        response_format: "url", // Formato da resposta
        agente_id: agenteConfigData?.codigo || "designer",
      };
      
      // Adicionar texto na imagem, se solicitado
      if (includeText && textOverlay) {
        requestData.text_overlay = {
          text: textOverlay,
          position: textPosition
        };
      }
      
      // Adicionar flag para usar documentos de treinamento
      if (hasDocuments) {
        requestData.usar_documentos = usarDocumentos;
      }
      
      // Chamar a API para gerar a imagem
      const response = await GenerateImageService.generate(requestData);
      
      if (response && response.url) {
        // Notificar componente pai sobre a nova imagem
        onImageGenerated(response.url, prompt);
        
        // Opcional: limpar o prompt após gerar com sucesso
        setPrompt('');
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Ocorreu um erro ao gerar a imagem. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Sugestões de prompts pré-definidos
  const suggestPrompt = (type) => {
    let suggestion = '';
    
    switch(type) {
      case 'logo':
        suggestion = "Um logotipo moderno e profissional para uma empresa de tecnologia, com elementos futuristas, em tons de azul e roxo";
        break;
      case 'social':
        suggestion = "Uma imagem para post de Instagram sobre inovação e tecnologia, com design clean e moderno";
        break;
      case 'product':
        suggestion = "Uma fotografia de produto profissional para um smartphone moderno em um ambiente minimalista";
        break;
      default:
        suggestion = "";
    }
    
    setPrompt(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-auto"
        >
          <Card className="w-full h-auto border-none shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                Gerador de Imagens Mágicas
              </CardTitle>
              <CardDescription className="text-white/80">
                Transforme suas ideias em arte visual com IA avançada
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              {/* Seção de prompt */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-3 border border-purple-200 dark:border-purple-800 p-5 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm"
              >
                <Label className="text-md font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <MessageSquareIcon className="w-4 h-4" />
                  Descrição da imagem
                </Label>
                <Textarea 
                  placeholder="Descreva detalhadamente a imagem que você deseja criar..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none bg-white/50 dark:bg-black/10 border-purple-200 dark:border-purple-800 focus:border-purple-400 focus:ring-purple-400"
                />
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => suggestPrompt('logo')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                  >
                    Sugestão: Logotipo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => suggestPrompt('social')}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none hover:from-pink-600 hover:to-rose-600 transition-all duration-300"
                  >
                    Sugestão: Redes Sociais
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => suggestPrompt('product')}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                  >
                    Sugestão: Produto
                  </Button>
                </div>
              </motion.div>
              
              {/* Seção de proporção */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-3 border border-blue-200 dark:border-blue-800 p-5 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm"
              >
                <Label className="text-md font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <LayoutIcon className="w-4 h-4" />
                  Proporção da imagem
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <Button 
                      key={size.id}
                      variant={imageSize === size.value ? "default" : "outline"}
                      className={`flex flex-col p-3 h-auto transition-all duration-300 ${
                        imageSize === size.value 
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none shadow-md" 
                          : "border border-blue-200 dark:border-blue-800 hover:border-blue-400"
                      }`}
                      onClick={() => setImageSize(size.value)}
                    >
                      <span className="text-xl mb-1">{size.icon}</span>
                      <span className="text-sm font-medium">{size.name}</span>
                      <span className={`text-xs ${imageSize === size.value ? "text-white/80" : "text-muted-foreground"}`}>{size.value}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
              
              {/* Seção de texto na imagem */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-3 border border-green-200 dark:border-green-800 p-5 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-md font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
                    <TextIcon className="w-4 h-4" />
                    Texto na imagem
                  </Label>
                  <Switch
                    id="include-text"
                    checked={includeText}
                    onCheckedChange={setIncludeText}
                    className="data-[state=checked]:bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
                
                {includeText && (
                  <div className="space-y-3 mt-2 pl-2 border-l-2 border-green-300 dark:border-green-700">
                    <div className="space-y-2">
                      <Label>Texto a ser incluído</Label>
                      <Input
                        placeholder="Ex: Nome da marca, slogan..."
                        value={textOverlay}
                        onChange={(e) => setTextOverlay(e.target.value)}
                        className="bg-white/50 dark:bg-black/10 border-green-200 dark:border-green-800 focus:border-green-400 focus:ring-green-400"
                      />
                      <p className="text-xs text-muted-foreground italic">
                        O texto será incluído exatamente como digitado, em português.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Posição do texto</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={textPosition === 'top' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextPosition('top')}
                          className={`flex items-center justify-center gap-2 ${
                            textPosition === 'top' 
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none" 
                              : "border border-green-200 dark:border-green-800"
                          }`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          Topo
                        </Button>
                        <Button 
                          variant={textPosition === 'center' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextPosition('center')}
                          className={`flex items-center justify-center gap-2 ${
                            textPosition === 'center' 
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none" 
                              : "border border-green-200 dark:border-green-800"
                          }`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          Centro
                        </Button>
                        <Button 
                          variant={textPosition === 'bottom' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextPosition('bottom')}
                          className={`flex items-center justify-center gap-2 ${
                            textPosition === 'bottom' 
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none" 
                              : "border border-green-200 dark:border-green-800"
                          }`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          Base
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              
              {/* Seção de estilos */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="space-y-3 border border-pink-200 dark:border-pink-800 p-5 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm"
              >
                <Label className="text-md font-medium flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  <PaletteIcon className="w-4 h-4" />
                  Estilo da imagem
                </Label>
                <div className="flex flex-wrap gap-2">
                  {IMAGE_STYLES.map(style => (
                    <Button 
                      key={style}
                      variant="outline" 
                      size="sm"
                      onClick={() => addStyleToPrompt(style)}
                      className="border border-pink-200 dark:border-pink-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white hover:border-transparent transition-all duration-300"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </motion.div>
              
              {/* Opção de usar documentos de treinamento */}
              {hasDocuments && (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center justify-between border border-amber-200 dark:border-amber-800 p-5 rounded-xl bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-sm"
                >
                  <Label htmlFor="use-docs" className="text-md font-medium text-amber-700 dark:text-amber-300">
                    Utilizar documentos de treinamento ({agenteConfigData?.documentos_treinamento?.length})
                  </Label>
                  <Switch
                    id="use-docs"
                    checked={usarDocumentos}
                    onCheckedChange={setUsarDocumentos}
                    className="data-[state=checked]:bg-gradient-to-r from-amber-500 to-orange-500"
                  />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="fixed bottom-0 right-0 w-full lg:w-[30%] p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md border-t border-indigo-200 dark:border-indigo-800 z-20">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 h-12 text-lg shadow-lg shadow-purple-500/20 border-none transition-all duration-300"
            onClick={handleGenerateImage}
            disabled={loading || !prompt || (user?.role !== 'admin' && user?.creditos_restantes <= 0)}
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                Gerando imagem...
              </>
            ) : (
              <>
                <ZapIcon className="mr-2 w-5 h-5 animate-pulse" />
                Gerar Imagem
              </>
            )}
          </Button>
        </motion.div>
        
        {user?.role !== 'admin' && (
          <p className="text-xs text-center mt-2 bg-white/30 dark:bg-black/30 p-2 rounded-md backdrop-blur-sm">
            {user?.creditos_restantes > 0 ? 
              <span className="text-indigo-700 dark:text-indigo-300 font-medium">Créditos disponíveis: {user.creditos_restantes}</span> : 
              <span className="text-rose-600 dark:text-rose-400">Sem créditos disponíveis. Faça upgrade do seu plano.</span>}
          </p>
        )}
      </div>
    </div>
  );
}

// Adicionar validação de props
DesignerInterface.propTypes = {
  onImageGenerated: PropTypes.func.isRequired,
  user: PropTypes.shape({
    role: PropTypes.string,
    creditos_restantes: PropTypes.number
  }),
  agenteConfigData: PropTypes.shape({
    codigo: PropTypes.string,
    documentos_treinamento: PropTypes.array
  })
};

// Valores padrão para evitar erros quando props estiverem ausentes
DesignerInterface.defaultProps = {
  user: { role: 'user', creditos_restantes: 0 },
  agenteConfigData: { codigo: 'designer', documentos_treinamento: [] }
};