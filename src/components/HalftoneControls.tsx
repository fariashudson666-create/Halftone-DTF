import React from 'react';
import { HalftoneSettings, HalftoneDotShape, HalftoneColorMode, UpscaleFactor } from '../types';
import { 
  Sliders, 
  Circle, 
  Square, 
  Minus, 
  RotateCw, 
  Contrast, 
  Palette,
  RotateCcw,
  Scissors,
  Zap,
  Pipette,
  Check
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

  const colorModes: { id: HalftoneColorMode; label: string; desc: string }[] = [
    { id: 'original', label: 'Cores Originais', desc: 'Pontos com as cores reais da imagem' },
    { id: 'monochrome', label: 'Preto & Branco', desc: 'Efeito monocromático clássico' },
    { id: 'cmyk', label: 'Colorido CMYK', desc: 'Retícula industrial de impressão' },
    { id: 'custom', label: 'Personalizado', desc: 'Escolha a cor do ponto e fundo' }
  ];

  const upscaleOptions: { factor: UpscaleFactor; label: string; tag: string }[] = [
    { factor: 1, label: '1x', tag: 'Original' },
    { factor: 2, label: '2x', tag: 'HD' },
    { factor: 4, label: '4x', tag: 'Ultra' },
    { factor: 8, label: '8x', tag: 'Máxima' }
  ];

  const quickBgColors = [
    { label: 'Branco', hex: '#ffffff' },
    { label: 'Preto', hex: '#000000' },
    { label: 'Verde', hex: '#00ff00' },
    { label: 'Azul', hex: '#0000ff' },
    { label: 'Cinza', hex: '#808080' }
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho dos Controles */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Efeito Halftone & Ajustes</span>
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

      {/* 1. MODO DE COR: Botão para Cores Originais em destaque */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-neutral-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modo de Cor</span>
          </label>
          <span className="text-[10px] text-cyan-400 font-medium">
            {settings.colorMode === 'original' ? 'Mantendo cores da foto' : ''}
          </span>
        </div>

        {/* Botão de Destaque para Cores Originais */}
        <button
          type="button"
          onClick={() => onChange({ colorMode: 'original' })}
          className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
            settings.colorMode === 'original'
              ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/30'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-cyan-500 flex items-center justify-center text-white shadow-xs">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold block leading-tight">Deixar Cores Originais</span>
              <span className="text-[10px] text-neutral-400 block leading-tight">
                Cada ponto assume a cor exata da foto
              </span>
            </div>
          </div>
          {settings.colorMode === 'original' && (
            <div className="w-4 h-4 rounded-full bg-cyan-400 text-neutral-950 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </button>

        {/* Demais Modos de Cor */}
        <div className="grid grid-cols-3 gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
          {colorModes
            .filter((m) => m.id !== 'original')
            .map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange({ colorMode: mode.id })}
                className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition-all text-center truncate ${
                  settings.colorMode === mode.id
                    ? 'bg-neutral-800 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {mode.label}
              </button>
            ))}
        </div>
      </div>

      {/* 2. TIRAR APENAS O FUNDO DA IMAGEM (Remover Fundo por Cor) */}
      <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-neutral-200 block leading-tight">
                Tirar Fundo da Imagem
              </span>
              <span className="text-[10px] text-neutral-400 block leading-tight">
                Remover cor selecionada do fundo
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.removeBgColor}
              onChange={(e) => onChange({ removeBgColor: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {settings.removeBgColor && (
          <div className="pt-2 border-t border-neutral-800 space-y-3 animate-fadeIn">
            {/* Escolha da Cor do Fundo */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-neutral-300 block">
                Escolha a Cor do Fundo a Remover:
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.bgTargetColor}
                  onChange={(e) => onChange({ bgTargetColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-neutral-800 p-0.5"
                />
                <input
                  type="text"
                  value={settings.bgTargetColor}
                  onChange={(e) => onChange({ bgTargetColor: e.target.value })}
                  placeholder="#ffffff"
                  className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-700 rounded-md font-mono text-xs text-neutral-200 uppercase"
                />
                
                {/* Cores Rápidas de Fundo */}
                <div className="flex items-center gap-1">
                  {quickBgColors.map((q) => (
                    <button
                      key={q.hex}
                      type="button"
                      onClick={() => onChange({ bgTargetColor: q.hex })}
                      title={`Selecionar fundo ${q.label}`}
                      className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                        settings.bgTargetColor.toLowerCase() === q.hex
                          ? 'ring-2 ring-cyan-400 border-white scale-105'
                          : 'border-neutral-600'
                      }`}
                      style={{ backgroundColor: q.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tolerância / Sensibilidade da Remoção */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 text-[11px]">Tolerância / Alcance da Cor</span>
                <span className="font-mono text-cyan-400 font-semibold">{settings.bgTolerance}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="65"
                step="1"
                value={settings.bgTolerance}
                onChange={(e) => onChange({ bgTolerance: Number(e.target.value) })}
                className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                <span>Mais estrito (5%)</span>
                <span>Mais amplo (65%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. UPSCALING DE ATÉ 8X (SUPER RESOLUÇÃO) */}
      <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-neutral-200 block leading-tight">
                Upscaling de Imagem
              </span>
              <span className="text-[10px] text-neutral-400 block leading-tight">
                Redefinir em até 8x para ultra resolução
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
            {settings.upscaleFactor}x Ativo
          </span>
        </div>

        {/* Botões 1x, 2x, 4x, 8x */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {upscaleOptions.map((opt) => {
            const isSelected = settings.upscaleFactor === opt.factor;
            return (
              <button
                key={opt.factor}
                type="button"
                onClick={() => onChange({ upscaleFactor: opt.factor })}
                className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-bold shadow-sm ring-2 ring-cyan-400/20'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span className="text-xs font-mono font-bold leading-tight">{opt.label}</span>
                <span className={`text-[9px] leading-tight ${isSelected ? 'text-neutral-950' : 'text-neutral-500'}`}>
                  {opt.tag}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed">
          {settings.upscaleFactor === 1 && 'Resolução padrão da sua imagem.'}
          {settings.upscaleFactor === 2 && 'Duplica a resolução mantendo nitidez nítida.'}
          {settings.upscaleFactor === 4 && 'Multiplica por 4x para impressão em grande formato.'}
          {settings.upscaleFactor === 8 && 'Super resolução máxima de 8x para detalhes cirúrgicos e pôsteres.'}
        </p>
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
            max="28"
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

        {/* Proximidade / Espaçamento dos Pontos */}
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-200 font-medium flex items-center gap-1.5">
              <span>Proximidade dos Pontos</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-400 font-semibold">
              {(settings.dotSpacing ?? 0.9) <= 0.65
                ? 'Muito Próximos'
                : (settings.dotSpacing ?? 0.9) <= 0.85
                ? 'Próximos'
                : (settings.dotSpacing ?? 0.9) <= 1.05
                ? 'Equilibrado'
                : 'Espaçados'}
              {' '}({Math.round((1 / (settings.dotSpacing ?? 0.9)) * 100)}%)
            </span>
          </div>

          <input
            type="range"
            min="0.4"
            max="1.5"
            step="0.05"
            value={settings.dotSpacing ?? 0.9}
            onChange={(e) => onChange({ dotSpacing: Number(e.target.value) })}
            className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span className="text-cyan-400 font-medium">← Mais Próximos (Juntos)</span>
            <span>Espaçados (Separados) →</span>
          </div>

          {/* Atalhos Rápidos de Proximidade */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[
              { val: 0.5, label: 'Juntos', desc: 'Super colados' },
              { val: 0.7, label: 'Próximos', desc: 'Trama densa' },
              { val: 0.95, label: 'Normal', desc: 'Padrão' },
              { val: 1.3, label: 'Espaçado', desc: 'Afastados' }
            ].map((p) => {
              const active = Math.abs((settings.dotSpacing ?? 0.9) - p.val) < 0.1;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => onChange({ dotSpacing: p.val })}
                  className={`py-1 px-1 rounded-md text-center border text-[10px] font-medium transition-all ${
                    active
                      ? 'bg-cyan-500 text-neutral-950 font-bold border-cyan-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <span className="block leading-tight">{p.label}</span>
                </button>
              );
            })}
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
            max="2.2"
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

      {/* Opções Adicionais: Fundo Transparente & Inverter */}
      <div className="pt-2 border-t border-neutral-800 space-y-2.5">
        <label className="text-[11px] font-medium text-neutral-300 block">Opções Adicionais</label>

        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800">
          <div>
            <span className="text-xs text-neutral-200 block">Fundo Transparente</span>
            <span className="text-[10px] text-neutral-400 block">Ideal para estampa DTF/Silk</span>
          </div>
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
          <div>
            <span className="text-xs text-neutral-200 block">Inverter Pontos (Negativo)</span>
            <span className="text-[10px] text-neutral-400 block">Inverte áreas claras e escuras</span>
          </div>
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

        {/* Seletores de Cor (se custom ou monocromático) */}
        {settings.colorMode === 'custom' && (
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
