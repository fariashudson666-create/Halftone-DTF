import { DotShape, UnderbaseMode } from '../types';

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  dotShape: DotShape;
  lpi: number; // 30 - 90
  underbaseMode: UnderbaseMode;
  underbaseChoke: number; // e.g. -2 px
  minimumDotCutoff: number; // e.g. 4%
  viewMode: 'composite' | 'white-underbase' | 'split-cmyk' | 'original';
  garmentColor: 'black' | 'white' | 'charcoal' | 'navy';
  activeChannels: {
    white: boolean;
    cyan: boolean;
    magenta: boolean;
    yellow: boolean;
    black: boolean;
  };
  dotGainComp: number;
}

export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k >= 0.999) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return { c, m, y, k };
}

export function getGarmentHex(color: 'black' | 'white' | 'charcoal' | 'navy'): string {
  switch (color) {
    case 'black': return '#141416';
    case 'white': return '#e8e8ed';
    case 'charcoal': return '#2a2b30';
    case 'navy': return '#121d33';
  }
}

/**
 * High performance raster RIP simulation engine
 */
export function renderHalftone(opts: RenderOptions) {
  const {
    canvas,
    image,
    dotShape,
    lpi,
    underbaseChoke,
    minimumDotCutoff,
    viewMode,
    garmentColor,
    activeChannels,
    dotGainComp
  } = opts;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // If original view, just draw the image scaled
  if (viewMode === 'original') {
    ctx.fillStyle = getGarmentHex(garmentColor);
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    return;
  }

  // Draw background garment or PET film
  if (viewMode === 'white-underbase') {
    // Dark drafting plate for white underbase inspection
    ctx.fillStyle = '#101114';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = getGarmentHex(garmentColor);
    ctx.fillRect(0, 0, width, height);
  }

  // Create an offscreen canvas to sample image pixels
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return;

  try {
    offCtx.drawImage(image, 0, 0, width, height);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Dot cell pitch calculation based on LPI
    // Higher LPI = smaller dot pitch (e.g. 55 LPI ≈ 6px cell at canvas scale)
    const baseCell = Math.max(3, Math.round((90 - lpi) / 8) + 4);

    const gainFactor = 1 + (dotGainComp / 100);
    const cutoffRatio = minimumDotCutoff / 100;
    const chokeAbs = Math.abs(underbaseChoke);

    if (viewMode === 'white-underbase') {
      // Render White Underbase Channel with Choke boundary
      ctx.fillStyle = '#ffffff';
      for (let y = 0; y < height; y += baseCell) {
        for (let x = 0; x < width; x += baseCell) {
          // Check choke border inset
          const sampleX = Math.min(width - 1, x + Math.floor(baseCell / 2));
          const sampleY = Math.min(height - 1, y + Math.floor(baseCell / 2));
          const idx = (sampleY * width + sampleX) * 4;
          const a = data[idx + 3] / 255;

          if (a <= 0.05) continue;

          // Compute brightness/density
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const underbaseDensity = Math.min(1, Math.max(0, (1 - lum * 0.4) * a * gainFactor));

          if (underbaseDensity < cutoffRatio) continue;

          // Apply choke inset factor
          const chokeReduction = chokeAbs * 0.15;
          const radius = Math.max(0, (baseCell / 2) * (underbaseDensity - chokeReduction));

          if (radius <= 0.2) continue;

          ctx.beginPath();
          if (dotShape === 'euclidean') {
            ctx.save();
            ctx.translate(x + baseCell / 2, y + baseCell / 2);
            ctx.rotate((22.5 * Math.PI) / 180);
            ctx.rect(-radius, -radius, radius * 2, radius * 2);
            ctx.fill();
            ctx.restore();
          } else if (dotShape === 'line') {
            ctx.fillRect(x, y + (baseCell / 2 - radius / 2), baseCell, radius);
          } else {
            ctx.arc(x + baseCell / 2, y + baseCell / 2, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      return;
    }

    // Composite Halftone or Split CMYK
    // Pass 1: White Underbase Layer (if active)
    if (activeChannels.white) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      for (let y = 0; y < height; y += baseCell) {
        for (let x = 0; x < width; x += baseCell) {
          const sampleX = Math.min(width - 1, x + Math.floor(baseCell / 2));
          const sampleY = Math.min(height - 1, y + Math.floor(baseCell / 2));
          const idx = (sampleY * width + sampleX) * 4;
          const a = data[idx + 3] / 255;
          if (a <= 0.08) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const density = Math.min(1, (1 - lum * 0.3) * a);
          if (density < cutoffRatio) continue;

          const radius = Math.max(0, (baseCell / 2) * (density - chokeAbs * 0.12));
          if (radius <= 0.2) continue;

          ctx.beginPath();
          ctx.arc(x + baseCell / 2, y + baseCell / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Pass 2: Color Halftone dots (CMYK)
    for (let y = 0; y < height; y += baseCell) {
      for (let x = 0; x < width; x += baseCell) {
        const sampleX = Math.min(width - 1, x + Math.floor(baseCell / 2));
        const sampleY = Math.min(height - 1, y + Math.floor(baseCell / 2));
        const idx = (sampleY * width + sampleX) * 4;
        const a = data[idx + 3] / 255;
        if (a <= 0.05) continue;

        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const { c, m, y: yel, k } = rgbToCmyk(r, g, b);

        const cx = x + baseCell / 2;
        const cy = y + baseCell / 2;

        // Draw active color channels
        if (activeChannels.cyan && c > 0.08) {
          ctx.fillStyle = 'rgba(0, 220, 245, 0.82)';
          drawDot(ctx, cx - 1, cy - 1, (baseCell / 2) * c * gainFactor, dotShape, 15);
        }
        if (activeChannels.magenta && m > 0.08) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.82)';
          drawDot(ctx, cx + 1, cy - 1, (baseCell / 2) * m * gainFactor, dotShape, 75);
        }
        if (activeChannels.yellow && yel > 0.08) {
          ctx.fillStyle = 'rgba(250, 204, 21, 0.82)';
          drawDot(ctx, cx, cy + 1, (baseCell / 2) * yel * gainFactor, dotShape, 0);
        }
        if (activeChannels.black && k > 0.1) {
          ctx.fillStyle = 'rgba(15, 15, 18, 0.95)';
          drawDot(ctx, cx, cy, (baseCell / 2) * k * gainFactor, dotShape, 45);
        }
      }
    }
  } catch {
    // Fallback if cross-origin image blocks getImageData: render styled CSS halftone overlay
    ctx.drawImage(image, 0, 0, width, height);
  }
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  shape: DotShape,
  angleDeg: number
) {
  if (radius <= 0.3) return;
  const maxR = Math.min(radius, 6);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.beginPath();
  if (shape === 'euclidean') {
    ctx.rect(-maxR, -maxR, maxR * 2, maxR * 2);
    ctx.fill();
  } else if (shape === 'line') {
    ctx.fillRect(-maxR * 1.8, -maxR * 0.6, maxR * 3.6, maxR * 1.2);
  } else if (shape === 'stochastic') {
    const jitterX = (Math.sin(x * 12.9898 + y * 78.233) * 2);
    const jitterY = (Math.cos(x * 12.9898 + y * 78.233) * 2);
    ctx.arc(jitterX, jitterY, maxR * 0.85, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Round
    ctx.arc(0, 0, maxR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
