export type HalftoneColorMode = 'original' | 'monochrome' | 'cmyk' | 'custom';

export type HalftoneDotShape = 'round' | 'diamond' | 'line' | 'square';

export type UpscaleFactor = 1 | 2 | 4 | 8;

export interface HalftoneSettings {
  dotSize: number; // 2 to 32 (pixel cell size)
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
}

export interface ImagePreset {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}

