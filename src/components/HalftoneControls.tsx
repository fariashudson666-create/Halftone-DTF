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
  Check,
  Sparkles,
  Layers,
  Newspaper,
  Ban,
  ShieldCheck,
  Printer
} from 'lucide-react';

interface HalftoneControlsProps {
  settings: HalftoneSettings;
  onChange: (newSettings: Partial<HalftoneSettings>) => void;
  onReset: () => void;
  onOpenVectorStudio?: () => void;
}

export const HalftoneControls: React.FC<HalftoneControlsProps> = ({
  settings,
  onChange,
  onReset,
  onOpenVectorStudio
}) => {
  const presets = [
    {
      id: 'dtf_textil',
      label: 'DTF Têxtil',
      tag: 'Micro-pontos Separados',
      settings: {
        colorMode: 'original' as const,
        shape: 'round' as const,
        dotSize: 3.5,
        dotSpacing: 1.35,
        angle: 45,
        contrast: 1.15,
        transparentBg: true,
        dtfSeparationMode: true
      }
    },
    {
      id: 'popart',
      label: 'Pop Art / Gibi',
      tag: 'Ben-Day Colorido',
      settings: {
        colorMode: 'original' as const,
        shape: 'round' as const,
        dotSize: 7,
        dotSpacing: 1.15,
        angle: 45,
        contrast: 1.25,
        bgColor: '#ffffff',
        transparentBg: false,
        dtfSeparationMode: true
      }
    },
    {
      id: 'newspaper',
      label: 'Jornal Clássico',
      tag: 'P&B 45°',
      settings: {
        colorMode: 'monochrome' as const,
        shape: 'round' as const,
        dotSize: 6,
        dotSpacing: 1.2,
        angle: 45,
        contrast: 1.35,
        bgColor: '#ffffff',
        transparentBg: false,
        dtfSeparationMode: true
      }
    },
    {
      id: 'cmyk_press',
      label: 'Offset CMYK',
      tag: 'Rosetas Reais',
      settings: {
        colorMode: 'cmyk' as const,
        shape: 'round' as const,
        dotSize: 8,
        dotSpacing: 1.25,
        angle: 0,
        contrast: 1.2,
        bgColor: '#ffffff',
        transparentBg: false,
        dtfSeparationMode: true
      }
    },
    {
      id: 'engraving',
      label: 'Gravura / Moeda',
      tag: 'Linhas Contínuas',
      settings: {
        colorMode: 'monochrome' as const,
        shape: 'line' as const,
        dotSize: 6,
        dotSpacing: 1.25,
        angle: 45,
        contrast: 1.4,
        bgColor: '#ffffff',
        transparentBg: false,
        dtfSeparationMode: true
      }
    },
    {
      id: 'diamond_art',
      label: 'Diamante Retícula',
      tag: 'Geométrica',
      settings: {
        colorMode: 'monochrome' as const,
        shape: 'diamond' as const,
        dotSize: 7,
        dotSpacing: 1.25,
        angle: 45,
        contrast: 1.3,
        bgColor: '#ffffff',
        transparentBg: false,
        dtfSeparationMode: true
      }
    }
  ];

  // Verifica se o preset atual combina exatamente
  const activePresetId = presets.find(
    (p) =>
      settings.colorMode === p.settings.colorMode &&
      settings.shape === p.settings.shape &&
      Math.abs(settings.dotSpacing - p.settings.dotSpacing) < 0.15 &&
      Math.abs(settings.dotSize - p.settings.dotSize) < 2
  )?.id;

  const isNoPreset = !activePresetId;

  const handleSetNoPreset = () => {
    onChange({
      colorMode: 'original',
      shape: 'round',
      dotSize: 4.5,
      dotSpacing: 1.25,
      angle: 45,
      contrast: 1.0,
      transparentBg: false,
      removeBgColor: false,
      dtfSeparationMode: true
    });
  };

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

      {/* BLOCO EM DESTAQUE: TRANSFORMAR EM VETOR (SVG) */}
      {onOpenVectorStudio && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950/50 via-neutral-900 to-purple-950/30 border border-cyan-500/40 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-400/20 flex items-center justify-center text-cyan-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  Transformar em Vetor (SVG)
                </span>
                <span className="text-[10px] text-cyan-300/80 block leading-tight">
                  Escalável sem perda para DTF & Gráfica
                </span>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
              Vetor Puro
            </span>
          </div>

          <p className="text-[10px] text-neutral-300 leading-relaxed">
            Converte cada ponto do halftone em curvas matemáticas para abrir no Illustrator, CorelDRAW e softwares RIP de DTF.
          </p>

          <button
            type="button"
            onClick={onOpenVectorStudio}
            className="w-full py-2 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:shadow-cyan-500/20 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Abrir Estúdio de Vetorização (SVG)</span>
          </button>
        </div>
      )}

      {/* ESTILOS DE RETÍCULA PRONTOS + BOTÃO SEM ESTILO */}
      <div className="space-y-2 p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Estilos de Retícula Prontos</span>
          </span>
          <span className="text-[9px] text-neutral-400 font-mono">1-Clique</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
          {/* BOTÃO SEM ESTILO (PADRÃO / PERSONALIZADO) */}
          <button
            type="button"
            onClick={handleSetNoPreset}
            className={`py-1.5 px-2 rounded-lg border text-left transition-all ${
              isNoPreset
                ? 'border-amber-400/80 bg-amber-950/30 text-amber-200 ring-1 ring-amber-400/30'
                : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold block leading-tight truncate flex items-center gap-1">
                <Ban className="w-3 h-3 text-amber-400" />
                <span>Sem Estilo</span>
              </span>
              {isNoPreset && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-1" />}
            </div>
            <span className="text-[9px] text-neutral-400 block leading-tight truncate mt-0.5">
              Livre / Padrão
            </span>
          </button>

          {/* DEMAIS ESTILOS PRONTOS */}
          {presets.map((p) => {
            const isMatch = activePresetId === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.settings)}
                className={`py-1.5 px-2 rounded-lg border text-left transition-all ${
                  isMatch
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400/30'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold block leading-tight truncate">
                    {p.label}
                  </span>
                  {isMatch && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 ml-1" />}
                </div>
                <span className="text-[9px] text-neutral-400 block leading-tight truncate mt-0.5">
                  {p.tag}
                </span>
              </button>
            );
          })}
        </div>
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
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">
                Cores Originais da Imagem
              </span>
              <span className="text-[10px] text-neutral-300 block leading-tight">
                Pontos coloridos com as cores reais da foto
              </span>
            </div>
          </div>
          {settings.colorMode === 'original' && (
            <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-neutral-950">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>

        {/* Outros Modos de Cor */}
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

      {/* 2. CALIBRAÇÃO ESPECIAL PARA DTF TÊXTIL (ANTI-EMPLASTAMENTO) */}
      <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-neutral-200 block leading-tight">
                Separação Física para DTF
              </span>
              <span className="text-[10px] text-neutral-400 block leading-tight">
                Mantém vão livre entre os pontos
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dtfSeparationMode !== false}
              onChange={(e) => onChange({ dtfSeparationMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed">
          Evita que os pontos colidantem e virem uma "placa de borracha". Permite que o pó termoplástico grude no tecido mantendo o toque macio na camiseta.
        </p>
      </div>

      {/* 3. TIRAR APENAS O FUNDO DA IMAGEM (Remover Fundo por Cor) */}
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

            {/* Tolerância da Remoção */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300">Tolerância da Cor</span>
                <span className="font-mono text-cyan-400 font-semibold">{settings.bgTolerance}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="75"
                step="1"
                value={settings.bgTolerance}
                onChange={(e) => onChange({ bgTolerance: Number(e.target.value) })}
                className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                <span>Precisa (só a cor exata)</span>
                <span>Ampla (tons parecidos)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. UPSCALING DE ATÉ 8X (SUPER RESOLUÇÃO) */}
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
        {/* Tamanho do Ponto (Micro-pontos menores para DTF) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300">Tamanho dos Pontos</span>
            <span className="font-mono text-cyan-400 font-semibold">{settings.dotSize.toFixed(1)} px</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="22"
            step="0.5"
            value={settings.dotSize}
            onChange={(e) => onChange({ dotSize: Number(e.target.value) })}
            className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span className="text-cyan-400">Micro-pontos DTF (1.5 - 4 px)</span>
            <span>Grandes (10 - 22 px)</span>
          </div>
        </div>

        {/* Proximidade / Espaçamento dos Pontos (Separados) */}
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-200 font-medium flex items-center gap-1.5">
              <span>Espaçamento / Separação dos Pontos</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-400 font-semibold">
              {(settings.dotSpacing ?? 1.25) <= 0.85
                ? 'Juntos / Densos'
                : (settings.dotSpacing ?? 1.25) <= 1.15
                ? 'Normal'
                : (settings.dotSpacing ?? 1.25) <= 1.45
                ? 'Separados (Ideal DTF)'
                : 'Bem Arejados'}
            </span>
          </div>

          <input
            type="range"
            min="0.6"
            max="2.2"
            step="0.05"
            value={settings.dotSpacing ?? 1.25}
            onChange={(e) => onChange({ dotSpacing: Number(e.target.value) })}
            className="w-full accent-cyan-400 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>← Mais Juntos</span>
            <span className="text-cyan-400 font-medium">Mais Separados (DTF) →</span>
          </div>

          {/* Atalhos Rápidos de Separação */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[
              { val: 0.85, label: 'Juntos', desc: 'Denso' },
              { val: 1.10, label: 'Normal', desc: 'Padrão' },
              { val: 1.35, label: 'Separados', desc: 'DTF Ideal' },
              { val: 1.65, label: 'Arejado', desc: 'Afastados' }
            ].map((p) => {
              const active = Math.abs((settings.dotSpacing ?? 1.25) - p.val) < 0.08;
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
            <span className="text-[10px] text-neutral-400 block">Padrão para impressão em filme DTF</span>
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
