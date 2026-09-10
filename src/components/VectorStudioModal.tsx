import React, { useState, useEffect } from 'react';
import { HalftoneSettings } from '../types';
import { generateHalftoneSvg, SvgVectorResult } from '../utils/halftoneEngine';
import {
  X,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Loader2,
  ShieldCheck,
  Printer
} from 'lucide-react';

interface VectorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  imageElement?: HTMLImageElement | null;
  imageTitle: string;
  settings: HalftoneSettings;
  previewWidth?: number;
  previewHeight?: number;
}

export const VectorStudioModal: React.FC<VectorStudioModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageElement: passedImageElement,
  imageTitle,
  settings,
  previewWidth,
  previewHeight
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [vectorResult, setVectorResult] = useState<SvgVectorResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [vectorColorMode, setVectorColorMode] = useState<'current' | 'black' | 'white'>('current');
  const [cleanNoiseDtf, setCleanNoiseDtf] = useState<'none' | 'medium' | 'high'>('medium');
  const [vectorTransparent, setVectorTransparent] = useState<boolean>(true);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(passedImageElement || null);

  // Carrega imagem por URL se não fornecida diretamente
  useEffect(() => {
    if (passedImageElement) {
      setLoadedImg(passedImageElement);
      return;
    }
    if (!imageUrl) {
      setLoadedImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => setLoadedImg(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.src = imageUrl;
      fallback.onload = () => setLoadedImg(fallback);
    };
  }, [imageUrl, passedImageElement]);

  // Gera o vetor SVG sempre que o modal abre ou as opções locais mudam
  useEffect(() => {
    if (!isOpen || !loadedImg) return;

    let isMounted = true;
    setIsGenerating(true);

    const minDotMap = {
      none: 0.01,
      medium: 0.035, // Limpeza ideal para DTF têxtil
      high: 0.07 // Limpeza agressiva para silk screen e DTF
    };

    const overrideColor =
      vectorColorMode === 'black'
        ? '#000000'
        : vectorColorMode === 'white'
        ? '#ffffff'
        : undefined;

    generateHalftoneSvg(loadedImg, settings, {
      width: previewWidth || 1000,
      height: previewHeight,
      minDotSize: minDotMap[cleanNoiseDtf],
      singleColorOverride: overrideColor,
      transparentBg: vectorTransparent
    })
      .then((res) => {
        if (isMounted) {
          setVectorResult(res);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Erro ao gerar vetor SVG:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, loadedImg, settings, previewWidth, previewHeight, vectorColorMode, cleanNoiseDtf, vectorTransparent]);

  if (!isOpen) return null;

  const handleDownloadSvg = () => {
    if (!vectorResult) return;
    const safeTitle = (imageTitle || 'arte_halftone').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
    const link = document.createElement('a');
    link.download = `${safeTitle}_vetor_dtf.svg`;
    link.href = vectorResult.blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopySvg = async () => {
    if (!vectorResult) return;
    try {
      await navigator.clipboard.writeText(vectorResult.svgString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar SVG', err);
    }
  };

  const handleOpenNewTab = () => {
    if (!vectorResult) return;
    const tab = window.open();
    if (tab) {
      tab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vetor SVG - ${imageTitle || 'Halftone'}</title>
            <style>
              body { margin: 0; background: #121214; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              svg { max-width: 95vw; max-height: 95vh; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
            </style>
          </head>
          <body>
            ${vectorResult.svgString}
          </body>
        </html>
      `);
      tab.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho do Estúdio Vetorial */}
        <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white leading-none">Estúdio de Vetorização (SVG)</h2>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-semibold">
                  Pronto para DTF & Gráfica
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Converte todos os pontos do halftone em vetor matemático puro (escalável sem perda de resolução)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Principal: Visualizador + Painel de Ajustes do Vetor */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Lado Esquerdo: Área de Visualização do Vetor SVG */}
          <div className="flex-1 bg-neutral-950 relative flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-neutral-800">
            {/* Barra de Ferramentas de Zoom da Visualização */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-neutral-900/90 border border-neutral-700/70 backdrop-blur-md p-1 rounded-xl shadow-lg">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.25))}
                title="Diminuir Zoom"
                className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-cyan-300 font-semibold min-w-[44px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3.5, z + 0.25))}
                title="Aumentar Zoom"
                className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                title="Redefinir Zoom (100%)"
                className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Canvas de Preview do Vetor */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-medium">Calculando coordenadas e gerando malha vetorial...</span>
                </div>
              ) : vectorResult ? (
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="shadow-2xl rounded-lg overflow-hidden border border-neutral-800/60 bg-transparent"
                >
                  <img
                    src={vectorResult.blobUrl}
                    alt="Vetor SVG Preview"
                    className="max-h-[62vh] object-contain block"
                  />
                </div>
              ) : (
                <span className="text-neutral-500 text-xs">Nenhum vetor gerado</span>
              )}
            </div>

            {/* Rodapé de Estatísticas do Vetor */}
            {vectorResult && (
              <div className="px-4 py-2 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-neutral-200 font-mono">{vectorResult.dotCount.toLocaleString()}</strong> pontos vetoriais
                  </span>
                  <span>•</span>
                  <span>
                    Dimensões: <strong className="text-neutral-200 font-mono">{vectorResult.width} × {vectorResult.height} px</strong>
                  </span>
                </div>
                <div>
                  Tamanho: <strong className="text-cyan-400 font-mono">{(vectorResult.sizeBytes / 1024).toFixed(0)} KB</strong>
                </div>
              </div>
            )}
          </div>

          {/* Lado Direito: Opções de Otimização para DTF & Ações de Exportação */}
          <div className="w-full md:w-80 p-5 bg-neutral-900 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
            <div className="space-y-4">
              {/* Card Explicativo DTF */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200/90 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Por que usar Vetor no DTF?</span>
                </div>
                <p className="leading-relaxed text-[10px] text-neutral-300">
                  Arquivos SVG podem ser ampliados ao infinito sem perder nitidez ou pixelizar. Ideais para abrir no Illustrator, CorelDRAW ou enviar direto para softwares RIP de DTF (AcroRIP, Digital Factory).
                </p>
              </div>

              {/* Opção 1: Cor do Vetor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-200 block">Modo de Cor do Vetor</label>
                <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  {[
                    { id: 'current', label: 'Atual' },
                    { id: 'black', label: 'Preto 100%' },
                    { id: 'white', label: 'Branco Puro' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setVectorColorMode(m.id as any)}
                      className={`py-1.5 text-[11px] rounded-lg font-medium transition-all ${
                        vectorColorMode === m.id
                          ? 'bg-neutral-800 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-neutral-500 block">
                  {vectorColorMode === 'black' && 'Gera todos os pontos em preto puro (ideal para matrizes e tela serigráfica).'}
                  {vectorColorMode === 'white' && 'Gera todos os pontos em branco puro (ideal para base branca no DTF).'}
                  {vectorColorMode === 'current' && 'Mantém exatamente as cores originais ou o modo selecionado.'}
                </span>
              </div>

              {/* Opção 2: Filtro de Ruído para DTF (Micro-pontos) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-200">Limpeza de Micro-Pontos (DTF)</label>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  {[
                    { id: 'none', label: 'Sem Filtro' },
                    { id: 'medium', label: 'DTF Padrão' },
                    { id: 'high', label: 'DTF Forte' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCleanNoiseDtf(lvl.id as any)}
                      className={`py-1.5 text-[10px] rounded-lg font-medium transition-all ${
                        cleanNoiseDtf === lvl.id
                          ? 'bg-neutral-800 text-cyan-300 font-semibold border border-cyan-500/40'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 block leading-tight">
                  Remove pontinhos microscópicos imperceptíveis para evitar que o pó de cola DTF espalhe e suje a estampa.
                </span>
              </div>

              {/* Opção 3: Fundo Transparente */}
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-200 block">Fundo Transparente</span>
                  <span className="text-[10px] text-neutral-400 block">Essencial para impressão DTF</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vectorTransparent}
                    onChange={(e) => setVectorTransparent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>

            {/* Bloco de Ações e Download */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              {/* Botão Baixar SVG */}
              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={isGenerating || !vectorResult}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-cyan-500/20 disabled:opacity-50"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Arquivo SVG Baixado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Vetor (.SVG)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                {/* Copiar Código SVG */}
                <button
                  type="button"
                  onClick={handleCopySvg}
                  disabled={isGenerating || !vectorResult}
                  className="py-1.5 px-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar SVG'}</span>
                </button>

                {/* Abrir em Nova Aba */}
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  disabled={isGenerating || !vectorResult}
                  className="py-1.5 px-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Tela Cheia</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
