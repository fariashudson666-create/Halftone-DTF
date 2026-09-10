import React, { useRef, useEffect, useState } from 'react';
import { HalftoneSettings } from '../types';
import { renderHalftoneCanvas, exportHalftoneImage } from '../utils/halftoneEngine';
import { 
  Download, 
  Eye, 
  EyeOff, 
  Zap, 
  CheckCircle2,
  Pipette,
  Scissors,
  Upload,
  ImageIcon
} from 'lucide-react';

interface HalftoneCanvasProps {
  imageUrl: string;
  imageTitle: string;
  settings: HalftoneSettings;
  onUpdateSettings?: (newSettings: Partial<HalftoneSettings>) => void;
  onUploadImage?: (file: File) => void;
}

export const HalftoneCanvas: React.FC<HalftoneCanvasProps> = ({
  imageUrl,
  imageTitle,
  settings,
  onUpdateSettings,
  onUploadImage
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputCanvasRef = useRef<HTMLInputElement | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);

  // Carrega a imagem
  useEffect(() => {
    if (!imageUrl) {
      setImageElement(null);
      setImgDimensions({ width: 0, height: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      setImageElement(img);
      const w = img.naturalWidth || img.width || 800;
      const h = img.naturalHeight || img.height || 800;
      setImgDimensions({ width: w, height: h });
      setIsLoading(false);
    };

    img.onerror = () => {
      // Fallback sem crossOrigin
      const fallback = new Image();
      fallback.src = imageUrl;
      fallback.onload = () => {
        setImageElement(fallback);
        const w = fallback.naturalWidth || fallback.width || 800;
        const h = fallback.naturalHeight || fallback.height || 800;
        setImgDimensions({ width: w, height: h });
        setIsLoading(false);
      };
      fallback.onerror = () => {
        setIsLoading(false);
      };
    };
  }, [imageUrl]);

  // Amostrar cor do canto para remoção de fundo instantânea
  const handleSampleCornerColor = () => {
    if (!imageElement || !onUpdateSettings) return;
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 16;
      tempCanvas.height = 16;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.drawImage(imageElement, 0, 0, 16, 16);
        const pixel = tCtx.getImageData(2, 2, 1, 1).data;
        const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
        onUpdateSettings({
          removeBgColor: true,
          bgTargetColor: hex,
          transparentBg: true
        });
      }
    } catch (e) {
      console.warn('Não foi possível amostrar canto da imagem', e);
    }
  };

  // Renderiza no canvas quando configurações ou imagem mudam
  useEffect(() => {
    if (!canvasRef.current || !imageElement || isLoading) return;

    const canvas = canvasRef.current;
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

  const downloadBlobAsFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // Função para baixar a imagem pronta com 100% de fidelidade ao preview da tela
  const handleDownloadReadyImage = async (forceExactPreview: boolean = false) => {
    if (!imageElement || isExporting) return;

    setIsExporting(true);
    try {
      const safeTitle = (imageTitle || 'arte').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');

      // Se for 1x ou solicitado exatamente a cópia do que está na tela:
      if ((settings.upscaleFactor === 1 || forceExactPreview) && canvasRef.current) {
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            downloadBlobAsFile(blob, `${safeTitle}_halftone_fiel.png`);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
            setIsExporting(false);
          } else if (canvasRef.current) {
            const fallbackUrl = canvasRef.current.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${safeTitle}_halftone_fiel.png`;
            link.href = fallbackUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
            setIsExporting(false);
          }
        }, 'image/png');
        return;
      }

      // Se for fator ampliado (> 1x), escala proporcionalmente mantendo a mesma densidade e proporção do preview
      const prevW = canvasRef.current ? canvasRef.current.width : undefined;
      const prevH = canvasRef.current ? canvasRef.current.height : undefined;
      const blobUrl = await exportHalftoneImage(imageElement, settings, prevW, prevH);
      
      const link = document.createElement('a');
      const upscaleSuffix = settings.upscaleFactor > 1 ? `_${settings.upscaleFactor}x` : '';
      link.download = `${safeTitle}_halftone${upscaleSuffix}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      if (canvasRef.current) {
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            downloadBlobAsFile(blob, 'halftone_resultado.png');
          }
        }, 'image/png');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const previewWidth = canvasRef.current?.width || imgDimensions.width;
  const previewHeight = canvasRef.current?.height || imgDimensions.height;
  const outputWidth = Math.round(previewWidth * (settings.upscaleFactor || 1));
  const outputHeight = Math.round(previewHeight * (settings.upscaleFactor || 1));

  // Drag & drop no canvas caso esteja vazio ou queira soltar nova imagem
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCanvas(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onUploadImage) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col bg-neutral-950 overflow-hidden relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingCanvas(true);
      }}
      onDragLeave={() => setIsDraggingCanvas(false)}
      onDrop={handleCanvasDrop}
    >
      <input
        ref={fileInputCanvasRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0] && onUploadImage) {
            onUploadImage(e.target.files[0]);
          }
        }}
      />

      {/* Barra de Ações Superior do Canvas */}
      <div className="h-13 px-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-200 truncate max-w-[160px] sm:max-w-xs">
            {imageTitle || 'Nenhuma imagem selecionada'}
          </span>
          {imgDimensions.width > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400">
                {imgDimensions.width} × {imgDimensions.height} px
              </span>
              {settings.upscaleFactor > 1 && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                  Exporta em {outputWidth} × {outputHeight} px ({settings.upscaleFactor}x)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Amostrar Fundo do Canto com 1 clique */}
          {imageUrl && onUpdateSettings && (
            <button
              type="button"
              onClick={handleSampleCornerColor}
              title="Detectar cor do canto da imagem e remover fundo"
              className="hidden md:flex px-2 py-1 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 items-center gap-1 transition-colors"
            >
              <Pipette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pegar Cor do Canto</span>
            </button>
          )}

          {/* Botão de Alternar com a Imagem Original */}
          {imageUrl && (
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
          )}

          {/* Opção rápida de baixar cópia exata do que está na tela (se upscale ativo) */}
          {imageUrl && settings.upscaleFactor > 1 && (
            <button
              type="button"
              onClick={() => handleDownloadReadyImage(true)}
              disabled={isLoading || isExporting}
              title="Baixar exatamente como está visível na tela em 100% de fidelidade"
              className="hidden lg:flex px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Baixar Cópia da Tela (1:1)</span>
            </button>
          )}

          {/* Botão de Download Principal */}
          {imageUrl && (
            <button
              type="button"
              onClick={() => handleDownloadReadyImage(false)}
              disabled={isLoading || isExporting}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 flex items-center gap-1.5 shadow-sm transition-all hover:shadow-cyan-500/20 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>Baixado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting 
                      ? `Processando ${settings.upscaleFactor}x...` 
                      : settings.upscaleFactor === 1
                      ? 'Baixar Imagem Pronta (100% Fiel)'
                      : `Baixar Alta Resolução (${settings.upscaleFactor}x)`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Palco Central do Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative select-none">
        {/* Padrão quadriculado de transparência */}
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

        {/* Feedback visual de Drag & Drop no canvas */}
        {isDraggingCanvas && (
          <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-cyan-400 bg-cyan-950/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <Upload className="w-10 h-10 text-cyan-400 animate-bounce" />
            <span className="text-sm font-bold text-white">Solte a imagem para carregar</span>
          </div>
        )}

        {!imageUrl ? (
          /* Estado inicial sem imagem */
          <div 
            onClick={() => fileInputCanvasRef.current?.click()}
            className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900/90 text-center flex flex-col items-center gap-4 cursor-pointer hover:border-neutral-700 transition-all shadow-xl group"
          >
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-500/50 transition-all">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Envie sua imagem para começar</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Arraste uma foto aqui ou escolha um arquivo do seu computador pelo painel lateral.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Escolher Imagem</span>
            </button>
            <span className="text-[10px] text-neutral-500">Suporta PNG, JPG, WebP em qualquer resolução</span>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Processando imagem e gerando halftone...</span>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-neutral-800/80 bg-neutral-950">
            {/* Imagem Original (quando ativado) */}
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

            {/* Badges Flutuantes Informativos */}
            <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur border border-white/10 text-[10px] font-mono text-neutral-200 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  {showOriginal 
                    ? 'Foto Original' 
                    : `${settings.colorMode === 'original' ? 'CORES ORIGINAIS' : settings.colorMode.toUpperCase()} • ${settings.shape.toUpperCase()} • ${settings.dotSize}PX`}
                </span>
              </div>

              {/* Badge de Proximidade dos Pontos */}
              {!showOriginal && (
                <div className="px-2 py-1 rounded-md bg-cyan-950/80 backdrop-blur border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                  Pontos: {(settings.dotSpacing ?? 0.9) <= 0.65 ? 'Super Próximos' : (settings.dotSpacing ?? 0.9) <= 0.85 ? 'Próximos' : 'Normal'}
                </div>
              )}

              {settings.removeBgColor && !showOriginal && (
                <div className="px-2 py-1 rounded-md bg-rose-950/80 backdrop-blur border border-rose-500/40 text-[10px] font-mono text-rose-300 flex items-center gap-1">
                  <Scissors className="w-2.5 h-2.5" />
                  <span>Fundo Removido ({settings.bgTargetColor.toUpperCase()})</span>
                </div>
              )}

              {settings.upscaleFactor > 1 && !showOriginal && (
                <div className="px-2 py-1 rounded-md bg-cyan-950/80 backdrop-blur border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  <span>Super Resolução {settings.upscaleFactor}x</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Barra Inferior com Atalhos Rápidos */}
      {imageUrl && (
        <div className="h-10 px-4 border-t border-neutral-800 bg-neutral-900/70 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px] truncate">
            <span>Saída: <strong>PNG sem perdas</strong></span>
            <span>•</span>
            <span>Upscaling: <strong className="text-cyan-400">{settings.upscaleFactor}x</strong> ({outputWidth} × {outputHeight} px)</span>
            {settings.removeBgColor && (
              <>
                <span>•</span>
                <span className="text-neutral-300">Fundo transparente ativo</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleDownloadReadyImage(false)}
            disabled={isLoading || isExporting}
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {settings.upscaleFactor === 1
                ? 'Baixar PNG (100% Fiel à Tela)'
                : `Baixar PNG Alta Resolução (${settings.upscaleFactor}x)`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
