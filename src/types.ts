export type HalftoneColorMode = 'monochrome' | 'cmyk' | 'custom';

export type HalftoneDotShape = 'round' | 'diamond' | 'line' | 'square';

export interface HalftoneSettings {
  dotSize: number; // 2 to 24 (pixel cell size)
  shape: HalftoneDotShape;
  colorMode: HalftoneColorMode;
  angle: number; // 0 to 90 degrees
  contrast: number; // 0.6 to 2.2
  invert: boolean; // invert dot density (black/white or negative)
  transparentBg: boolean; // transparent background for sticker/print/design
  dotColor: string; // custom dot color hex
  bgColor: string; // background color hex
}

export interface ImagePreset {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}
