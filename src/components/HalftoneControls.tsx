import React from 'react';
import { HalftoneSettings, HalftoneDotShape, HalftoneColorMode } from '../types';
import { 
  Sliders, 
  Circle, 
  Square, 
  Minus, 
  RotateCw, 
  SunMedium, 
  Layers, 
  Contrast, 
  Palette,
  RotateCcw
} from 'lucide-react';

interface HalftoneControlsProps {
  settings: HalftoneSettings;
  onChange: (newSettings: Partial<HalftoneSettings>) => void;
  onReset: () => void;
}

export const HalftoneControls: React.FC<HalftoneControlsProps> = ({
  settings,
  onChange,
  onReset
}) => {
  const shapes: { id: HalftoneDotShape; label: string; icon: React.ReactNode }[] = [
    { id: 'round', label: 'Círculo', icon: <Circle className="w-3.5 h-3.5 fill-current" /> },
    { id: 'diamond', label: 'Diamante', icon: <div className="w-2.5 h-2.5 bg-current rotate-45" /> },
    { id: 'line', label: 'Linhas', icon: <Minus className="w-3.5 h-3.5 stroke-[3]" /> },
    { id: 'square', label: 'Quadrado', icon: <Square className="w-3.5 h-3.5 fill-current" /> }
  ];

  const colorModes: { id: HalftoneColorMode; label: string }[] = [
    { id: 'monochrome', label: 'Preto & Branco' },
    { id: 'cmyk', label: 'Colorido CMYK' },
    { id: 'custom', label: 'Personalizado' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Efeito Halftone</span>
        </label>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restaurar</span>
        </button>
      </div>

      {/* Modo de Cor */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-neutral-300">Modo de Cor</label>
        <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {colorModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange({ colorMode: mode.id })}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all text-center ${
                settings.colorMode === mode.id
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formato do Ponto */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-neutral-300">Formato do Ponto</label>
        <div className="grid grid-cols-4 gap-1.5">
          {shapes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ shape: s.id })}
              className={`py-2 px-1.5 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                settings.shape === s.id
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="text-current">{s.icon}</div>
              <span className="text-[10px]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders de Ajuste Fino */}
      <div className="space-y-3 pt-1">
        {/* Tamanho do Ponto */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Tamanho dos Pontos</span>
            <span className="font-mono text-cyan-400 font-semibold">{settings.dotSize} px</span>
          </div>
          <input
            type="range"
            min="3"
            max="26"
            step="1"
            value={settings.dotSize}
            onChange={(e) => onChange({ dotSize: Number(e.target.value) })}
            className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>Fino (detalhado)</span>
            <span>Grosso (estilizado)</span>
          </div>
        </div>

        {/* Contraste / Intensidade */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 flex items-center gap-1">
              <Contrast className="w-3 h-3 text-neutral-400" />
              <span>Contraste</span>
            </span>
            <span className="font-mono text-cyan-400 font-semibold">{settings.contrast.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.contrast}
            onChange={(e) => onChange({ contrast: Number(e.target.value) })}
            className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Ângulo */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-neutral-400" />
              <span>Ângulo da Grade</span>
            </span>
            <span className="font-mono text-cyan-400 font-semibold">{settings.angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={settings.angle}
            onChange={(e) => onChange({ angle: Number(e.target.value) })}
            className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Opções e Cores */}
      <div className="pt-2 border-t border-neutral-800 space-y-2.5">
        <label className="text-[11px] font-medium text-neutral-300 block">Opções Adicionais</label>

        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-300">Fundo Transparente</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.transparentBg}
              onChange={(e) => onChange({ transparentBg: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-300">Inverter Pontos (Negativo)</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.invert}
              onChange={(e) => onChange({ invert: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Seletores de Cor (se monocromático ou custom) */}
        {settings.colorMode !== 'cmyk' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
              <label className="text-[10px] text-neutral-400 block">Cor do Ponto</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.dotColor}
                  onChange={(e) => onChange({ dotColor: e.target.value })}
                  className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-neutral-300 uppercase">{settings.dotColor}</span>
              </div>
            </div>

            {!settings.transparentBg && (
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                <label className="text-[10px] text-neutral-400 block">Cor do Fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.bgColor}
                    onChange={(e) => onChange({ bgColor: e.target.value })}
                    className="w-7 h-7 rounded border border-neutral-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-neutral-300 uppercase">{settings.bgColor}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
