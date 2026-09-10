export type ViewTab = 'workspace' | 'channels' | 'presets' | 'queue';

export type ViewMode = 'composite' | 'white-underbase' | 'split-cmyk' | 'original';

export type GarmentColor = 'black' | 'white' | 'charcoal' | 'navy';

export type DotShape = 'euclidean' | 'round' | 'stochastic' | 'line';

export type UnderbaseMode = 
  | 'highlight-gradation' 
  | 'solid-heavy' 
  | 'choke-only' 
  | 'color-subtractive';

export interface ChannelLayer {
  id: string;
  name: string;
  shortName: string;
  colorHex: string;
  angle: number;
  dotShape: string;
  visible: boolean;
  solid: string;
  density: number; // 0 - 100%
  chokePx?: number;
}

export interface ArtworkSpec {
  id: string;
  title: string;
  fileName: string;
  url: string;
  altText: string;
  dpi: number;
  widthMm: number;
  heightMm: number;
  pixelWidth: number;
  pixelHeight: number;
  category: string;
}

export interface RipSettings {
  dotShape: DotShape;
  lpi: number;
  angles: {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
  };
  anglesLocked: boolean;
  dotGainComp: number; // percentage, e.g. +8.0%
  underbaseMode: UnderbaseMode;
  underbaseChoke: number; // -6px to 0px
  minimumDotCutoff: number; // 0 to 15%
  doublePass: number; // 100%, 150%, 200%
  currentPresetId: string;
}

export interface ProductionPreset {
  id: string;
  title: string;
  subtitle: string;
  lpi: number;
  dotShape: DotShape;
  underbaseChoke: number;
  underbaseMode: UnderbaseMode;
  minimumCutoff: number;
  doublePass: number;
  substrate: string;
  heatPressTemp: string;
  heatPressTime: string;
  washRating: string;
}

export interface PrintQueueItem {
  id: string;
  jobName: string;
  artworkTitle: string;
  thumbnailUrl: string;
  status: 'ready' | 'processing' | 'printing' | 'completed';
  copies: number;
  widthMm: number;
  heightMm: number;
  lpi: number;
  choke: number;
  estimatedInkMl: number;
  createdAt: string;
}
