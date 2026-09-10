import React, { useRef, useEffect, useState } from 'react';
import { ArtworkSpec, RipSettings, ViewMode, GarmentColor, ChannelLayer } from '../types';
import { renderHalftone, getGarmentHex } from '../utils/halftoneEngine';
import { 
  Crosshair, 
  Hand, 
  SplitSquareVertical, 
  Grid, 
  ZoomIn, 
  ExternalLink,
  Layers,
  Sparkles,
  Link
} from 'lucide-react';

interface CenterCanvasStageProps {
  currentArtwork: ArtworkSpec;
  ripSettings: RipSettings;
  viewMode: ViewMode;
  garmentColor: GarmentColor;
  channels: ChannelLayer[];
  showRulers: boolean;
  isPipetteActive: boolean;
  onPipetteSample: (density: number) => void;
  onOpenImageModal: () => void;
}

export const CenterCanvasStage: React.FC<CenterCanvasStageProps> = ({
  currentArtwork,
  ripSettings,
  viewMode,
  garmentColor,
  channels,
  showRulers,
  isPipetteActive,
  onPipetteSample,
  onOpenImageModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(200);
  const [isPanActive, setIsPanActive] = useState<boolean>(false);
  const [splitWipeActive, setSplitWipeActive] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 165.2, y: 220.0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Preload and manage image element
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentArtwork.url;
    img.onload = () => {
      setImageElement(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback for cross-origin or network error
      const fallbackImg = new Image();
      fallbackImg.src = currentArtwork.url;
      fallbackImg.onload = () => {
        setImageElement(fallbackImg);
        setImageLoaded(true);
      };
    };
  }, [currentArtwork.url]);

  // Re-render halftone canvas when parameters change
  useEffect(() => {
    if (!canvasRef.current || !imageElement || !imageLoaded) return;

    const activeChannels = {
      white: channels.find(c => c.id === 'white-underbase')?.visible ?? true,
      cyan: channels.find(c => c.id === 'cyan')?.visible ?? true,
      magenta: channels.find(c => c.id === 'magenta')?.visible ?? true,
      yellow: channels.find(c => c.id === 'yellow')?.visible ?? true,
      black: channels.find(c => c.id === 'black')?.visible ?? true
    };

    renderHalftone({
      canvas: canvasRef.current,
      image: imageElement,
      dotShape: ripSettings.dotShape,
      lpi: ripSettings.lpi,
      underbaseMode: ripSettings.underbaseMode,
      underbaseChoke: ripSettings.underbaseChoke,
      minimumDotCutoff: ripSettings.minimumDotCutoff,
      viewMode,
      garmentColor,
      activeChannels,
      dotGainComp: ripSettings.dotGainComp
    });
  }, [
    imageElement,
    imageLoaded,
    ripSettings.dotShape,
    ripSettings.lpi,
    ripSettings.underbaseMode,
    ripSettings.underbaseChoke,
    ripSettings.minimumDotCutoff,
    ripSettings.dotGainComp,
    viewMode,
    garmentColor,
    channels
  ]);

  // Handle cursor tracking for prepress coordinates & density pipette
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * currentArtwork.widthMm;
    const relY = ((e.clientY - rect.top) / rect.height) * currentArtwork.heightMm;
    setCoords({
      x: Number(Math.max(0, Math.min(currentArtwork.widthMm, relX)).toFixed(1)),
      y: Number(Math.max(0, Math.min(currentArtwork.heightMm, relY)).toFixed(1))
    });

    if (isPipetteActive && canvasRef.current) {
      // Calculate realistic density simulation based on distance to center & noise
      const cx = currentArtwork.widthMm / 2;
      const cy = currentArtwork.heightMm / 2;
      const dist = Math.hypot(relX - cx, relY - cy);
      const density = Math.max(12, Math.min(99.4, 95 - dist * 0.4 + Math.sin(relX * 5) * 4));
      onPipetteSample(density);
    }
  };

  const getZoomScale = () => {
    switch (zoomLevel) {
      case 100: return 0.8;
      case 200: return 1.0;
      case 400: return 1.35;
      case 800: return 1.8;
      default: return 1.0;
    }
  };

  return (
    <main 
      ref={containerRef}
      className="flex-1 bg-[#0d0e11] relative overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Top Rulers / Margin Indicator Bar */}
      {showRulers && (
        <div className="h-6 w-full bg-[#1b1b1f] border-b border-[#3b494b] flex items-center justify-between px-4 text-[9px] font-mono-tech text-[#849495] z-20">
          <div className="flex items-center space-x-3">
            <span>FILM BED: 330 x 480 mm</span>
            <span>•</span>
            <span className="text-[#b9cacb]">SAFE PRINT BOUNDS: 320 x 440 mm</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[#00dbe9]">X: {coords.x} mm</span>
            <span className="text-[#00dbe9]">Y: {coords.y} mm</span>
            <span className="text-[#ffd799]">GRID SNAP: 1.0 mm</span>
          </div>
        </div>
      )}

      {/* Main Canvas Drafting Stage */}
      <div 
        onMouseMove={handleMouseMove}
        className={`flex-1 relative flex items-center justify-center p-4 overflow-hidden ${
          showGrid ? 'bg-drafting-grid' : 'bg-[#0d0e11]'
        } ${isPipetteActive ? 'cursor-crosshair' : isPanActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      >
        {/* Interactive Simulated Garment & DTF PET Film Carrier Bed */}
        <div 
          className="relative w-[520px] h-[680px] rounded shadow-2xl border border-[#3b494b]/60 flex items-center justify-center overflow-hidden transition-transform duration-200"
          style={{
            backgroundColor: getGarmentHex(garmentColor),
            transform: `scale(${getZoomScale()})`
          }}
        >
          {/* Realistic Combed Ring-Spun Cotton Fabric Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#2c2d30 0.8px, transparent 0.8px), radial-gradient(#1e1f22 0.8px, #141416 0.8px)', 
              backgroundSize: '8px 8px', 
              backgroundPosition: '0 0, 4px 4px' 
            }}
          />

          {/* PET Film Bed Perimeter Border with DTF Registration Marks */}
          <div className="absolute inset-3 border border-dashed border-[#3b494b]/80 pointer-events-none flex flex-col justify-between p-2 z-10">
            {/* Top Registration Header */}
            <div className="flex justify-between items-center text-[9px] font-mono-tech text-[#849495]">
              <div className="flex items-center space-x-1">
                <Crosshair className="w-4 h-4 text-[#00f0ff] animate-pulse" />
                <span className="text-[9px] uppercase tracking-wider text-[#849495]">
                  DTF_REG_MARK_TL_600DPI
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {/* Color Calibration Step Wedge */}
                <span className="w-3 h-2 bg-[#22d3ee] inline-block"></span>
                <span className="w-3 h-2 bg-[#ec4899] inline-block"></span>
                <span className="w-3 h-2 bg-[#facc15] inline-block"></span>
                <span className="w-3 h-2 bg-black inline-block border border-[#849495]"></span>
                <span className="w-3 h-2 bg-white inline-block"></span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[9px] uppercase tracking-wider text-[#849495]">
                  ROTATION_LOCK: 0.0°
                </span>
                <Crosshair className="w-4 h-4 text-[#00f0ff]" />
              </div>
            </div>

            {/* Middle Artwork Preview with Live Halftone & Split Wipe */}
            <div className="relative flex-1 flex items-center justify-center my-2 pointer-events-auto group">
              <div className="relative max-w-[380px] max-h-[460px] w-[380px] h-[460px] rounded overflow-hidden border border-[#3b494b] bg-[#343538] shadow-2xl flex items-center justify-center">
                {/* Direct Image Background / Base Preview */}
                <img
                  src={currentArtwork.url}
                  alt={currentArtwork.altText}
                  className="w-full h-full object-cover select-none absolute inset-0"
                  crossOrigin="anonymous"
                />

                {/* Real-time Halftone / Underbase Canvas Simulation */}
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={460}
                  className="w-full h-full object-cover absolute inset-0 mix-blend-normal pointer-events-none"
                  style={{
                    clipPath: splitWipeActive ? `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)` : undefined
                  }}
                />

                {/* Simulated Halftone Dot Raster Screen Inset Simulation Texture */}
                <div 
                  className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-25" 
                  style={{ 
                    backgroundImage: 'radial-gradient(#00f0ff 1.2px, transparent 1.2px)', 
                    backgroundSize: '6px 6px' 
                  }}
                />

                {/* Split Wipe Divider Line (when active) */}
                {splitWipeActive && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#00f0ff] neon-cyan-glow z-20 cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${splitPosition}%` }}
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const initialPos = splitPosition;
                      const handleDrag = (moveEvent: MouseEvent) => {
                        const delta = moveEvent.clientX - startX;
                        const newPos = Math.max(5, Math.min(95, initialPos + (delta / 380) * 100));
                        setSplitPosition(newPos);
                      };
                      const handleUp = () => {
                        window.removeEventListener('mousemove', handleDrag);
                        window.removeEventListener('mouseup', handleUp);
                      };
                      window.addEventListener('mousemove', handleDrag);
                      window.addEventListener('mouseup', handleUp);
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#00f0ff] text-[#00363a] flex items-center justify-center shadow-lg -translate-x-1/2">
                      <SplitSquareVertical className="w-3 h-3" />
                    </div>
                  </div>
                )}

                {/* White Underbase Peek-through Indicator Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#0d0e11]/90 border border-[#3b494b] backdrop-blur flex items-center space-x-1.5 z-20">
                  <span className="w-2 h-2 rounded-full bg-white shadow-sm"></span>
                  <span className="text-[9px] font-mono-tech font-bold text-[#00f0ff]">
                    W-MASK {ripSettings.underbaseChoke.toFixed(0)}px LOCK
                  </span>
                </div>

                {/* Halftone Spec Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-[#0d0e11]/90 border border-[#3b494b] backdrop-blur text-[10px] font-mono-tech text-[#ffd799] z-20">
                  {ripSettings.lpi.toFixed(0)} LPI • 22.5° {ripSettings.dotShape.toUpperCase()}
                </div>

                {/* Direct Link Tag Corner Badge */}
                <button
                  onClick={onOpenImageModal}
                  className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0d0e11]/90 hover:bg-[#1f1f23] border border-[#00f0ff]/40 text-[9px] font-mono-tech text-[#00f0ff] flex items-center space-x-1 backdrop-blur z-20 transition-colors"
                  title="Direct image link"
                >
                  <Link className="w-2.5 h-2.5" />
                  <span>Direct HTML Link</span>
                </button>
              </div>
            </div>

            {/* Bottom Registration Marks Footer */}
            <div className="flex justify-between items-center text-[9px] font-mono-tech text-[#849495]">
              <div className="flex items-center space-x-1">
                <Crosshair className="w-4 h-4 text-[#00f0ff]" />
                <span className="text-[9px]">ROLL_FEED_EDGE</span>
              </div>
              <span className="text-[9px] tracking-widest text-[#b9cacb] font-bold">
                ★ CALIBRATED FOR 70-80 MESH TPU ADHESIVE ★
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-[9px]">A3_PLUS_ALIGNED</span>
                <Crosshair className="w-4 h-4 text-[#00f0ff]" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Canvas Overlay Controls (Canvas Inspection HUD) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#292a2d]/95 border border-[#3b494b] rounded-full px-4 py-1.5 shadow-2xl backdrop-blur-md flex items-center space-x-3 z-30 select-none">
          {/* Zoom Pills */}
          <div className="flex items-center bg-[#0d0e11] rounded-full p-0.5 border border-[#3b494b]">
            {[100, 200, 400, 800].map((level) => (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono-tech font-bold transition-all ${
                  zoomLevel === level
                    ? 'bg-[#00f0ff] text-[#00363a] shadow-sm'
                    : 'text-[#b9cacb] hover:text-[#e3e2e6]'
                }`}
              >
                {level}%
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#3b494b]"></div>

          {/* Pan Hand Toggle */}
          <button
            onClick={() => setIsPanActive(!isPanActive)}
            className={`p-1.5 rounded-full transition-colors ${
              isPanActive
                ? 'bg-[#00f0ff] text-[#00363a]'
                : 'hover:bg-[#343538] text-[#b9cacb] hover:text-[#e3e2e6]'
            }`}
            title="Pan Hand (Spacebar)"
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Split Wipe Slider Compare Badge */}
          <button
            onClick={() => setSplitWipeActive(!splitWipeActive)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-mono-tech font-bold transition-colors ${
              splitWipeActive
                ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                : 'bg-[#1f1f23] hover:bg-[#343538] border-[#3b494b] text-[#e3e2e6]'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Split Wipe (Film / Garment)</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-full border transition-colors ${
              showGrid
                ? 'bg-[#1f1f23] text-[#00f0ff] border-[#3b494b]'
                : 'bg-[#1f1f23] text-[#849495] border-transparent'
            }`}
            title="Toggle Grid & Safe Margins"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Footer Status Strip */}
      <div className="h-7 bg-[#1b1b1f] border-t border-[#3b494b] px-4 flex items-center justify-between text-[9px] font-mono-tech text-[#b9cacb] z-20">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-[#e3e2e6] font-semibold">RIP Engine Ready</span>
          </span>
          <span>GPU Acceleration: WebGL 2.0 (Active)</span>
          <span className="hidden sm:inline">Underbase Curve: Gradation Mask Pass 1</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Pixel Dimensions: {currentArtwork.pixelWidth} x {currentArtwork.pixelHeight} px</span>
          <span className="text-[#849495]">|</span>
          <span className="text-[#00f0ff]">Target: Ricoh Gen5 / Epson i3200-A1</span>
        </div>
      </div>
    </main>
  );
};
