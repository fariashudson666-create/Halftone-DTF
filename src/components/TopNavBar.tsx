import React from 'react';
import { ViewTab, ViewMode, GarmentColor, ArtworkSpec } from '../types';
import { 
  FileText, 
  Layers, 
  Settings, 
  Palette, 
  Sliders, 
  Printer, 
  Link2, 
  UploadCloud 
} from 'lucide-react';

interface TopNavBarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  garmentColor: GarmentColor;
  onSelectGarmentColor: (color: GarmentColor) => void;
  currentArtwork: ArtworkSpec;
  onOpenImageModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab,
  onSelectTab,
  viewMode,
  onSelectViewMode,
  garmentColor,
  onSelectGarmentColor,
  currentArtwork,
  onOpenImageModal,
  onOpenExportModal,
  onOpenSettingsModal
}) => {
  return (
    <header className="flex justify-between items-center w-full px-4 h-12 border-b border-[#3b494b] bg-[#1b1b1f] z-40 shrink-0 select-none">
      {/* Left: Brand + Navigation + File Spec */}
      <div className="flex items-center space-x-4">
        {/* Brand Icon & Version */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#343538] border border-[#00f0ff]/40 flex items-center justify-center relative shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] neon-cyan-glow"></span>
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7df4ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00f0ff]"></span>
            </span>
          </div>
          <span className="text-[15px] font-headline font-bold text-[#dbfcff] tracking-tight whitespace-nowrap">
            Halftone Studio DTF / RIP Pro
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#292a2d] border border-[#3b494b] text-[9px] font-mono-tech text-[#ffba38] font-bold tracking-wider">
            v2.6 PRO RIP
          </span>
        </div>

        <div className="h-4 w-px bg-[#3b494b]"></div>

        {/* View Tabs */}
        <nav className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => onSelectTab('workspace')}
            className={`px-2.5 py-1 text-[11px] font-mono-tech font-semibold rounded transition-colors ${
              currentTab === 'workspace'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#00f0ff]/10'
                : 'text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6]'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => onSelectTab('channels')}
            className={`px-2.5 py-1 text-[11px] font-mono-tech font-semibold rounded transition-colors ${
              currentTab === 'channels'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#00f0ff]/10'
                : 'text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6]'
            }`}
          >
            Channels
          </button>
          <button
            onClick={() => onSelectTab('presets')}
            className={`px-2.5 py-1 text-[11px] font-mono-tech font-semibold rounded transition-colors ${
              currentTab === 'presets'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#00f0ff]/10'
                : 'text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6]'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => onSelectTab('queue')}
            className={`px-2.5 py-1 text-[11px] font-mono-tech font-semibold rounded transition-colors ${
              currentTab === 'queue'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#00f0ff]/10'
                : 'text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6]'
            }`}
          >
            Queue
          </button>
        </nav>

        <div className="h-4 w-px bg-[#3b494b] hidden lg:block"></div>

        {/* File specs indicator + Direct Image Link trigger */}
        <div className="hidden xl:flex items-center space-x-2 text-[#b9cacb] text-[10px] font-mono-tech">
          <button
            onClick={onOpenImageModal}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#292a2d] hover:bg-[#343538] border border-[#3b494b] text-[#00f0ff] transition-colors"
            title="Click to view direct HTML image link, change artwork, or upload"
          >
            <FileText className="w-3 h-3 text-[#849495]" />
            <span className="text-[#e3e2e6] font-semibold truncate max-w-[140px]">
              {currentArtwork.fileName}
            </span>
            <span className="text-[#849495]">·</span>
            <span className="text-[#00dbe9]">{currentArtwork.dpi} DPI</span>
            <span className="text-[#849495]">·</span>
            <span>{currentArtwork.widthMm} x {currentArtwork.heightMm} mm</span>
          </button>
        </div>
      </div>

      {/* Center: Garment simulation selector & View modes */}
      <div className="hidden lg:flex items-center space-x-3">
        {/* Garment switcher */}
        <div className="flex items-center bg-[#0d0e11] border border-[#3b494b] p-0.5 rounded">
          <button
            onClick={() => onSelectGarmentColor('black')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono-tech font-semibold transition-all ${
              garmentColor === 'black'
                ? 'bg-[#343538] text-[#e3e2e6] shadow-sm'
                : 'text-[#b9cacb] hover:bg-[#1f1f23]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-black border border-[#849495]"></span>
            <span>Black Tee</span>
          </button>
          <button
            onClick={() => onSelectGarmentColor('white')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono-tech font-semibold transition-all ${
              garmentColor === 'white'
                ? 'bg-[#343538] text-[#e3e2e6] shadow-sm'
                : 'text-[#b9cacb] hover:bg-[#1f1f23]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-[#849495]"></span>
            <span>Cotton White</span>
          </button>
          <button
            onClick={() => onSelectGarmentColor('charcoal')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono-tech font-semibold transition-all ${
              garmentColor === 'charcoal'
                ? 'bg-[#343538] text-[#e3e2e6] shadow-sm'
                : 'text-[#b9cacb] hover:bg-[#1f1f23]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-stone-700 border border-[#849495]"></span>
            <span>Charcoal</span>
          </button>
          <button
            onClick={() => onSelectGarmentColor('navy')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono-tech font-semibold transition-all ${
              garmentColor === 'navy'
                ? 'bg-[#343538] text-[#e3e2e6] shadow-sm'
                : 'text-[#b9cacb] hover:bg-[#1f1f23]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900 border border-[#849495]"></span>
            <span>Navy</span>
          </button>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center bg-[#0d0e11] border border-[#3b494b] p-0.5 rounded">
          <button
            onClick={() => onSelectViewMode('composite')}
            className={`px-2 py-1 rounded text-[10px] font-mono-tech font-bold transition-all ${
              viewMode === 'composite'
                ? 'bg-[#00f0ff] text-[#00363a] shadow-sm'
                : 'text-[#b9cacb] hover:text-[#e3e2e6] hover:bg-[#1f1f23]'
            }`}
          >
            Composite Halftone
          </button>
          <button
            onClick={() => onSelectViewMode('white-underbase')}
            className={`px-2 py-1 rounded text-[10px] font-mono-tech font-bold transition-all ${
              viewMode === 'white-underbase'
                ? 'bg-[#00f0ff] text-[#00363a] shadow-sm'
                : 'text-[#b9cacb] hover:text-[#e3e2e6] hover:bg-[#1f1f23]'
            }`}
          >
            White Underbase
          </button>
          <button
            onClick={() => onSelectViewMode('split-cmyk')}
            className={`px-2 py-1 rounded text-[10px] font-mono-tech font-bold transition-all ${
              viewMode === 'split-cmyk'
                ? 'bg-[#00f0ff] text-[#00363a] shadow-sm'
                : 'text-[#b9cacb] hover:text-[#e3e2e6] hover:bg-[#1f1f23]'
            }`}
          >
            Split CMYK
          </button>
          <button
            onClick={() => onSelectViewMode('original')}
            className={`px-2 py-1 rounded text-[10px] font-mono-tech font-bold transition-all ${
              viewMode === 'original'
                ? 'bg-[#00f0ff] text-[#00363a] shadow-sm'
                : 'text-[#b9cacb] hover:text-[#e3e2e6] hover:bg-[#1f1f23]'
            }`}
          >
            Original Art
          </button>
        </div>
      </div>

      {/* Right: Direct Image Links, Ink Pill & Export Primary */}
      <div className="flex items-center space-x-3">
        {/* Direct Image Link Button (direct response to user request!) */}
        <button
          onClick={onOpenImageModal}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1f1f23] hover:bg-[#292a2d] border border-[#00dbe9]/50 text-[#dbfcff] text-[10px] font-mono-tech font-bold transition-all"
          title="Direct image links for HTML & artwork loader"
        >
          <Link2 className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>Image Links (HTML)</span>
        </button>

        {/* Ink Estimator Pill */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#292a2d] border border-[#3b494b] text-[11px] font-mono-tech">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="text-[#b9cacb] text-[9px]">W:</span>
            <span className="text-[#e3e2e6] font-semibold">4.2ml</span>
          </div>
          <span className="text-[#849495] text-[9px]">|</span>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]"></span>
            <span className="text-[#b9cacb] text-[9px]">CMYK:</span>
            <span className="text-[#e3e2e6] font-semibold">2.1ml</span>
          </div>
          <span className="text-[#849495] text-[9px]">|</span>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd799]"></span>
            <span className="text-[#ffd799] text-[9px] font-semibold">3.8g TPU</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-1 border-l border-[#3b494b] pl-2">
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded text-[#b9cacb] hover:bg-[#343538] hover:text-[#e3e2e6] transition-colors"
            title="Studio Calibration & RIP Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] font-mono-tech text-[11px] font-bold tracking-tight shadow-sm transition-all duration-150 neon-cyan-glow"
        >
          <Printer className="w-4 h-4" />
          <span>RIP &amp; Export</span>
        </button>
      </div>
    </header>
  );
};
