import { HalftoneSettings, HalftoneDotShape } from '../types';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function colorDistancePct(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Distância Euclidiana normalizada 0..100% (máxima é sqrt(3 * 255^2) ≈ 441.67)
  return (Math.sqrt(dr * dr + dg * dg + db * db) / 441.67) * 100;
}

export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 0.999) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }
  const c = Math.max(0, Math.min(1, (1 - rn - k) / (1 - k)));
  const m = Math.max(0, Math.min(1, (1 - gn - k) / (1 - k)));
  const y = Math.max(0, Math.min(1, (1 - bn - k) / (1 - k)));
  return { c, m, y, k: Math.max(0, Math.min(1, k)) };
}

interface PixelSample {
  r: number;
  g: number;
  b: number;
  a: number;
  lum: number;
}

/**
 * Amostragem multi-ponto (anti-aliasing de área) para o centro de cada célula da retícula.
 * Suaviza degradês e bordas com precisão fotográfica para DTF.
 */
function sampleCellArea(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number
): PixelSample {
  const d = Math.max(0.6, radius * 0.4);
  const px0 = Math.min(width - 1, Math.max(0, Math.round(cx)));
  const py0 = Math.min(height - 1, Math.max(0, Math.round(cy)));

  // Se raio for pequeno, lê o pixel central
  if (radius <= 1.2) {
    const idx = (py0 * width + px0) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3] / 255;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return { r, g, b, a, lum };
  }

  // Padrão Quincunx ponderado (centro + 4 cantos da célula)
  const samples = [
    [px0, py0, 0.44],
    [Math.min(width - 1, Math.max(0, Math.round(cx - d))), Math.min(height - 1, Math.max(0, Math.round(cy - d))), 0.14],
    [Math.min(width - 1, Math.max(0, Math.round(cx + d))), Math.min(height - 1, Math.max(0, Math.round(cy - d))), 0.14],
    [Math.min(width - 1, Math.max(0, Math.round(cx - d))), Math.min(height - 1, Math.max(0, Math.round(cy + d))), 0.14],
    [Math.min(width - 1, Math.max(0, Math.round(cx + d))), Math.min(height - 1, Math.max(0, Math.round(cy + d))), 0.14]
  ];

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let aSum = 0;
  let wSum = 0;

  for (let i = 0; i < samples.length; i++) {
    const sx = samples[i][0];
    const sy = samples[i][1];
    const w = samples[i][2];
    const idx = (sy * width + sx) * 4;
    rSum += data[idx] * w;
    gSum += data[idx + 1] * w;
    bSum += data[idx + 2] * w;
    aSum += data[idx + 3] * w;
    wSum += w;
  }

  const r = rSum / wSum;
  const g = gSum / wSum;
  const b = bSum / wSum;
  const a = (aSum / wSum) / 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return { r, g, b, a, lum };
}

/**
 * Desenha a forma do ponto alinhada à rotação da grade
 */
function drawHalftoneShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  shape: HalftoneDotShape,
  angleRad: number,
  step: number
) {
  if (size <= 0.1) return;

  ctx.save();
  ctx.translate(cx, cy);
  if (angleRad !== 0) {
    ctx.rotate(angleRad);
  }

  ctx.beginPath();
  switch (shape) {
    case 'diamond':
      ctx.moveTo(0, -size * 1.15);
      ctx.lineTo(size * 1.15, 0);
      ctx.lineTo(0, size * 1.15);
      ctx.lineTo(-size * 1.15, 0);
      ctx.closePath();
      ctx.fill();
      break;

    case 'line': {
      const len = step * 1.45;
      const thickness = size * 1.7;
      ctx.fillRect(-len / 2, -thickness / 2, len, thickness);
      break;
    }

    case 'square':
      ctx.fillRect(-size, -size, size * 2, size * 2);
      break;

    case 'round':
    default:
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

/**
 * Renderiza o efeito halftone calibrado para DTF:
 * - Suporta micro-pontos finos (a partir de 1.5px)
 * - Mantém separação física entre os pontos (não colam e não emplastam no filme DTF)
 * - Fidelidade cromática real aos tons escuros e claros da imagem
 */
export function renderHalftoneCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  settings: HalftoneSettings
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Limpa o canvas
  ctx.clearRect(0, 0, width, height);

  // Preenche fundo se não for transparente
  if (!settings.transparentBg) {
    ctx.fillStyle = settings.colorMode === 'cmyk' ? '#ffffff' : settings.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Canvas temporário para amostragem
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return;

  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  try {
    offCtx.drawImage(image, 0, 0, width, height);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Tamanho da célula base e espaçamento entre centros dos pontos
    // Permite micro-retículas a partir de 1.2px
    const cellSize = Math.max(1.2, settings.dotSize);
    const spacingFactor = Math.max(0.5, Math.min(2.8, settings.dotSpacing ?? 1.25));
    const step = Math.max(1.5, cellSize * spacingFactor);

    // Contraste com curva gama
    const contrastPow = 1 / Math.max(0.2, settings.contrast);

    // RAIO MÁXIMO CALIBRADO PARA DTF:
    // Garante que os pontos mantenham separação física e respiração entre si,
    // evitando formação de blocos sólidos de tinta que quebram o tecido no DTF.
    const isDtfSeparated = settings.dtfSeparationMode !== false;
    const maxRadiusRatio = isDtfSeparated ? 0.90 : 0.96;
    const maxRadius = (step / 2) * maxRadiusRatio;

    // Limiar mínimo de micro-ponto (descarta poeira de pixel para impressão limpa)
    const minThreshold = settings.minDotThreshold ?? 0.02;

    // Configuração de remoção de fundo por cor (Chroma Key)
    const targetBgRgb = hexToRgb(settings.bgTargetColor || '#ffffff');
    const removeBg = !!settings.removeBgColor;
    const bgTol = settings.bgTolerance ?? 20;

    // Coordenadas centrais da tela para rotação limpa
    const cx0 = width / 2;
    const cy0 = height / 2;
    const diag = Math.hypot(width, height);
    const maxRadiusDist = diag / 2 + step * 2;
    const nSteps = Math.ceil(maxRadiusDist / step);

    if (settings.colorMode === 'cmyk') {
      /**
       * PROCESSO CMYK INDUSTRIAL (4 TELAS SEPARADAS COM ÂNGULOS DE ROSETA)
       * Cyan: +15°, Magenta: +75°, Yellow: +0°, Black: +45°
       */
      const channels = [
        { name: 'yellow', color: 'rgba(255, 230, 0, 0.95)', angleOffset: 0 },
        { name: 'cyan', color: 'rgba(0, 168, 232, 0.90)', angleOffset: 15 },
        { name: 'magenta', color: 'rgba(235, 0, 110, 0.90)', angleOffset: 75 },
        { name: 'black', color: 'rgba(22, 22, 26, 0.95)', angleOffset: 45 }
      ];

      ctx.globalCompositeOperation = settings.transparentBg ? 'source-over' : 'multiply';

      for (const ch of channels) {
        ctx.fillStyle = ch.color;
        const screenAngleRad = ((settings.angle + ch.angleOffset) * Math.PI) / 180;
        const cosA = Math.cos(screenAngleRad);
        const sinA = Math.sin(screenAngleRad);

        for (let j = -nSteps; j <= nSteps; j++) {
          const v = j * step;
          for (let i = -nSteps; i <= nSteps; i++) {
            const u = i * step;

            const x = cx0 + (u * cosA - v * sinA);
            const y = cy0 + (u * sinA + v * cosA);

            if (x < -step || x > width + step || y < -step || y > height + step) {
              continue;
            }

            const sample = sampleCellArea(data, width, height, x, y, step / 2);
            if (sample.a < 0.05) continue;

            if (removeBg) {
              const dist = colorDistancePct(sample.r, sample.g, sample.b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
              if (dist <= bgTol) continue;
            }

            const cmyk = rgbToCmyk(sample.r, sample.g, sample.b);
            let channelVal = 0;
            if (ch.name === 'cyan') channelVal = cmyk.c;
            else if (ch.name === 'magenta') channelVal = cmyk.m;
            else if (ch.name === 'yellow') channelVal = cmyk.y;
            else if (ch.name === 'black') channelVal = cmyk.k;

            if (settings.invert) {
              channelVal = 1 - channelVal;
            }

            let density = Math.pow(Math.max(0, Math.min(1, channelVal)), contrastPow) * sample.a;
            if (density < minThreshold) continue;

            const dotRadius = maxRadius * Math.sqrt(density);
            drawHalftoneShape(ctx, x, y, dotRadius, settings.shape, screenAngleRad, step);
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';

    } else if (settings.colorMode === 'original') {
      /**
       * CORES ORIGINAIS COM FIDELIDADE TOTAL PARA DTF TÊXTIL
       * Tons escuros (cabelos, contornos) e tons coloridos saturados
       * produzem pontos de alta definição sem sumir nem sobrepor.
       */
      const screenAngleRad = (settings.angle * Math.PI) / 180;
      const cosA = Math.cos(screenAngleRad);
      const sinA = Math.sin(screenAngleRad);

      const bgRgb = hexToRgb(settings.bgColor || '#ffffff');
      const isBgWhite = bgRgb.r > 200 && bgRgb.g > 200 && bgRgb.b > 200;

      for (let j = -nSteps; j <= nSteps; j++) {
        const v = j * step;
        for (let i = -nSteps; i <= nSteps; i++) {
          const u = i * step;

          const x = cx0 + (u * cosA - v * sinA);
          const y = cy0 + (u * sinA + v * cosA);

          if (x < -step || x > width + step || y < -step || y > height + step) {
            continue;
          }

          const sample = sampleCellArea(data, width, height, x, y, step / 2);
          if (sample.a < 0.05) continue;

          if (removeBg) {
            const dist = colorDistancePct(sample.r, sample.g, sample.b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
            if (dist <= bgTol) continue;
          }

          // Saturação cromática para cores vivas não sumirem
          const maxC = Math.max(sample.r, sample.g, sample.b);
          const minC = Math.min(sample.r, sample.g, sample.b);
          const chroma = (maxC - minC) / 255;

          let toneDensity: number;
          if (isBgWhite && !settings.transparentBg) {
            // Fundo branco tradicional: branco = sem ponto, preto = ponto máximo
            const lumDiff = 1 - sample.lum;
            toneDensity = Math.min(1, lumDiff * 0.8 + chroma * 0.35);
          } else {
            // Modo DTF (fundo transparente):
            // Fidelidade aos detalhes: áreas escuras e cores vivas geram pontos consistentes
            const darkPresence = 1 - sample.lum;
            toneDensity = Math.min(1, Math.max(0.22, darkPresence * 0.72 + chroma * 0.4));
          }

          if (settings.invert) {
            toneDensity = 1 - toneDensity;
          }

          let density = Math.pow(Math.max(0, Math.min(1, toneDensity)), contrastPow) * sample.a;
          if (density < minThreshold) continue;

          // Raio proporcional mantendo separação dos pontos
          const dotRadius = maxRadius * Math.sqrt(density);

          ctx.fillStyle = `rgb(${Math.round(sample.r)}, ${Math.round(sample.g)}, ${Math.round(sample.b)})`;
          drawHalftoneShape(ctx, x, y, dotRadius, settings.shape, screenAngleRad, step);
        }
      }

    } else {
      /**
       * MONOCROMÁTICO (P&B JORNAL OU SILKSCREEN) OU COR PERSONALIZADA
       */
      const screenAngleRad = (settings.angle * Math.PI) / 180;
      const cosA = Math.cos(screenAngleRad);
      const sinA = Math.sin(screenAngleRad);

      ctx.fillStyle = settings.colorMode === 'monochrome' ? '#000000' : settings.dotColor;

      for (let j = -nSteps; j <= nSteps; j++) {
        const v = j * step;
        for (let i = -nSteps; i <= nSteps; i++) {
          const u = i * step;

          const x = cx0 + (u * cosA - v * sinA);
          const y = cy0 + (u * sinA + v * cosA);

          if (x < -step || x > width + step || y < -step || y > height + step) {
            continue;
          }

          const sample = sampleCellArea(data, width, height, x, y, step / 2);
          if (sample.a < 0.05) continue;

          if (removeBg) {
            const dist = colorDistancePct(sample.r, sample.g, sample.b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
            if (dist <= bgTol) continue;
          }

          let tone = 1 - sample.lum;
          if (settings.invert) {
            tone = sample.lum;
          }

          let density = Math.pow(Math.max(0, Math.min(1, tone)), contrastPow) * sample.a;
          if (density < minThreshold) continue;

          const dotRadius = maxRadius * Math.sqrt(density);
          drawHalftoneShape(ctx, x, y, dotRadius, settings.shape, screenAngleRad, step);
        }
      }
    }
  } catch (err) {
    console.warn('Halftone render fallback', err);
    ctx.drawImage(image, 0, 0, width, height);
  }
}

export interface SvgVectorResult {
  svgString: string;
  dotCount: number;
  width: number;
  height: number;
  sizeBytes: number;
  blobUrl: string;
}

export interface SvgVectorOptions {
  width?: number;
  height?: number;
  minDotSize?: number;
  singleColorOverride?: string;
  transparentBg?: boolean;
}

/**
 * Transforma a imagem e o efeito halftone diretamente em VETOR (SVG puro).
 * Cada ponto é um elemento vetorial matemático escalável para impressão em DTF,
 * Illustrator, CorelDRAW, Inkscape e RIPs de impressão têxtil.
 */
export async function generateHalftoneSvg(
  image: HTMLImageElement,
  settings: HalftoneSettings,
  options?: SvgVectorOptions
): Promise<SvgVectorResult> {
  const naturalW = image.naturalWidth || image.width || 1200;
  const naturalH = image.naturalHeight || image.height || 1200;

  const width = options?.width && options.width > 0 ? options.width : Math.min(1200, naturalW);
  const height = options?.height && options.height > 0 ? options.height : Math.round((width * naturalH) / naturalW);

  // Amostragem de dados via canvas temporário
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) throw new Error('Não foi possível inicializar o canvas de leitura');

  offCtx.drawImage(image, 0, 0, width, height);
  const imgData = offCtx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Grade e geometria
  const cellSize = Math.max(1.2, settings.dotSize);
  const spacingFactor = Math.max(0.5, Math.min(2.8, settings.dotSpacing ?? 1.25));
  const step = Math.max(1.5, cellSize * spacingFactor);
  const contrastPow = 1 / Math.max(0.2, settings.contrast);

  const isDtfSeparated = settings.dtfSeparationMode !== false;
  const maxRadiusRatio = isDtfSeparated ? 0.90 : 0.96;
  const maxRadius = (step / 2) * maxRadiusRatio;

  const minThreshold = options?.minDotSize ?? settings.minDotThreshold ?? 0.02;

  const targetBgRgb = hexToRgb(settings.bgTargetColor || '#ffffff');
  const removeBg = !!settings.removeBgColor;
  const bgTol = settings.bgTolerance ?? 20;

  const cx0 = width / 2;
  const cy0 = height / 2;
  const diag = Math.hypot(width, height);
  const maxRadiusDist = diag / 2 + step * 2;
  const nSteps = Math.ceil(maxRadiusDist / step);

  const isTransparent = options?.transparentBg !== undefined ? options.transparentBg : settings.transparentBg;
  const bgFill = settings.colorMode === 'cmyk' ? '#ffffff' : settings.bgColor;

  let dotCount = 0;
  const elements: string[] = [];

  const screenAngleRad = (settings.angle * Math.PI) / 180;
  const cosA = Math.cos(screenAngleRad);
  const sinA = Math.sin(screenAngleRad);
  const angleDeg = settings.angle;

  const bgRgb = hexToRgb(settings.bgColor || '#ffffff');
  const isBgWhite = bgRgb.r > 200 && bgRgb.g > 200 && bgRgb.b > 200;

  // Função auxiliar para gerar marcação vetorial por formato
  const formatSvgShape = (x: number, y: number, r: number, fill: string) => {
    dotCount++;
    const xStr = x.toFixed(1);
    const yStr = y.toFixed(1);
    const rStr = r.toFixed(2);

    switch (settings.shape) {
      case 'square':
        return `<rect x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}" width="${(r * 2).toFixed(1)}" height="${(r * 2).toFixed(1)}" fill="${fill}" />`;
      case 'diamond':
        return `<polygon points="${xStr},${(y - r * 1.15).toFixed(1)} ${(x + r * 1.15).toFixed(1)},${yStr} ${xStr},${(y + r * 1.15).toFixed(1)} ${(x - r * 1.15).toFixed(1)},${yStr}" fill="${fill}" />`;
      case 'line': {
        const len = (step * 1.45).toFixed(1);
        const thick = (r * 1.7).toFixed(1);
        return `<rect x="${(-step * 0.72).toFixed(1)}" y="${(-r * 0.85).toFixed(1)}" width="${len}" height="${thick}" transform="translate(${xStr} ${yStr}) rotate(${angleDeg})" fill="${fill}" />`;
      }
      case 'round':
      default:
        return `<circle cx="${xStr}" cy="${yStr}" r="${rStr}" fill="${fill}" />`;
    }
  };

  if (settings.colorMode === 'cmyk') {
    // CMYK Vetorial com 4 camadas separadas (perfeito para RIP e serigrafia)
    const channels = [
      { name: 'yellow', color: '#ffe600', opacity: '0.95', angleOffset: 0 },
      { name: 'cyan', color: '#00a8e8', opacity: '0.90', angleOffset: 15 },
      { name: 'magenta', color: '#eb006e', opacity: '0.90', angleOffset: 75 },
      { name: 'black', color: '#16161a', opacity: '0.95', angleOffset: 45 }
    ];

    for (const ch of channels) {
      const chElements: string[] = [];
      const chAngleRad = ((settings.angle + ch.angleOffset) * Math.PI) / 180;
      const chCos = Math.cos(chAngleRad);
      const chSin = Math.sin(chAngleRad);

      for (let j = -nSteps; j <= nSteps; j++) {
        const v = j * step;
        for (let i = -nSteps; i <= nSteps; i++) {
          const u = i * step;
          const x = cx0 + (u * chCos - v * chSin);
          const y = cy0 + (u * chSin + v * chCos);

          if (x < -step || x > width + step || y < -step || y > height + step) continue;

          const sample = sampleCellArea(data, width, height, x, y, step / 2);
          if (sample.a < 0.05) continue;

          if (removeBg) {
            const dist = colorDistancePct(sample.r, sample.g, sample.b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
            if (dist <= bgTol) continue;
          }

          const cmyk = rgbToCmyk(sample.r, sample.g, sample.b);
          let val = 0;
          if (ch.name === 'cyan') val = cmyk.c;
          else if (ch.name === 'magenta') val = cmyk.m;
          else if (ch.name === 'yellow') val = cmyk.y;
          else if (ch.name === 'black') val = cmyk.k;

          if (settings.invert) val = 1 - val;
          let density = Math.pow(Math.max(0, Math.min(1, val)), contrastPow) * sample.a;
          if (density < minThreshold) continue;

          const dotRadius = maxRadius * Math.sqrt(density);
          chElements.push(formatSvgShape(x, y, dotRadius, ch.color));
        }
      }

      elements.push(
        `<g id="layer_${ch.name}" fill="${ch.color}" opacity="${ch.opacity}" style="mix-blend-mode: multiply">\n${chElements.join('\n')}\n</g>`
      );
    }
  } else if (settings.colorMode === 'original') {
    // Cores originais: cada ponto com a sua cor RGB vetorial
    for (let j = -nSteps; j <= nSteps; j++) {
      const v = j * step;
      for (let i = -nSteps; i <= nSteps; i++) {
        const u = i * step;
        const x = cx0 + (u * cosA - v * sinA);
        const y = cy0 + (u * sinA + v * cosA);

        if (x < -step || x > width + step || y < -step || y > height + step) continue;

        const sample = sampleCellArea(data, width, height, x, y, step / 2);
        if (sample.a < 0.05) continue;

        if (removeBg) {
          const dist = colorDistancePct(sample.r, sample.g, sample.b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
          if (dist <= bgTol) continue;
        }

        const maxC = Math.max(sample.r, sample.g, sample.b);
        const minC = Math.min(sample.r, sample.g, sample.b);
        const chroma = (maxC - minC) / 255;

        let toneDensity: number;
        if (isBgWhite && !isTransparent) {
          const lumDiff = 1 - sample.lum;
          toneDensity = Math.min(1, lumDiff * 0.8 + chroma * 0.35);
        } else {
          const darkPresence = 1 - sample.lum;
          toneDensity = Math.min(1, Math.max(0.22, darkPresence * 0.72 + chroma * 0.4));
        }

        if (settings.invert) toneDensity = 1 - toneDensity;
        let density = Math.pow(Math.max(0, Math.min(1, toneDensity)), contrastPow) * sample.a;
        if (density < minThreshold) continue;

        const dotRadius = maxRadius * Math.sqrt(density);
        const color = options?.singleColorOverride || `rgb(${Math.round(sample.r)},${Math.round(sample.g)},${Math.round(sample.b)})`;
        elements.push(formatSvgShape(x, y, dotRadius, color));
      }
    }
  } else {
    // Monocromático ou Duotone
    const monoColor = options?.singleColorOverride || (settings.colorMode === 'monochrome' ? '#000000' : settings.dotColor);
    const monoElements: string[] = [];

    for (let j = -nSteps; j <= nSteps; j++) {
      const v = j * step;
      for (let i = -nSteps; i <= nSteps; i++) {
        const u = i * step;
        const x = cx0 + (u * cosA - v * sinA);
        const y = cy0 + (u * sinA + v * cosA);

        if (x < -step || x > width + step || y < -step || y > height + step) continue;

        const sample = sampleCellArea(data, width, height, x, y, step / 2);
        if (sample.a < 0.05) continue;

        if (removeBg) {
          const dist = colorDistancePct(sample.r, sample.g, sample.b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
          if (dist <= bgTol) continue;
        }

        let tone = 1 - sample.lum;
        if (settings.invert) tone = sample.lum;
        let density = Math.pow(Math.max(0, Math.min(1, tone)), contrastPow) * sample.a;
        if (density < minThreshold) continue;

        const dotRadius = maxRadius * Math.sqrt(density);
        monoElements.push(formatSvgShape(x, y, dotRadius, monoColor));
      }
    }

    elements.push(`<g id="halftone_dots" fill="${monoColor}">\n${monoElements.join('\n')}\n</g>`);
  }

  const bgRect = !isTransparent ? `  <rect width="100%" height="100%" fill="${bgFill}" />\n` : '';

  const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Gerado pelo Halftone Studio - Otimizado para DTF e Vetor Gráfico -->
${bgRect}  ${elements.join('\n  ')}
</svg>`;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  return {
    svgString,
    dotCount,
    width,
    height,
    sizeBytes: blob.size,
    blobUrl
  };
}

/**
 * Gera a imagem final em alta fidelidade e resolução.
 * Mantém 100% da proporção, densidade e aparência aprovada pelo usuário no preview.
 */
export function exportHalftoneImage(
  image: HTMLImageElement,
  settings: HalftoneSettings,
  previewWidth?: number,
  previewHeight?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const naturalW = image.naturalWidth || image.width || 1200;
      const naturalH = image.naturalHeight || image.height || 1200;

      // Dimensões de referência do preview que o usuário estava vendo na tela
      const baseW = previewWidth && previewWidth > 0 ? previewWidth : Math.min(1200, naturalW);
      const baseH = previewHeight && previewHeight > 0 ? previewHeight : Math.round((baseW * naturalH) / naturalW);

      const factor = settings.upscaleFactor || 1;

      // Calcula as dimensões alvo
      let targetW = Math.round(baseW * factor);
      let targetH = Math.round(baseH * factor);

      const maxDim = 4096;
      if (targetW > maxDim || targetH > maxDim) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDim) / targetW);
          targetW = maxDim;
        } else {
          targetW = Math.round((targetW * maxDim) / targetH);
          targetH = maxDim;
        }
      }

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;

      // Escala exata a partir do preview visual da tela:
      // O número de pontos se mantém IDÊNTICO ao preview, com mais pixels por ponto!
      const scaleRatio = targetW / baseW;
      const scaledDotSize = Math.max(1.2, settings.dotSize * scaleRatio);

      const exportSettings: HalftoneSettings = {
        ...settings,
        dotSize: scaledDotSize
      };

      renderHalftoneCanvas(exportCanvas, image, exportSettings);

      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(exportCanvas.toDataURL('image/png'));
          }
        },
        'image/png'
      );
    } catch (err) {
      reject(err);
    }
  });
}
