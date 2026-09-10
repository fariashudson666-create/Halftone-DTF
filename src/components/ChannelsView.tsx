import React, { useState } from 'react';
import { ChannelLayer, ArtworkSpec, RipSettings } from '../types';
import { Eye, EyeOff, Sliders, Download, Layers, ShieldCheck } from 'lucide-react';

interface ChannelsViewProps {
  channels: ChannelLayer[];
  onToggleChannel: (id: string) => void;
  currentArtwork: ArtworkSpec;
  ripSettings: RipSettings;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onToggleChannel,
  currentArtwork,
  ripSettings
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('white-underbase');

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  return (
    <div className="flex-1 flex flex-col bg-[#0d0e11] overflow-hidden select-none">
      {/* View Header */}
      <div className="h-10 px-4 bg-[#1b1b1f] border-b border-[#3b494b] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#00f0ff]" />
          <span className="text-[12px] font-mono-tech font-bold text-[#dbfcff]">
            Multi-Channel Separation Workbench
          </span>
          <span className="text-[9px] font-mono-tech text-[#849495]">
            Individual Screen Angles &amp; Density Histograms
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono-tech text-[#b9cacb]">
          <span>Resolution: 600 DPI Calibrated</span>
          <span>•</span>
          <span className="text-[#00f0ff]">Halftone: {ripSettings.lpi} LPI {ripSettings.dotShape}</span>
        </div>
      </div>

      {/* Main Channels Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Channel Grid Cards */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {channels.map((ch) => {
            const isWhite = ch.id === 'white-underbase';
            const isSelected = selectedChannelId === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`p-3 rounded bg-[#1f1f23] border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#00f0ff] ring-1 ring-[#00f0ff]/50 bg-[#292a2d]'
                    : 'border-[#3b494b] hover:border-[#849495]'
                } ${isWhite ? 'bg-choke-hazard' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#3b494b]">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: ch.colorHex }}
                      ></div>
                      <span className="text-[12px] font-mono-tech font-bold text-[#e3e2e6]">
                        {ch.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleChannel(ch.id);
                      }}
                      className="p-1 rounded text-[#b9cacb] hover:text-[#00f0ff]"
                    >
                      {ch.visible ? <Eye className="w-4 h-4 text-[#00f0ff]" /> : <EyeOff className="w-4 h-4 text-[#849495]" />}
                    </button>
                  </div>

                  {/* Channel Mini Preview Simulation */}
                  <div className="my-2.5 h-32 rounded bg-[#0d0e11] border border-[#3b494b] relative overflow-hidden flex items-center justify-center">
                    <img
                      src={currentArtwork.url}
                      alt={ch.name}
                      className="w-full h-full object-cover opacity-60 filter grayscale"
                      crossOrigin="anonymous"
                    />
                    <div
                      className="absolute inset-0 opacity-40 mix-blend-color"
                      style={{ backgroundColor: ch.colorHex }}
                    />
                    <div 
                      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
                      style={{ 
                        backgroundImage: `radial-gradient(${ch.colorHex} 1.5px, transparent 1.5px)`, 
                        backgroundSize: `${Math.max(4, Math.round((90 - ripSettings.lpi) / 6))}px ${Math.max(4, Math.round((90 - ripSettings.lpi) / 6))}px` 
                      }}
                    />
                    <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono-tech text-white">
                      Density: {ch.density}%
                    </span>
                    <span className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono-tech text-[#ffd799]">
                      Angle: {ch.angle.toFixed(1)}°
                    </span>
                  </div>

                  {/* Channel Metrics */}
                  <div className="space-y-1 text-[9px] font-mono-tech">
                    <div className="flex justify-between text-[#b9cacb]">
                      <span>Dot Shape Profile:</span>
                      <span className="text-[#00dbe9]">{ch.dotShape}</span>
                    </div>
                    <div className="flex justify-between text-[#b9cacb]">
                      <span>Screen Frequency:</span>
                      <span className="text-white">{ripSettings.lpi} LPI</span>
                    </div>
                    {isWhite && (
                      <div className="flex justify-between text-[#ffd799] font-bold">
                        <span>Underbase Choke Inset:</span>
                        <span>{ripSettings.underbaseChoke.toFixed(1)} px</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#3b494b] flex justify-between items-center mt-2">
                  <span className="text-[8px] font-mono-tech text-[#849495]">
                    {ch.solid}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = currentArtwork.url;
                      link.download = `${ch.id}_separation_600dpi.png`;
                      link.click();
                    }}
                    className="px-2 py-0.5 rounded bg-[#292a2d] hover:bg-[#343538] text-[9px] font-mono-tech text-[#00f0ff] flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Plate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Sidebar */}
        <div className="w-72 bg-[#1b1b1f] border-l border-[#3b494b] p-3 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-mono-tech font-bold uppercase text-[#00f0ff] tracking-wider">
              Selected Channel Inspector
            </span>
            <h3 className="text-[14px] font-headline font-bold text-[#e3e2e6]">
              {selectedChannel.name}
            </h3>
            <p className="text-[9px] font-mono-tech text-[#849495]">
              Calibrated for Ricoh Gen5 industrial drop-on-demand piezo printhead.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0d0e11] border border-[#3b494b] space-y-2">
            <div className="text-[10px] font-mono-tech font-bold text-[#ffd799]">
              Tone Repartition Histogram
            </div>
            {/* Histogram bars simulation */}
            <div className="h-20 flex items-end space-x-1 pt-2 border-b border-[#3b494b] px-1">
              {[20, 35, 45, 60, 85, 95, 80, 65, 40, 30, 15, 10].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#00f0ff]/70 hover:bg-[#00f0ff] rounded-t transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-mono-tech text-[#849495]">
              <span>0% Highlights</span>
              <span>50% Midtones</span>
              <span>100% Shadows</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono-tech">
              <span className="text-[#b9cacb]">Coverage Area:</span>
              <span className="text-white font-bold">{selectedChannel.density}%</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono-tech">
              <span className="text-[#b9cacb]">Screen Angle:</span>
              <span className="text-[#00f0ff] font-bold">{selectedChannel.angle}°</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono-tech">
              <span className="text-[#b9cacb]">Ink Volume per Print:</span>
              <span className="text-white font-bold">~ 0.42 ml</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
