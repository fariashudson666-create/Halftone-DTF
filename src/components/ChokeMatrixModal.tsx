import React from 'react';
import { X, SlidersHorizontal, AlertCircle, Check } from 'lucide-react';

interface ChokeMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  underbaseChoke: number;
  onChangeChoke: (val: number) => void;
}

export const ChokeMatrixModal: React.FC<ChokeMatrixModalProps> = ({
  isOpen,
  onClose,
  underbaseChoke,
  onChangeChoke
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#1b1b1f] border border-[#3b494b] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0d0e11] border-b border-[#3b494b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-[#ffd799]" />
            <div>
              <h2 className="text-[13px] font-headline font-bold text-[#dbfcff]">
                Prepress Choke / Spread Matrix
              </h2>
              <p className="text-[9px] font-mono-tech text-[#849495]">
                DTF White Underbase Inset &amp; Adhesive Bleed Control
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
        <div className="p-4 space-y-4">
          {/* Explanation Alert */}
          <div className="p-2.5 rounded bg-[#feb300]/10 border border-[#feb300]/30 flex items-start space-x-2 text-[10px] font-mono-tech text-[#ffd799]">
            <AlertCircle className="w-4 h-4 text-[#ffd799] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Why Choke Matters in DTF:</strong> The white underbase must be inset by -1px to -3px from the colored artwork edges. This prevents visible white ink "halos" or registration shifts on the cured PET film.
            </p>
          </div>

          {/* Visual Diagram */}
          <div className="p-4 rounded bg-[#0d0e11] border border-[#3b494b] flex flex-col items-center justify-center space-y-2">
            <div className="relative w-48 h-24 border-2 border-[#00f0ff] rounded flex items-center justify-center bg-[#1f1f23]">
              <span className="absolute top-1 left-2 text-[8px] font-mono-tech text-[#00f0ff]">
                Outer CMYK Edge (0px)
              </span>
              {/* Inset White mask */}
              <div 
                className="border-2 border-dashed border-white rounded bg-white/20 flex items-center justify-center transition-all duration-200"
                style={{
                  width: `${Math.max(60, 100 - Math.abs(underbaseChoke) * 8)}%`,
                  height: `${Math.max(40, 80 - Math.abs(underbaseChoke) * 8)}%`
                }}
              >
                <span className="text-[9px] font-mono-tech text-white font-bold">
                  White Mask ({underbaseChoke.toFixed(1)}px)
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono-tech text-[#849495]">
              Choke Gap: {Math.abs(underbaseChoke).toFixed(1)} px inset per side
            </span>
          </div>

          {/* Quick Choke Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-[#b9cacb]">
              Choke Profile Presets:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'Flush (0px)', val: 0 },
                { label: 'Light (-1px)', val: -1 },
                { label: 'DTF Std (-2px)', val: -2 },
                { label: 'Aggressive (-4px)', val: -4 }
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => onChangeChoke(item.val)}
                  className={`py-1.5 px-2 rounded text-[10px] font-mono-tech font-bold border transition-all ${
                    underbaseChoke === item.val
                      ? 'bg-[#feb300] text-[#432c00] border-[#feb300]'
                      : 'bg-[#1f1f23] border-[#3b494b] text-[#e3e2e6] hover:bg-[#343538]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono-tech">
              <span className="text-[#b9cacb]">Manual Micro-Adjustment:</span>
              <span className="text-[#ffd799] font-bold">{underbaseChoke.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="-6"
              max="0"
              step="0.5"
              value={underbaseChoke}
              onChange={(e) => onChangeChoke(Number(e.target.value))}
              className="w-full accent-[#feb300] h-1.5 bg-[#343538] rounded appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0d0e11] border-t border-[#3b494b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] font-mono-tech text-[10px] font-bold transition-all"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
