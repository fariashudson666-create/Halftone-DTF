import React, { useState } from 'react';
import { RipSettings, DotShape, UnderbaseMode, ProductionPreset } from '../types';
import { PRODUCTION_PRESETS } from '../data/presets';
import { 
  Triangle, 
  Circle, 
  AlignJustify, 
  Lock, 
  Unlock, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Download 
} from 'lucide-react';

interface RightInspectorPanelProps {
  ripSettings: RipSettings;
  onChangeSettings: (newSettings: Partial<RipSettings>) => void;
  onApplyPreset: (preset: ProductionPreset) => void;
  onRenderPreview: () => void;
  onOpenExportModal: () => void;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  ripSettings,
  onChangeSettings,
  onApplyPreset,
  onRenderPreview,
  onOpenExportModal
}) => {
  const [activeTab, setActiveTab] = useState<'halftone' | 'white-mask' | 'curves'>('halftone');

  return (
    <aside className="w-80 bg-[#1b1b1f] border-l border-[#3b494b] flex flex-col justify-between shrink-0 z-30 select-none">
      {/* Multi-tab Header */}
      <div className="flex items-center border-b border-[#3b494b] bg-[#0d0e11] p-1.5 space-x-1">
        <button
          onClick={() => setActiveTab('halftone')}
          className={`flex-1 py-1.5 px-2 rounded font-mono-tech text-[10px] font-bold border text-center transition-all ${
            activeTab === 'halftone'
              ? 'bg-[#292a2d] text-[#00f0ff] border-[#00f0ff]/50 shadow-sm'
              : 'border-transparent text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
          }`}
        >
          Halftone Engine
        </button>
        <button
          onClick={() => setActiveTab('white-mask')}
          className={`flex-1 py-1.5 px-2 rounded font-mono-tech text-[10px] font-bold border text-center transition-all ${
            activeTab === 'white-mask'
              ? 'bg-[#292a2d] text-[#ffd799] border-[#ffd799]/50 shadow-sm'
              : 'border-transparent text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
          }`}
        >
          DTF White Mask
        </button>
        <button
          onClick={() => setActiveTab('curves')}
          className={`flex-1 py-1.5 px-2 rounded font-mono-tech text-[10px] font-bold border text-center transition-all ${
            activeTab === 'curves'
              ? 'bg-[#292a2d] text-[#00f0ff] border-[#00f0ff]/50 shadow-sm'
              : 'border-transparent text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
          }`}
        >
          Curves &amp; RIP
        </button>
      </div>

      {/* Scrollable Inspector Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'halftone' && (
          <div className="space-y-4">
            {/* SECTION 1: SCREENING METHOD & GEOMETRY */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech font-bold uppercase text-[#00f0ff] tracking-wider">
                  1. Screening Method
                </span>
                <span className="text-[9px] font-mono-tech text-[#849495]">
                  LPI / MATRIX
                </span>
              </div>

              {/* Dot Shape Segmented Row */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-[#b9cacb]">
                  Halftone Dot Shape
                </label>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#0d0e11] border border-[#3b494b] rounded">
                  <button
                    onClick={() => onChangeSettings({ dotShape: 'euclidean' })}
                    className={`py-1 px-1 rounded font-mono-tech text-[9px] font-bold flex flex-col items-center justify-center transition-all ${
                      ripSettings.dotShape === 'euclidean'
                        ? 'bg-[#00f0ff] text-[#00363a] shadow'
                        : 'text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
                    }`}
                  >
                    <Triangle className="w-3.5 h-3.5 fill-current" />
                    <span className="mt-0.5">Euclidean</span>
                  </button>

                  <button
                    onClick={() => onChangeSettings({ dotShape: 'round' })}
                    className={`py-1 px-1 rounded font-mono-tech text-[9px] font-bold flex flex-col items-center justify-center transition-all ${
                      ripSettings.dotShape === 'round'
                        ? 'bg-[#00f0ff] text-[#00363a] shadow'
                        : 'text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
                    }`}
                  >
                    <Circle className="w-3.5 h-3.5 fill-current" />
                    <span className="mt-0.5">Round</span>
                  </button>

                  <button
                    onClick={() => onChangeSettings({ dotShape: 'stochastic' })}
                    className={`py-1 px-1 rounded font-mono-tech text-[9px] font-bold flex flex-col items-center justify-center transition-all ${
                      ripSettings.dotShape === 'stochastic'
                        ? 'bg-[#00f0ff] text-[#00363a] shadow'
                        : 'text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-[11px] leading-none font-bold">
                      ::
                    </span>
                    <span className="mt-0.5">Stochastic</span>
                  </button>

                  <button
                    onClick={() => onChangeSettings({ dotShape: 'line' })}
                    className={`py-1 px-1 rounded font-mono-tech text-[9px] font-bold flex flex-col items-center justify-center transition-all ${
                      ripSettings.dotShape === 'line'
                        ? 'bg-[#00f0ff] text-[#00363a] shadow'
                        : 'text-[#b9cacb] hover:bg-[#1f1f23] hover:text-[#e3e2e6]'
                    }`}
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                    <span className="mt-0.5">Line</span>
                  </button>
                </div>
              </div>

              {/* Frequency (LPI) Slider with Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-mono-tech">
                  <span className="text-[#b9cacb]">Screen Frequency</span>
                  <span className="text-[#00f0ff] font-bold">
                    {ripSettings.lpi.toFixed(1)} LPI
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={ripSettings.lpi}
                  onChange={(e) => onChangeSettings({ lpi: Number(e.target.value) })}
                  className="w-full accent-[#00f0ff] h-1.5 bg-[#343538] rounded appearance-none cursor-pointer"
                />

                {/* Quick LPI Pills */}
                <div className="flex items-center justify-between pt-1">
                  {[45, 55, 65, 75].map((presetLpi) => (
                    <button
                      key={presetLpi}
                      onClick={() => onChangeSettings({ lpi: presetLpi })}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono-tech transition-colors ${
                        ripSettings.lpi === presetLpi
                          ? 'bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold'
                          : 'bg-[#1f1f23] border border-[#3b494b] text-[#b9cacb] hover:text-[#e3e2e6]'
                      }`}
                    >
                      {presetLpi} {presetLpi === 55 ? 'LPI (DTF)' : 'LPI'}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[#849495] font-body-text leading-tight pt-0.5">
                  55 LPI recommended to prevent TPU powder bridging in shadow rosettes.
                </p>
              </div>

              {/* Channel Screen Angle Matrix */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono-tech">
                  <span className="text-[#b9cacb]">Screen Angles (Anti-Moiré)</span>
                  <button
                    onClick={() => onChangeSettings({ anglesLocked: !ripSettings.anglesLocked })}
                    className="flex items-center text-[#ffd799] text-[9px] font-mono-tech hover:underline"
                  >
                    {ripSettings.anglesLocked ? (
                      <Lock className="w-3 h-3 mr-0.5 text-[#ffd799]" />
                    ) : (
                      <Unlock className="w-3 h-3 mr-0.5 text-[#00f0ff]" />
                    )}
                    {ripSettings.anglesLocked ? 'Auto-Locked' : 'Manual'}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center font-mono-tech text-[10px]">
                  <div className="p-1.5 rounded bg-[#1f1f23] border border-[#3b494b]">
                    <span className="block text-[#22d3ee] font-bold text-[9px]">CYAN</span>
                    <span className="text-[#e3e2e6]">{ripSettings.angles.cyan.toFixed(1)}°</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#1f1f23] border border-[#3b494b]">
                    <span className="block text-[#ec4899] font-bold text-[9px]">MAG</span>
                    <span className="text-[#e3e2e6]">{ripSettings.angles.magenta.toFixed(1)}°</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#1f1f23] border border-[#3b494b]">
                    <span className="block text-[#facc15] font-bold text-[9px]">YEL</span>
                    <span className="text-[#e3e2e6]">{ripSettings.angles.yellow.toFixed(1)}°</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#1f1f23] border border-[#3b494b]">
                    <span className="block text-white font-bold text-[9px]">BLK</span>
                    <span className="text-[#e3e2e6]">{ripSettings.angles.black.toFixed(1)}°</span>
                  </div>
                </div>
              </div>

              {/* Dot Gain Toggle */}
              <div className="flex items-center justify-between p-2 rounded bg-[#1f1f23] border border-[#3b494b]">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#00f0ff]" />
                  <span className="text-[10px] font-mono-tech text-[#e3e2e6]">
                    Dot Gain Compensation
                  </span>
                </div>
                <span className="font-mono-tech text-[10px] text-[#00dbe9] font-bold">
                  +{ripSettings.dotGainComp.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'white-mask' && (
          <div className="space-y-4">
            {/* SECTION 2: DTF WHITE UNDERBASE GENERATION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech font-bold uppercase text-[#ffd799] tracking-wider">
                  2. DTF White Underbase
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#feb300]/20 text-[#ffd799] text-[9px] font-mono-tech font-bold border border-[#feb300]/40">
                  CRITICAL
                </span>
              </div>

              {/* White Mask Mode */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-[#b9cacb]">
                  Underbase Computation Mode
                </label>
                <select
                  value={ripSettings.underbaseMode}
                  onChange={(e) => onChangeSettings({ underbaseMode: e.target.value as UnderbaseMode })}
                  className="w-full bg-[#1f1f23] border border-[#3b494b] rounded p-1.5 text-[10px] font-mono-tech text-[#e3e2e6] focus:border-[#00f0ff] focus:outline-none"
                >
                  <option value="highlight-gradation">Highlight Gradation White (Soft Fades)</option>
                  <option value="solid-heavy">100% Solid Heavy White (Sportswear)</option>
                  <option value="choke-only">Choke-Only Vector Edge Silhouette</option>
                  <option value="color-subtractive">Color-Range Subtractive White</option>
                </select>
              </div>

              {/* Choke / Spread Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px] font-mono-tech">
                  <span className="text-[#b9cacb]">Underbase Choke (Border Inset)</span>
                  <span className="text-[#ffd799] font-bold">
                    {ripSettings.underbaseChoke.toFixed(1)} px
                  </span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="0"
                  step="0.5"
                  value={ripSettings.underbaseChoke}
                  onChange={(e) => onChangeSettings({ underbaseChoke: Number(e.target.value) })}
                  className="w-full accent-[#feb300] h-1.5 bg-[#343538] rounded appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono-tech text-[#849495]">
                  <span>-6 px (Aggressive)</span>
                  <span className="text-[#ffd799] font-bold">-2 px (Standard DTF)</span>
                  <span>0 px (Flush)</span>
                </div>
              </div>

              {/* Minimum Dot Cutoff Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px] font-mono-tech">
                  <span className="text-[#b9cacb]">Minimum Dot Cutoff (TPU Hold)</span>
                  <span className="text-[#00f0ff] font-bold">
                    {ripSettings.minimumDotCutoff.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={ripSettings.minimumDotCutoff}
                  onChange={(e) => onChangeSettings({ minimumDotCutoff: Number(e.target.value) })}
                  className="w-full accent-[#00f0ff] h-1.5 bg-[#343538] rounded appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-[#849495] font-body-text leading-tight pt-0.5">
                  Cuts off dots below 4% to eliminate adhesive powder fallout during heat press.
                </p>
              </div>

              {/* White Density Multiplier */}
              <div className="flex items-center justify-between p-2 rounded bg-[#1f1f23] border border-[#3b494b]">
                <div>
                  <span className="text-[10px] font-mono-tech text-[#e3e2e6] block">
                    Double Pass Emulation
                  </span>
                  <span className="text-[9px] text-[#849495] font-body-text">
                    Dual print-head high density
                  </span>
                </div>
                <button
                  onClick={() => onChangeSettings({ doublePass: ripSettings.doublePass === 100 ? 150 : ripSettings.doublePass === 150 ? 200 : 100 })}
                  className="font-mono-tech text-[10px] text-[#00f0ff] font-bold px-2 py-0.5 rounded bg-[#0d0e11] border border-[#3b494b]"
                >
                  {ripSettings.doublePass}%
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'curves' && (
          <div className="space-y-3">
            <div className="text-[10px] font-mono-tech font-bold uppercase text-[#00f0ff] tracking-wider">
              Transfer Curves &amp; Ink Limits
            </div>
            <div className="p-2.5 rounded bg-[#1f1f23] border border-[#3b494b] space-y-2">
              <div className="flex justify-between text-[10px] font-mono-tech">
                <span className="text-[#b9cacb]">Max White Ink Load</span>
                <span className="text-[#00f0ff] font-bold">240%</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono-tech">
                <span className="text-[#b9cacb]">CMYK Ink Limit</span>
                <span className="text-[#ffd799] font-bold">180%</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono-tech">
                <span className="text-[#b9cacb]">Oven Curing Temp</span>
                <span className="text-[#e3e2e6] font-bold">130°C / 120s</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono-tech">
                <span className="text-[#b9cacb]">TPU Powder Mesh</span>
                <span className="text-[#e3e2e6] font-bold">80-200μm Extra Soft</span>
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-[#3b494b]"></div>

        {/* SECTION 3: PRODUCTION PRESETS */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono-tech font-bold uppercase text-[#00f0ff] tracking-wider">
            3. Production Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {PRODUCTION_PRESETS.map((preset) => {
              const isSelected = ripSettings.currentPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset(preset)}
                  className={`p-2 rounded text-left transition-all border ${
                    isSelected
                      ? 'bg-[#343538] border-[#00f0ff] shadow-sm'
                      : 'bg-[#1f1f23] border-[#3b494b] hover:border-[#849495]'
                  }`}
                >
                  <span className={`block text-[10px] font-mono-tech font-bold ${isSelected ? 'text-[#00f0ff]' : 'text-[#e3e2e6]'}`}>
                    {preset.title}
                  </span>
                  <span className="text-[8px] text-[#b9cacb] block truncate">
                    {preset.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: PRODUCTION FOOTER SPECS CARD */}
      <div className="p-3 border-t border-[#3b494b] bg-[#0d0e11] space-y-1.5 shrink-0">
        <div className="flex items-center justify-between text-[9px] font-mono-tech">
          <span className="text-[#849495]">EST. PRINT CYCLE:</span>
          <span className="text-[#e3e2e6] font-bold">~ 1m 45s</span>
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono-tech">
          <span className="text-[#849495]">TPU POWDER GRIP:</span>
          <span className="text-green-400 font-bold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1"></span> OPTIMAL
          </span>
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono-tech">
          <span className="text-[#849495]">WASH FASTNESS RATING:</span>
          <span className="text-[#ffd799] font-bold">4.8 / 5.0 (ISO 105)</span>
        </div>

        {/* Render & Export Action Row */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={onRenderPreview}
            className="py-1.5 rounded bg-[#292a2d] border border-[#3b494b] hover:bg-[#343538] text-[#e3e2e6] font-mono-tech text-[10px] font-medium text-center transition-colors flex items-center justify-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Render Preview</span>
          </button>
          <button
            onClick={onOpenExportModal}
            className="py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] font-mono-tech text-[10px] font-bold text-center transition-all neon-cyan-glow flex items-center justify-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TIFF</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
