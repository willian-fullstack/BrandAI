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
import { 
  Wand2Icon,
  TextIcon,
  PaletteIcon,
  TypeIcon,
  LayoutIcon,
  MessageSquareIcon
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
        <Card className="w-full h-auto border-none shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wand2Icon className="w-5 h-5" />
              Gerador de Imagens
            </CardTitle>
            <CardDescription>
              Crie imagens personalizadas para sua marca usando inteligência artificial
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Seção de prompt */}
            <div className="space-y-3 border p-4 rounded-lg bg-card">
              <Label className="text-md font-medium flex items-center gap-2">
                <MessageSquareIcon className="w-4 h-4" />
                Descrição da imagem
              </Label>
              <Textarea 
                placeholder="Descreva detalhadamente a imagem que você deseja criar..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => suggestPrompt('logo')}
                >
                  Sugestão: Logotipo
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => suggestPrompt('social')}
                >
                  Sugestão: Redes Sociais
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => suggestPrompt('product')}
                >
                  Sugestão: Produto
                </Button>
              </div>
            </div>
            
            {/* Seção de proporção */}
            <div className="space-y-3 border p-4 rounded-lg bg-card">
              <Label className="text-md font-medium flex items-center gap-2">
                <LayoutIcon className="w-4 h-4" />
                Proporção da imagem
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SIZES.map(size => (
                  <Button 
                    key={size.id}
                    variant={imageSize === size.value ? "default" : "outline"}
                    className="flex flex-col p-3 h-auto"
                    onClick={() => setImageSize(size.value)}
                  >
                    <span className="text-xl mb-1">{size.icon}</span>
                    <span className="text-sm font-medium">{size.name}</span>
                    <span className="text-xs text-muted-foreground">{size.value}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Seção de texto na imagem */}
            <div className="space-y-3 border p-4 rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-md font-medium flex items-center gap-2">
                  <TextIcon className="w-4 h-4" />
                  Texto na imagem
                </Label>
                <Switch
                  id="include-text"
                  checked={includeText}
                  onCheckedChange={setIncludeText}
                />
              </div>
              
              {includeText && (
                <div className="space-y-3 mt-2 pl-2 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Texto a ser incluído</Label>
                    <Input
                      placeholder="Ex: Nome da marca, slogan..."
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
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
                        className="flex items-center justify-center gap-2"
                      >
                        <TypeIcon className="w-3 h-3" />
                        Topo
                      </Button>
                      <Button 
                        variant={textPosition === 'center' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTextPosition('center')}
                        className="flex items-center justify-center gap-2"
                      >
                        <TypeIcon className="w-3 h-3" />
                        Centro
                      </Button>
                      <Button 
                        variant={textPosition === 'bottom' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTextPosition('bottom')}
                        className="flex items-center justify-center gap-2"
                      >
                        <TypeIcon className="w-3 h-3" />
                        Base
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Seção de estilos */}
            <div className="space-y-3 border p-4 rounded-lg bg-card">
              <Label className="text-md font-medium flex items-center gap-2">
                <PaletteIcon className="w-4 h-4" />
                Estilo da imagem (opcional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {IMAGE_STYLES.map(style => (
                  <Button 
                    key={style}
                    variant="outline" 
                    size="sm"
                    onClick={() => addStyleToPrompt(style)}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Opção de usar documentos de treinamento */}
            {hasDocuments && (
              <div className="flex items-center justify-between border p-4 rounded-lg bg-card">
                <Label htmlFor="use-docs" className="text-md font-medium">
                  Utilizar documentos de treinamento ({agenteConfigData?.documentos_treinamento?.length})
                </Label>
                <Switch
                  id="use-docs"
                  checked={usarDocumentos}
                  onCheckedChange={setUsarDocumentos}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="fixed bottom-0 right-0 w-full lg:w-[30%] p-4 bg-background border-t border-border z-20">
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12 text-lg"
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
              <Wand2Icon className="mr-2 w-5 h-5" />
              Gerar Imagem
            </>
          )}
        </Button>
        
        {user?.role !== 'admin' && (
          <p className="text-xs text-muted-foreground w-full text-center mt-2">
            {user?.creditos_restantes > 0 ? 
              `Créditos disponíveis: ${user.creditos_restantes}` : 
              "Sem créditos disponíveis. Faça upgrade do seu plano."}
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