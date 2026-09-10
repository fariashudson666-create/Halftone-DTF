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
  // Distância Euclidiana normalizada 0..100% (distância máxima é sqrt(3 * 255^2) ≈ 441.67)
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

  // Habilita interpolação de alta qualidade para amostragem dos pixels
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  try {
    offCtx.drawImage(image, 0, 0, width, height);
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const cellSize = Math.max(3, settings.dotSize);
    const spacingFactor = Math.max(0.35, Math.min(2.0, settings.dotSpacing ?? 0.9));
    const step = Math.max(2, Math.round(cellSize * spacingFactor));
    const angleRad = (settings.angle * Math.PI) / 180;
    const contrastPow = 1 / Math.max(0.2, settings.contrast);

    // Configuração de remoção de fundo por cor
    const targetBgRgb = hexToRgb(settings.bgTargetColor || '#ffffff');
    const removeBg = !!settings.removeBgColor;
    const bgTol = settings.bgTolerance ?? 20;

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

        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const sx = Math.min(width - 1, Math.max(0, Math.floor(x + step / 2)));
            const sy = Math.min(height - 1, Math.max(0, Math.floor(y + step / 2)));
            const idx = (sy * width + sx) * 4;

            const alpha = data[idx + 3] / 255;
            if (alpha < 0.05) continue;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Verifica remoção de fundo por cor selecionada
            if (removeBg) {
              const dist = colorDistancePct(r, g, b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
              if (dist <= bgTol) continue;
            }

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
                x + step / 2,
                y + step / 2,
                dotRadius,
                settings.shape,
                chAngleRad
              );
            }
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';

    } else if (settings.colorMode === 'original') {
      // Modo de Cores Originais: cada ponto adquire a cor original da imagem naquele ponto!
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const sx = Math.min(width - 1, Math.max(0, Math.floor(x + step / 2)));
          const sy = Math.min(height - 1, Math.max(0, Math.floor(y + step / 2)));
          const idx = (sy * width + sx) * 4;

          const alpha = data[idx + 3] / 255;
          if (alpha < 0.05) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Verifica remoção de fundo por cor selecionada
          if (removeBg) {
            const dist = colorDistancePct(r, g, b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
            if (dist <= bgTol) continue;
          }

          // Luminosidade para definir a densidade do ponto
          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          lum = Math.pow(lum, contrastPow);

          let density = settings.invert ? lum : 1 - lum;
          density = Math.max(0, Math.min(1, density * alpha));

          const maxRadius = (cellSize / 2) * 1.4;
          const dotRadius = maxRadius * density;

          if (dotRadius > 0.3) {
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            drawShape(
              ctx,
              x + step / 2,
              y + step / 2,
              dotRadius,
              settings.shape,
              angleRad
            );
          }
        }
      }

    } else {
      // Monochrome ou Custom Duotone Halftone
      ctx.fillStyle = settings.dotColor;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const sx = Math.min(width - 1, Math.max(0, Math.floor(x + step / 2)));
          const sy = Math.min(height - 1, Math.max(0, Math.floor(y + step / 2)));
          const idx = (sy * width + sx) * 4;

          const alpha = data[idx + 3] / 255;
          if (alpha < 0.05) continue;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Verifica remoção de fundo por cor selecionada
          if (removeBg) {
            const dist = colorDistancePct(r, g, b, targetBgRgb.r, targetBgRgb.g, targetBgRgb.b);
            if (dist <= bgTol) continue;
          }

          // Luminosidade perceptiva
          let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // Aplica contraste
          lum = Math.pow(lum, contrastPow);

          // Densidade do ponto
          let density = settings.invert ? lum : 1 - lum;
          density = Math.max(0, Math.min(1, density * alpha));

          const maxRadius = (cellSize / 2) * 1.4;
          const dotRadius = maxRadius * density;

          if (dotRadius > 0.3) {
            drawShape(
              ctx,
              x + step / 2,
              y + step / 2,
              dotRadius,
              settings.shape,
              angleRad
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn('Halftone preview fallback', err);
    ctx.drawImage(image, 0, 0, width, height);
  }
}

/**
 * Gera a imagem final em alta fidelidade e resolução
 * Mantém 100% da proporção, densidade e aparência aprovada pelo usuário no preview
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

      // Limite seguro de textura canvas no navegador para evitar overflow de memória / crash
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
      // Se targetW == baseW (1x), scaleRatio = 1.0 e dotSize é exatamente igual ao da tela!
      // Se targetW > baseW (2x, 4x), o número de pontos se mantém IDENTICAL ao preview, com mais pixels por ponto!
      const scaleRatio = targetW / baseW;
      const scaledDotSize = Math.max(1.5, settings.dotSize * scaleRatio);

      const exportSettings: HalftoneSettings = {
        ...settings,
        dotSize: scaledDotSize
      };

      renderHalftoneCanvas(exportCanvas, image, exportSettings);

      // Exporta via Blob para evitar corrupção de string base64 / limites de memória do navegador
      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            // Fallback
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

