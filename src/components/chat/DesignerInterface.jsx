import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { GenerateImage } from "@/api/integrations";
import { Image as ImageIcon, Loader } from "lucide-react";

export default function DesignerInterface({ onImageGenerated, user, agenteConfigData }) {
  const [prompt, setPrompt] = useState("");
  const [gerandoImagem, setGerandoImagem] = useState(false);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    // Verificar créditos (admin tem créditos ilimitados)
    if (user?.role !== 'admin' && user?.creditos_restantes <= 0) {
      alert("Você não tem créditos suficientes para gerar imagens!");
      return;
    }

    setGerandoImagem(true);
    try {
      // Incluir contexto dos documentos se disponível
      let promptCompleto = prompt.trim();
      
      if (agenteConfigData?.documentos_treinamento?.length > 0) {
        promptCompleto = `Para uma marca de roupa (baseado nos documentos de briefing fornecidos): ${prompt}. Estilo profissional, alta qualidade, adequado para moda e branding.`;
      } else {
        promptCompleto = `Para uma marca de roupa: ${prompt}. Estilo profissional, alta qualidade, adequado para moda e branding.`;
      }

      const response = await GenerateImage({ 
        prompt: promptCompleto,
        ...(agenteConfigData?.documentos_treinamento?.length > 0 && {
          file_urls: agenteConfigData.documentos_treinamento.map(doc => doc.url_arquivo)
        })
      });

      if (onImageGenerated && response.url) {
        await onImageGenerated(response.url, prompt);
        setPrompt(""); // Limpar o campo após sucesso
      } else {
        alert("Erro: URL da imagem não foi retornada.");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      alert("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setGerandoImagem(false);
    }
  };

  // Verificar se é admin para exibição de créditos
  const isAdmin = user?.role === 'admin';
  const hasCredits = isAdmin || (user?.creditos_restantes > 0);

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-6 h-6 text-rose-600" />
          <h3 className="font-semibold text-lg text-gray-900">Gerador de Imagens IA</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Descreva a imagem que você quer criar:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Logo moderno para marca de roupas femininas, cores rosa e dourado, estilo minimalista..."
              rows={3}
              className="resize-none"
            />
          </div>
          
          <Button 
            onClick={handleGenerateImage}
            disabled={!prompt.trim() || gerandoImagem || (!isAdmin && !hasCredits)}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          >
            {gerandoImagem ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Gerando imagem...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Gerar Imagem {isAdmin ? "(∞ créditos)" : `(${user?.creditos_restantes || 0} créditos)`}
              </>
            )}
          </Button>
          
          {gerandoImagem && (
            <div className="text-center text-sm text-gray-600">
              <p>A geração de imagem pode levar alguns segundos...</p>
            </div>
          )}

          {!hasCredits && !isAdmin && (
            <p className="text-center text-red-600 text-sm">
              Sem créditos disponíveis para gerar imagens.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}