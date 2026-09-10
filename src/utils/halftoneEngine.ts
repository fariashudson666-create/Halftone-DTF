import { HalftoneSettings, HalftoneDotShape } from '../types';

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

function drawShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  shape: HalftoneDotShape,
  angleRad: number
) {
  if (size <= 0.2) return;

  ctx.save();
  ctx.translate(cx, cy);
  if (angleRad !== 0) {
    ctx.rotate(angleRad);
  }

  ctx.beginPath();
  switch (shape) {
    case 'diamond':
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case 'line':
      ctx.fillRect(-size * 1.8, -size * 0.45, size * 3.6, size * 0.9);
      break;
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
 * Renderiza o efeito halftone diretamente em um canvas HTML
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

  // Canvas temporário para leitura dos dados de pixels
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return;

  try {
    offCtx.drawImage(image, 0, 0, width, height);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const cellSize = Math.max(3, settings.dotSize);
    const angleRad = (settings.angle * Math.PI) / 180;
    const contrastPow = 1 / Math.max(0.2, settings.contrast);

    if (settings.colorMode === 'cmyk') {
      // CMYK Multi-Angle Halftone Screening
      const channels = [
        { name: 'cyan', color: 'rgba(0, 185, 235, 0.85)', angle: 15 },
        { name: 'magenta', color: 'rgba(235, 30, 115, 0.85)', angle: 75 },
        { name: 'yellow', color: 'rgba(255, 220, 0, 0.9)', angle: 0 },
        { name: 'black', color: 'rgba(20, 20, 25, 0.95)', angle: 45 }
      ];

      ctx.globalCompositeOperation = settings.transparentBg ? 'source-over' : 'multiply';

      for (const ch of channels) {
        ctx.fillStyle = ch.color;
        const chAngleRad = ((settings.angle + ch.angle) * Math.PI) / 180;

        for (let y = 0; y < height; y += cellSize) {
          for (let x = 0; x < width; x += cellSize) {
            const sx = Math.min(width - 1, x + Math.floor(cellSize / 2));
            const sy = Math.min(height - 1, y + Math.floor(cellSize / 2));
            const idx = (sy * width + sx) * 4;

            const alpha = data[idx + 3] / 255;
            if (alpha < 0.05) continue;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const cmyk = rgbToCmyk(r, g, b);
            let density = 0;
            if (ch.name === 'cyan') density = cmyk.c;
            else if (ch.name === 'magenta') density = cmyk.m;
            else if (ch.name === 'yellow') density = cmyk.y;
            else if (ch.name === 'black') density = cmyk.k;

            density = Math.pow(density, contrastPow) * alpha;
            if (settings.invert) {
              density = Math.max(0, 1 - density);
            }

            const maxRadius = (cellSize / 2) * 1.35;
            const dotRadius = maxRadius * Math.min(1, density);

            if (dotRadius > 0.3) {
              drawShape(
                ctx,
                x + cellSize / 2,
                y + cellSize / 2,
                dotRadius,
                settings.shape,
                chAngleRad
              );
            }
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';

    } else {
      // Monochrome ou Custom Duotone Halftone
      ctx.fillStyle = settings.dotColor;

      for (let y = 0; y < height; y += cellSize) {
        for (let x = 0; x < width; x += cellSize) {
          const sx = Math.min(width - 1, x + Math.floor(cellSize / 2));
          const sy = Math.min(height - 1, y + Math.floor(cellSize / 2));
          const idx = (sy * width + sx) * 4;

          const alpha = data[idx + 3] / 255;
          if (alpha < 0.05) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Luminosidade perceptiva
          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Aplica contraste
          lum = Math.pow(lum, contrastPow);

          // Densidade do ponto (pontos escuros por padrão)
          let density = settings.invert ? lum : 1 - lum;
          density = Math.max(0, Math.min(1, density * alpha));

          const maxRadius = (cellSize / 2) * 1.4;
          const dotRadius = maxRadius * density;

          if (dotRadius > 0.3) {
            drawShape(
              ctx,
              x + cellSize / 2,
              y + cellSize / 2,
              dotRadius,
              settings.shape,
              angleRad
            );
          }
        }
      }
    }
  } catch (err) {
    // Fallback se CORS bloquear getImageData direto
    console.warn('Halftone preview fallback', err);
    ctx.drawImage(image, 0, 0, width, height);
  }
}

/**
 * Gera a imagem final na resolução original do arquivo para download perfeito
 */
export function exportHalftoneImage(
  image: HTMLImageElement,
  settings: HalftoneSettings
): Promise<string> {
  return new Promise((resolve) => {
    // Usa as dimensões naturais da imagem original (ou até 3000px para não estourar memória)
    const naturalW = image.naturalWidth || image.width || 1200;
    const naturalH = image.naturalHeight || image.height || 1200;

    const maxDim = 3200;
    let targetW = naturalW;
    let targetH = naturalH;

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

    // Ajusta o tamanho da célula proporcionalmente à escala da imagem
    const scaleRatio = targetW / 800;
    const scaledDotSize = Math.max(3, Math.round(settings.dotSize * scaleRatio));

    const exportSettings: HalftoneSettings = {
      ...settings,
      dotSize: scaledDotSize
    };

    renderHalftoneCanvas(exportCanvas, image, exportSettings);
    resolve(exportCanvas.toDataURL('image/png'));
  });
}
