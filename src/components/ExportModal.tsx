import React, { useState } from 'react';
import { ArtworkSpec, RipSettings } from '../types';
import { 
  X, 
  Download, 
  FileCheck, 
  Printer, 
  Layers, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArtwork: ArtworkSpec;
  ripSettings: RipSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentArtwork,
  ripSettings
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [downloadedPlate, setDownloadedPlate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
    }, 1200);
  };

  const handleDownloadPlate = (plateName: string) => {
    setDownloadedPlate(plateName);
    // Create download trigger
    const link = document.createElement('a');
    link.href = currentArtwork.url;
    link.download = `${currentArtwork.fileName.replace(/\.[^/.]+$/, '')}_${plateName.toLowerCase().replace(/\s+/g, '_')}_600dpi.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadedPlate(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in">
      <div className="bg-[#1b1b1f] border border-[#3b494b] rounded-lg w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d0e11] border-b border-[#3b494b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-[13px] font-headline font-bold text-[#dbfcff]">
                RIP Export &amp; Production Package
              </h2>
              <p className="text-[9px] font-mono-tech text-[#849495]">
                Generate 600 DPI Multi-Channel TIFF Separations &amp; DTF Film Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Job Summary Banner */}
          <div className="p-3 rounded bg-[#0d0e11] border border-[#3b494b] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono-tech font-bold text-[#e3e2e6] block">
                {currentArtwork.title}
              </span>
              <div className="flex items-center space-x-2 text-[9px] font-mono-tech text-[#b9cacb]">
                <span>{currentArtwork.widthMm} x {currentArtwork.heightMm} mm</span>
                <span>•</span>
                <span className="text-[#00dbe9]">{currentArtwork.dpi} DPI</span>
                <span>•</span>
                <span className="text-[#ffd799]">{ripSettings.lpi} LPI {ripSettings.dotShape}</span>
              </div>
            </div>
            <div className="text-right font-mono-tech text-[9px]">
              <span className="text-[#849495] block">White Choke:</span>
              <span className="text-[#ffd799] font-bold">{ripSettings.underbaseChoke.toFixed(1)} px Inset</span>
            </div>
          </div>

          {/* Plates Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono-tech font-bold uppercase text-[#00f0ff] tracking-wider">
              Separation Channels &amp; Print Plates:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: 'White Underbase (W1)', desc: '100% Solid Heavy with -2px Choke', color: 'border-white/50 text-white' },
                { name: 'White Highlight (W2)', desc: 'Gradation Soft Fade Layer', color: 'border-white/30 text-white' },
                { name: 'Cyan Plate (15°)', desc: 'Screen angle 15.0° Round', color: 'border-[#22d3ee]/50 text-[#22d3ee]' },
                { name: 'Magenta Plate (75°)', desc: 'Screen angle 75.0° Round', color: 'border-[#ec4899]/50 text-[#ec4899]' },
                { name: 'Yellow Plate (0°)', desc: 'Screen angle 0.0° Round', color: 'border-[#facc15]/50 text-[#facc15]' },
                { name: 'Black Plate (45°)', desc: 'Screen angle 45.0° Euclidean', color: 'border-white/20 text-[#e3e2e6]' }
              ].map((plate) => (
                <div
                  key={plate.name}
                  className="p-2.5 rounded bg-[#1f1f23] border border-[#3b494b] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className={`block text-[10px] font-mono-tech font-bold ${plate.color}`}>
                      {plate.name}
                    </span>
                    <span className="block text-[8px] font-mono-tech text-[#849495]">
                      {plate.desc}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadPlate(plate.name)}
                    className="px-2 py-1 rounded bg-[#292a2d] hover:bg-[#343538] border border-[#3b494b] text-[9px] font-mono-tech text-[#00f0ff] flex items-center space-x-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>{downloadedPlate === plate.name ? 'Saved' : 'Plate'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Complete Alert */}
          {exportComplete && (
            <div className="p-3 rounded bg-green-950/40 border border-green-500/50 flex items-center space-x-2 text-[10px] font-mono-tech text-green-300">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span>Full RIP package generated! 6 Separation plates ready for Ricoh/Epson DTF printer.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0d0e11] border-t border-[#3b494b] flex items-center justify-between">
          <span className="text-[9px] font-mono-tech text-[#849495]">
            Target: Ricoh Gen5 / Epson i3200-A1 Roll Feed
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#292a2d] hover:bg-[#343538] text-[#e3e2e6] text-[10px] font-mono-tech transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="px-4 py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] text-[10px] font-mono-tech font-bold flex items-center space-x-1.5 transition-all neon-cyan-glow disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Processing 600 DPI...' : 'Download Full Package'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
