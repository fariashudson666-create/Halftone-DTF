import React from 'react';
import { ChannelLayer } from '../types';
import { 
  Eye, 
  EyeOff, 
  Layers, 
  PlusCircle, 
  SlidersHorizontal, 
  Pipette, 
  Filter, 
  Grid, 
  ChevronRight, 
  ShieldAlert, 
  Shield 
} from 'lucide-react';

interface LeftChannelsRailProps {
  channels: ChannelLayer[];
  onToggleChannel: (id: string) => void;
  pipetteDensity: number;
  isPipetteActive: boolean;
  onTogglePipette: () => void;
  highlightChoke: number;
  onOpenChokeMatrix: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  onAddSpotChannel: () => void;
}

export const LeftChannelsRail: React.FC<LeftChannelsRailProps> = ({
  channels,
  onToggleChannel,
  pipetteDensity,
  isPipetteActive,
  onTogglePipette,
  highlightChoke,
  onOpenChokeMatrix,
  showRulers,
  onToggleRulers,
  onAddSpotChannel
}) => {
  return (
    <aside className="w-72 bg-[#1b1b1f] border-r border-[#3b494b] flex flex-col justify-between shrink-0 z-30 select-none">
      {/* Top Section: Header + Channel Isolation Stack */}
      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Rail Header */}
        <div className="px-3 py-2 border-b border-[#3b494b] flex items-center justify-between bg-[#0d0e11]">
          <div>
            <div className="text-[9px] font-mono-tech font-bold text-[#dbfcff] uppercase tracking-widest">
              CHANNELS
            </div>
            <div className="text-[9px] font-mono-tech text-[#849495]">
              600 DPI Calibrated
            </div>
          </div>
          <button
            onClick={onAddSpotChannel}
            className="p-1 rounded hover:bg-[#343538] text-[#b9cacb] hover:text-[#e3e2e6] transition-colors"
            title="Add Spot Separation Channel"
          >
            <PlusCircle className="w-4 h-4 text-[#00f0ff]" />
          </button>
        </div>

        {/* Channel Isolation Stack */}
        <div className="p-1.5 space-y-1">
          {channels.map((ch) => {
            const isWhite = ch.id === 'white-underbase';
            const isComposite = ch.id === 'composite';

            if (isComposite) {
              return (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-1.5 rounded bg-[#343538] text-[#dbfcff] border-l-2 border-[#00f0ff]"
                >
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleChannel(ch.id)}
                      className="text-[#00f0ff] hover:opacity-80 transition-opacity"
                    >
                      {ch.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#849495]" />
                      )}
                    </button>
                    <Layers className="w-4 h-4 text-[#00f0ff]" />
                    <span className="text-[11px] font-mono-tech font-semibold">
                      {ch.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono-tech text-[#b9cacb] px-1 rounded bg-[#121316]">
                    All Layers
                  </span>
                </div>
              );
            }

            if (isWhite) {
              return (
                <div
                  key={ch.id}
                  className="flex flex-col p-1.5 rounded bg-[#1f1f23] hover:bg-[#292a2d] border border-[#3b494b] transition-colors bg-choke-hazard relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleChannel(ch.id)}
                        className="text-[#ffba38] hover:text-white transition-colors"
                      >
                        {ch.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[#849495]" />
                        )}
                      </button>
                      <div className="w-3 h-3 rounded-full bg-white border border-[#849495] shadow-sm"></div>
                      <span className="text-[11px] font-mono-tech font-semibold text-white">
                        {ch.name}
                      </span>
                    </div>
                    <span className="px-1 py-0.5 rounded bg-[#0d0e11] text-[#ffba38] font-mono-tech font-bold text-[9px] border border-[#3b494b]">
                      {highlightChoke.toFixed(1)}px Choke
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[9px] font-mono-tech text-[#b9cacb] relative z-10 pl-6">
                    <span>{ch.solid}</span>
                    <span className="text-[#00f0ff]">{ch.dotShape}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-1.5 rounded hover:bg-[#1f1f23] text-[#b9cacb] transition-colors border border-transparent hover:border-[#3b494b]"
              >
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleChannel(ch.id)}
                    className="text-[#b9cacb] hover:text-[#00f0ff] transition-colors"
                  >
                    {ch.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#849495]" />
                    )}
                  </button>
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: ch.colorHex }}
                  ></div>
                  <span className={`text-[11px] font-mono-tech font-medium ${ch.visible ? 'text-[#e3e2e6]' : 'text-[#849495] line-through'}`}>
                    {ch.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono-tech text-[#849495]">
                  {ch.dotShape}
                </span>
              </div>
            );
          })}
        </div>

        {/* Prepress Mechanical Micro Tools Section */}
        <div className="px-3 pt-3 pb-1">
          <span className="text-[9px] font-mono-tech font-semibold uppercase text-[#849495] tracking-wider">
            Raster Scrubbers
          </span>
        </div>

        <div className="px-1.5 space-y-1">
          {/* Density Pipette */}
          <button
            onClick={onTogglePipette}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border transition-all text-left ${
              isPipetteActive
                ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#dbfcff]'
                : 'bg-[#292a2d]/40 hover:bg-[#1f1f23] border-[#3b494b] text-[#e3e2e6]'
            }`}
            title="Toggle eyedropper inspection over the canvas image"
          >
            <div className="flex items-center space-x-2">
              <Pipette className={`w-4 h-4 ${isPipetteActive ? 'text-[#00f0ff] animate-bounce' : 'text-[#00f0ff]'}`} />
              <span className="text-[10px] font-mono-tech">Density Pipette</span>
            </div>
            <span className="font-mono-tech font-bold text-[10px] text-[#00dbe9]">
              {pipetteDensity.toFixed(1)}%
            </span>
          </button>

          {/* Highlight Choke Ruler */}
          <div 
            onClick={onOpenChokeMatrix}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#292a2d]/40 hover:bg-[#1f1f23] border border-[#3b494b] cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-[#ffd799]" />
              <span className="text-[10px] font-mono-tech text-[#e3e2e6]">Highlight Choke</span>
            </div>
            <span className="font-mono-tech font-bold text-[10px] text-[#ffdeac]">
              {highlightChoke.toFixed(1)} px
            </span>
          </div>

          {/* Dust Filter */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#292a2d]/40 hover:bg-[#1f1f23] border border-[#3b494b]">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#b9cacb]" />
              <span className="text-[10px] font-mono-tech text-[#e3e2e6]">Stray Dust Purge</span>
            </div>
            <span className="font-mono-tech font-bold text-[10px] text-[#b9cacb]">
              &lt; 0.2 mm
            </span>
          </div>
        </div>
      </div>

      {/* Rail Footer */}
      <div className="p-1.5 border-t border-[#3b494b] bg-[#0d0e11] space-y-1">
        <button
          onClick={onOpenChokeMatrix}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#1f1f23] text-[#b9cacb] hover:text-[#e3e2e6] text-[10px] font-mono-tech transition-colors"
        >
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Choke / Spread Matrix</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#849495]" />
        </button>

        <button
          onClick={onToggleRulers}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#1f1f23] text-[#b9cacb] hover:text-[#e3e2e6] text-[10px] font-mono-tech transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Grid className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Canvas Bed Rulers</span>
          </div>
          <span className={`text-[10px] font-mono-tech font-bold ${showRulers ? 'text-[#00f0ff]' : 'text-[#849495]'}`}>
            {showRulers ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
    </aside>
  );
};
