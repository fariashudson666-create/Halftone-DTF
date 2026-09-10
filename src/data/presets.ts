import { ProductionPreset, ChannelLayer, RipSettings } from '../types';

export const PRODUCTION_PRESETS: ProductionPreset[] = [
  {
    id: 'vintage-soft',
    title: 'Vintage Soft-Feel',
    subtitle: 'Low ink deposit, smooth fade',
    lpi: 55,
    dotShape: 'euclidean',
    underbaseChoke: -2,
    underbaseMode: 'highlight-gradation',
    minimumCutoff: 4,
    doublePass: 100,
    substrate: '100% Combed Ringspun Cotton (180-240 GSM)',
    heatPressTemp: '160°C (320°F)',
    heatPressTime: '15 seconds medium-heavy pressure',
    washRating: '4.8 / 5.0 (ISO 105)'
  },
  {
    id: 'opaque-cotton',
    title: 'Opaque Cotton',
    subtitle: 'Maximum white underbase',
    lpi: 45,
    dotShape: 'round',
    underbaseChoke: -2,
    underbaseMode: 'solid-heavy',
    minimumCutoff: 2,
    doublePass: 150,
    substrate: 'Heavyweight Fleece & Dark Hoodies (350+ GSM)',
    heatPressTemp: '165°C (330°F)',
    heatPressTime: '18 seconds heavy pressure',
    washRating: '5.0 / 5.0 (ISO 105)'
  },
  {
    id: 'poly-sub-block',
    title: 'Poly Sub-Block',
    subtitle: 'Bleed blocker carbon layer',
    lpi: 65,
    dotShape: 'stochastic',
    underbaseChoke: -3,
    underbaseMode: 'choke-only',
    minimumCutoff: 6,
    doublePass: 100,
    substrate: '100% Polyester Performance Jerseys & Activewear',
    heatPressTemp: '135°C (275°F) Low-Cure Anti-Dye Bleed',
    heatPressTime: '12 seconds medium pressure',
    washRating: '4.6 / 5.0 (ISO 105)'
  },
  {
    id: 'high-contrast',
    title: 'High-Contrast',
    subtitle: 'Hard cartoon edge profile',
    lpi: 75,
    dotShape: 'line',
    underbaseChoke: -1,
    underbaseMode: 'color-subtractive',
    minimumCutoff: 5,
    doublePass: 100,
    substrate: 'Twill Canvas, Caps, & Rigid Textile Patches',
    heatPressTemp: '155°C (310°F)',
    heatPressTime: '15 seconds firm pressure',
    washRating: '4.9 / 5.0 (ISO 105)'
  }
];

export const INITIAL_RIP_SETTINGS: RipSettings = {
  dotShape: 'euclidean',
  lpi: 55,
  angles: {
    cyan: 15.0,
    magenta: 75.0,
    yellow: 0.0,
    black: 45.0
  },
  anglesLocked: true,
  dotGainComp: 8.0,
  underbaseMode: 'highlight-gradation',
  underbaseChoke: -2.0,
  minimumDotCutoff: 4.0,
  doublePass: 100,
  currentPresetId: 'vintage-soft'
};

export const INITIAL_CHANNELS: ChannelLayer[] = [
  {
    id: 'composite',
    name: 'Composite',
    shortName: 'ALL',
    colorHex: '#00f0ff',
    angle: 0,
    dotShape: 'All Layers',
    visible: true,
    solid: 'All Channels',
    density: 92
  },
  {
    id: 'white-underbase',
    name: 'White Underbase',
    shortName: 'W1+W2',
    colorHex: '#ffffff',
    angle: 0,
    dotShape: '0° Euclidean',
    visible: true,
    solid: 'W1+W2 100% Solid',
    density: 88,
    chokePx: -2.0
  },
  {
    id: 'cyan',
    name: 'Cyan (C)',
    shortName: 'C',
    colorHex: '#22d3ee',
    angle: 15.0,
    dotShape: '15° Round',
    visible: true,
    solid: 'C 100%',
    density: 64
  },
  {
    id: 'magenta',
    name: 'Magenta (M)',
    shortName: 'M',
    colorHex: '#ec4899',
    angle: 75.0,
    dotShape: '75° Round',
    visible: true,
    solid: 'M 100%',
    density: 58
  },
  {
    id: 'yellow',
    name: 'Yellow (Y)',
    shortName: 'Y',
    colorHex: '#facc15',
    angle: 0.0,
    dotShape: '0° Round',
    visible: true,
    solid: 'Y 100%',
    density: 72
  },
  {
    id: 'black',
    name: 'Black (K)',
    shortName: 'K',
    colorHex: '#18181b',
    angle: 45.0,
    dotShape: '45° Euclidean',
    visible: true,
    solid: 'K 100%',
    density: 81
  },
  {
    id: 'spot-varnish',
    name: 'Spot Varnish',
    shortName: 'UV/TPU',
    colorHex: '#ffb3b6',
    angle: 0,
    dotShape: 'Muted',
    visible: false,
    solid: 'Adhesive Booster',
    density: 35
  }
];
