export type HalftoneColorMode = 'original' | 'monochrome' | 'cmyk' | 'custom';

export type HalftoneDotShape = 'round' | 'diamond' | 'line' | 'square';

export type UpscaleFactor = 1 | 2 | 4 | 8;

export interface HalftoneSettings {
  dotSize: number; // 2 to 32 (pixel cell size)
  dotSpacing: number; // 0.4 to 1.6 (proximidade / espaçamento entre centros dos pontos)
  shape: HalftoneDotShape;
  colorMode: HalftoneColorMode;
  angle: number; // 0 to 90 degrees
  contrast: number; // 0.5 to 2.5
  invert: boolean; // invert dot density
  transparentBg: boolean; // transparent background canvas
  dotColor: string; // custom dot color hex
  bgColor: string; // canvas background color hex

  // Remoção de Cor de Fundo da Imagem (Chroma Keying)
  removeBgColor: boolean;
  bgTargetColor: string; // Cor do fundo a ser removido (ex: #ffffff, #000000)
  bgTolerance: number; // Tolerância da remoção (1 a 80%)

  // Upscaling de até 8x para redefinição em super resolução
  upscaleFactor: UpscaleFactor;

  // Calibração Especial DTF (Direct to Film) Têxtil
  dtfSeparationMode?: boolean; // Mantém espaçamento físico entre os pontos para não grudar nem emplastar no filme DTF
  minDotThreshold?: number; // Elimina micro-pontos menores que X para cabeçotes e pó de cola DTF
}

