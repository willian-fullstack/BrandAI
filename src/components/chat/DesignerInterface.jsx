import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
    if (!prompt) {
      alert("Por favor, descreva a imagem que deseja gerar");
      return;
    }
    
    // Verificar créditos (admin tem créditos ilimitados)
    if (user?.role !== 'admin' && (user?.creditos_restantes <= 0)) {
      alert("Você não tem créditos suficientes. Faça upgrade do seu plano!");
      return;
    }
    
    setLoading(true);
    
    try {
      // Construir o prompt completo
      let fullPrompt = prompt;
      
      // Adicionar instruções sobre o texto a ser incluído
      if (includeText && textOverlay) {
        fullPrompt += `. Inclua o texto "${textOverlay}" na posição ${
          textPosition === 'top' ? 'superior' : 
          textPosition === 'center' ? 'central' : 
          'inferior'
        } da imagem.`;
      }

      // Determinar qual agente está sendo usado
      const agente_id = agenteConfigData?.codigo || 'designer';
      
      // Configurar parâmetros para a API
      const params = {
        prompt: fullPrompt,
        size: imageSize,
        agente_id: agente_id,
        use_documents: usarDocumentos
      };
      
      // Adicionar parâmetros para texto na imagem se necessário
      if (includeText && textOverlay) {
        params.text_overlay = textOverlay;
        params.text_position = textPosition;
      }
      
      // Chamar o serviço para gerar a imagem
      const result = await GenerateImageService(params);
      
      if (result && result.image_url) {
        // Notificar componente pai sobre a imagem gerada
        onImageGenerated(result.image_url, fullPrompt);
        
        // Limpar campos após sucesso
        setPrompt('');
        setIncludeText(false);
        setTextOverlay('');
      } else {
        throw new Error("Não foi possível gerar a imagem");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert(`Erro ao gerar imagem: ${error.message || "Tente novamente"}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para sugerir um prompt baseado em um tema
  const suggestPrompt = (theme) => {
    const themes = {
      logo: "Um logotipo moderno e clean para uma marca de roupa chamada 'Estilo Urbano'",
      social: "Um banner para Instagram para promoção de coleção de verão de uma marca de roupa",
      product: "Uma fotografia de produto para um catálogo de moda, mostrando uma jaqueta jeans"
    };
    
    setPrompt(themes[theme] || themes.logo);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Wand2Icon className="w-5 h-5" />
          Gerador de Imagens
        </CardTitle>
        <CardDescription>
          Crie imagens personalizadas para sua marca usando inteligência artificial
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seção de prompt */}
        <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
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
        <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
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
                <span className="text-xs text-gray-500">{size.value}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Seção de texto na imagem */}
        <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
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
            <div className="space-y-3 mt-2 pl-2 border-l-2 border-gray-200">
              <div className="space-y-2">
                <Label>Texto a ser incluído</Label>
                <Input
                  placeholder="Ex: Nome da marca, slogan..."
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                />
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
        <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
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
          <div className="flex items-center justify-between border p-4 rounded-lg bg-gray-50">
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
      
      <CardFooter className="flex flex-col gap-2 pt-2">
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
          <p className="text-xs text-gray-500 w-full text-center">
            {user?.creditos_restantes > 0 ? 
              `Créditos disponíveis: ${user.creditos_restantes}` : 
              "Sem créditos disponíveis. Faça upgrade do seu plano."}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}