import React from 'react';
import { ProductionPreset, RipSettings } from '../types';
import { PRODUCTION_PRESETS } from '../data/presets';
import { BookmarkCheck, Flame, Shirt, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface PresetsViewProps {
  ripSettings: RipSettings;
  onApplyPreset: (preset: ProductionPreset) => void;
  onNavigateToWorkspace: () => void;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  ripSettings,
  onApplyPreset,
  onNavigateToWorkspace
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#0d0e11] overflow-y-auto select-none p-4 space-y-4">
      {/* Header */}
      <div className="p-3 bg-[#1b1b1f] border border-[#3b494b] rounded flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-headline font-bold text-[#dbfcff] flex items-center space-x-2">
            <Shirt className="w-4 h-4 text-[#00f0ff]" />
            <span>Apparel Substrate &amp; Curing Presets Library</span>
          </h2>
          <p className="text-[9px] font-mono-tech text-[#849495]">
            Optimized Halftone Frequencies, White Underbase Chokes &amp; Heat Press Specifications
          </p>
        </div>
        <button
          onClick={onNavigateToWorkspace}
          className="px-3 py-1.5 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] text-[10px] font-mono-tech font-bold flex items-center space-x-1 transition-all"
        >
          <span>Back to Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRODUCTION_PRESETS.map((preset) => {
          const isActive = ripSettings.currentPresetId === preset.id;

          return (
            <div
              key={preset.id}
              className={`p-4 rounded bg-[#1f1f23] border transition-all flex flex-col justify-between space-y-3 ${
                isActive
                  ? 'border-[#00f0ff] ring-1 ring-[#00f0ff]/50 bg-[#292a2d]'
                  : 'border-[#3b494b] hover:border-[#849495]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-headline font-bold text-[#e3e2e6] block">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-mono-tech text-[#00f0ff]">
                      {preset.subtitle}
                    </span>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded bg-[#00f0ff]/20 text-[#00f0ff] text-[9px] font-mono-tech font-bold border border-[#00f0ff]/50 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Active Preset</span>
                    </span>
                  )}
                </div>

                {/* Substrate detail */}
                <div className="p-2.5 rounded bg-[#0d0e11] border border-[#3b494b] space-y-1.5 text-[10px] font-mono-tech">
                  <div className="flex justify-between text-[#b9cacb]">
                    <span className="text-[#849495]">Recommended Garment:</span>
                    <span className="text-white font-medium">{preset.substrate}</span>
                  </div>
                  <div className="flex justify-between text-[#b9cacb]">
                    <span className="text-[#849495]">Screen Halftone:</span>
                    <span className="text-[#00dbe9]">{preset.lpi} LPI • {preset.dotShape.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-[#b9cacb]">
                    <span className="text-[#849495]">White Underbase Choke:</span>
                    <span className="text-[#ffd799]">{preset.underbaseChoke} px Inset</span>
                  </div>
                  <div className="flex justify-between text-[#b9cacb]">
                    <span className="text-[#849495]">Min Dot TPU Cutoff:</span>
                    <span className="text-white">{preset.minimumCutoff}%</span>
                  </div>
                </div>

                {/* Curing & Heat Press specs */}
                <div className="p-2.5 rounded bg-[#16171a] border border-[#3b494b]/60 flex items-center justify-between text-[9px] font-mono-tech">
                  <div className="flex items-center space-x-1 text-[#ffd799]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Heat Press: {preset.heatPressTemp}</span>
                  </div>
                  <span className="text-[#849495]">{preset.heatPressTime}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#3b494b]">
                <div className="flex items-center space-x-1 text-[9px] font-mono-tech text-[#b9cacb]">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  <span>Wash Fastness: {preset.washRating}</span>
                </div>
                <button
                  onClick={() => {
                    onApplyPreset(preset);
                    onNavigateToWorkspace();
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-mono-tech font-bold transition-colors ${
                    isActive
                      ? 'bg-[#292a2d] text-[#b9cacb] border border-[#3b494b]'
                      : 'bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a]'
                  }`}
                >
                  {isActive ? 'Loaded in RIP' : 'Load Preset'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
