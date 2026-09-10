import React, { useRef, useEffect, useState } from 'react';
import { HalftoneSettings } from '../types';
import { renderHalftoneCanvas, exportHalftoneImage } from '../utils/halftoneEngine';
import { 
  Download, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface HalftoneCanvasProps {
  imageUrl: string;
  imageTitle: string;
  settings: HalftoneSettings;
}

export const HalftoneCanvas: React.FC<HalftoneCanvasProps> = ({
  imageUrl,
  imageTitle,
  settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Carrega a imagem
  useEffect(() => {
    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      setImageElement(img);
      setImgDimensions({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
      setIsLoading(false);
    };

    img.onerror = () => {
      // Fallback sem crossOrigin se houver restrição
      const fallback = new Image();
      fallback.src = imageUrl;
      fallback.onload = () => {
        setImageElement(fallback);
        setImgDimensions({
          width: fallback.naturalWidth || fallback.width,
          height: fallback.naturalHeight || fallback.height
        });
        setIsLoading(false);
      };
      fallback.onerror = () => {
        setIsLoading(false);
      };
    };
  }, [imageUrl]);

  // Renderiza no canvas quando configurações ou imagem mudam
  useEffect(() => {
    if (!canvasRef.current || !imageElement || isLoading) return;

    const canvas = canvasRef.current;
    // Define a resolução interna do canvas proporcional para visualização nítida
    const maxPreviewDim = 1200;
    let w = imageElement.naturalWidth || imageElement.width || 800;
    let h = imageElement.naturalHeight || imageElement.height || 800;

    if (w > maxPreviewDim || h > maxPreviewDim) {
      if (w > h) {
        h = Math.round((h * maxPreviewDim) / w);
        w = maxPreviewDim;
      } else {
        w = Math.round((w * maxPreviewDim) / h);
        h = maxPreviewDim;
      }
    }

    canvas.width = w;
    canvas.height = h;

    renderHalftoneCanvas(canvas, imageElement, settings);
  }, [imageElement, isLoading, settings]);

  // Função para baixar a imagem pronta em alta resolução
  const handleDownloadReadyImage = async () => {
    if (!imageElement || isExporting) return;

    setIsExporting(true);
    try {
      const dataUrl = await exportHalftoneImage(imageElement, settings);
      
      const link = document.createElement('a');
      const safeTitle = imageTitle.toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
      link.download = `${safeTitle || 'arte'}_halftone.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      // Fallback: baixar o canvas direto
      if (canvasRef.current) {
        const fallbackUrl = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'halftone_resultado.png';
        link.href = fallbackUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden relative">
      {/* Barra de Ações Superior do Canvas */}
      <div className="h-12 px-4 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs">
            {imageTitle}
          </span>
          {imgDimensions.width > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400">
              {imgDimensions.width} × {imgDimensions.height} px
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botão para alternar com a imagem original */}
          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              showOriginal
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700'
            }`}
          >
            {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showOriginal ? 'Vendo Original' : 'Ver Original'}</span>
          </button>

          {/* Botão de Download de Alta Prioridade */}
          <button
            type="button"
            onClick={handleDownloadReadyImage}
            disabled={isLoading || isExporting}
            className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 flex items-center gap-1.5 shadow-sm transition-all hover:shadow-cyan-500/20 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                <span>Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Processando...' : 'Baixar Imagem Pronta'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Palco Central do Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative select-none">
        {/* Padrão de fundo quadriculado para transparência */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #262626 25%, transparent 25%), 
              linear-gradient(-45deg, #262626 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #262626 75%), 
              linear-gradient(-45deg, transparent 75%, #262626 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
          }}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Carregando imagem...</span>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-neutral-800/80 bg-neutral-950">
            {/* Visualização da Imagem Original (quando ativada) */}
            {showOriginal && imageElement && (
              <img
                src={imageUrl}
                alt="Imagem Original"
                className="max-h-[75vh] max-w-full object-contain"
                crossOrigin="anonymous"
              />
            )}

            {/* Canvas Halftone Renderizado */}
            <canvas
              ref={canvasRef}
              className={`max-h-[75vh] max-w-full object-contain ${showOriginal ? 'hidden' : 'block'}`}
            />

            {/* Etiqueta Flutuante indicando o modo */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur border border-white/10 text-[10px] font-mono text-neutral-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                {showOriginal 
                  ? 'Foto Original' 
                  : `${settings.shape.toUpperCase()} • ${settings.colorMode.toUpperCase()} • ${settings.dotSize}PX`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Barra Inferior com Atalho de Download Direto */}
      <div className="h-10 px-4 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-xs text-neutral-400">
        <span className="text-[11px]">
          Qualidade Máxima: Exportação em resolução original sem perdas (formato PNG)
        </span>
        <button
          type="button"
          onClick={handleDownloadReadyImage}
          disabled={isLoading || isExporting}
          className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PNG</span>
        </button>
      </div>
    </div>
  );
};
