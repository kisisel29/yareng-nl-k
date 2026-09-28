export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 1600;
export const IMAGE_QUALITY = 0.82;

/** Sima / şiir / köşe yazarı portreleri — sabit 4:5 çerçeve */
export const PORTRAIT_FRAME_WIDTH = 900;
export const PORTRAIT_FRAME_HEIGHT = 1125;

export type OptimizeImageOptions = {
  maxWidth?: number;
  /** portrait = tüm yüklemeleri aynı 4:5 ölçüye getirir */
  frame?: 'portrait' | 'none';
};

export function isAllowedImage(file: File): boolean {
  const typeOk = ALLOWED_IMAGE_TYPES.includes(file.type);
  const extOk = /\.(jpe?g|png|webp)$/i.test(file.name);
  return typeOk || extOk;
}

function prefersAlpha(file: File): boolean {
  return file.type.includes('png') || file.type.includes('webp') || /\.(png|webp)$/i.test(file.name);
}

function canvasHasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

/** Kenar örnekleri çoğunlukla beyazsa kesilmiş vesikalık sayılır. */
export function likelyWhiteBackground(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const points: Array<[number, number]> = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
    [Math.floor(width / 2), 2],
    [Math.floor(width / 2), height - 3],
    [2, Math.floor(height / 2)],
    [width - 3, Math.floor(height / 2)],
  ];
  let white = 0;
  for (const [x, y] of points) {
    const px = Math.max(0, Math.min(width - 1, x));
    const py = Math.max(0, Math.min(height - 1, y));
    const p = ctx.getImageData(px, py, 1, 1).data;
    const avg = (p[0] + p[1] + p[2]) / 3;
    const spread = Math.max(p[0], p[1], p[2]) - Math.min(p[0], p[1], p[2]);
    if (avg >= 238 && spread <= 22 && p[3] > 200) white += 1;
  }
  return white >= 5;
}

/** Yakın beyaz pikselleri şeffafa çevir (yumuşak kenar). */
export function removeNearWhiteBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold = 242,
  softness = 28
): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;
    const avg = (r + g + b) / 3;
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (spread > 28) continue;
    if (avg >= threshold) {
      data[i + 3] = 0;
    } else if (avg >= threshold - softness) {
      const t = (threshold - avg) / softness;
      data[i + 3] = Math.round(a * t);
    }
  }
  ctx.putImageData(image, 0, 0);
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  type: 'image/jpeg' | 'image/webp' | 'image/png',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error('Görsel sıkıştırılamadı.'));
      },
      type,
      quality
    );
  });
}

async function encodeTransparent(canvas: HTMLCanvasElement): Promise<{ blob: Blob; ext: string; contentType: string }> {
  try {
    const webp = await encodeCanvas(canvas, 'image/webp', IMAGE_QUALITY);
    if (webp.size > 0) return { blob: webp, ext: 'webp', contentType: 'image/webp' };
  } catch {
    /* fallback png */
  }
  const png = await encodeCanvas(canvas, 'image/png');
  return { blob: png, ext: 'png', contentType: 'image/png' };
}

/**
 * Kaynağı sabit 4:5 çerçeveye yerleştirir.
 * Şeffaf / kesilmiş görseller: sığdır + alta hizala.
 * Opak fotoğraflar: çerçeveyi dolduracak şekilde kırp.
 */
function drawIntoPortraitFrame(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  mode: 'contain' | 'cover'
): HTMLCanvasElement {
  const outW = PORTRAIT_FRAME_WIDTH;
  const outH = PORTRAIT_FRAME_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, outW, outH);

  if (mode === 'cover') {
    const scale = Math.max(outW / srcW, outH / srcH);
    const dw = Math.round(srcW * scale);
    const dh = Math.round(srcH * scale);
    const dx = Math.round((outW - dw) / 2);
    const dy = Math.round((outH - dh) / 2);
    ctx.drawImage(source, 0, 0, srcW, srcH, dx, dy, dw, dh);
  } else {
    const scale = Math.min(outW / srcW, outH / srcH);
    const dw = Math.round(srcW * scale);
    const dh = Math.round(srcH * scale);
    const dx = Math.round((outW - dw) / 2);
    const dy = outH - dh;
    ctx.drawImage(source, 0, 0, srcW, srcH, dx, dy, dw, dh);
  }
  return canvas;
}

function resolveOptions(maxWidthOrOptions?: number | OptimizeImageOptions): OptimizeImageOptions {
  if (typeof maxWidthOrOptions === 'number') return { maxWidth: maxWidthOrOptions, frame: 'none' };
  return {
    maxWidth: maxWidthOrOptions?.maxWidth ?? MAX_IMAGE_WIDTH,
    frame: maxWidthOrOptions?.frame ?? 'none',
  };
}

export async function optimizeImage(
  file: File,
  maxWidthOrOptions: number | OptimizeImageOptions = MAX_IMAGE_WIDTH
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  if (!isAllowedImage(file)) {
    throw new Error('Yalnızca JPG, JPEG, PNG veya WEBP yükleyebilirsiniz.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Dosya boyutu 5 MB sınırını aşıyor.');
  }

  const options = resolveOptions(maxWidthOrOptions);
  const maxWidth = options.maxWidth ?? MAX_IMAGE_WIDTH;
  const usePortrait = options.frame === 'portrait';

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const work = document.createElement('canvas');
    work.width = width;
    work.height = height;
    const workCtx = work.getContext('2d', { alpha: true });
    if (!workCtx) {
      bitmap.close();
      return { blob: file, ext: extensionOf(file), contentType: file.type || 'image/jpeg' };
    }
    workCtx.clearRect(0, 0, width, height);
    workCtx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const hadAlpha = prefersAlpha(file) || canvasHasTransparency(workCtx, width, height);
    const whiteBg = likelyWhiteBackground(workCtx, width, height);
    if (whiteBg) removeNearWhiteBackground(workCtx, width, height);
    const transparent = hadAlpha || whiteBg || canvasHasTransparency(workCtx, width, height);

    if (usePortrait) {
      const framed = drawIntoPortraitFrame(work, width, height, transparent ? 'contain' : 'cover');
      if (transparent) return encodeTransparent(framed);
      const jpeg = await encodeCanvas(framed, 'image/jpeg', IMAGE_QUALITY);
      return { blob: jpeg, ext: 'jpg', contentType: 'image/jpeg' };
    }

    if (transparent) return encodeTransparent(work);

    const jpeg = await encodeCanvas(work, 'image/jpeg', IMAGE_QUALITY);
    return { blob: jpeg, ext: 'jpg', contentType: 'image/jpeg' };
  } catch {
    return { blob: file, ext: extensionOf(file), contentType: file.type || 'image/jpeg' };
  }
}

/** Uzak portreyi indirir: beyaz zemini temizler ve sabit 4:5 ölçüye alır. */
export async function normalizePortraitRemoteImage(
  url: string
): Promise<{ blob: Blob; ext: string; contentType: string } | null> {
  const img = await loadCrossOriginImage(url);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  if (!srcW || !srcH) return null;

  const work = document.createElement('canvas');
  work.width = srcW;
  work.height = srcH;
  const workCtx = work.getContext('2d', { alpha: true });
  if (!workCtx) return null;

  workCtx.clearRect(0, 0, srcW, srcH);
  workCtx.drawImage(img, 0, 0);

  const alreadyAlpha = canvasHasTransparency(workCtx, srcW, srcH);
  const whiteBg = likelyWhiteBackground(workCtx, srcW, srcH);
  if (whiteBg) removeNearWhiteBackground(workCtx, srcW, srcH);
  const transparent = alreadyAlpha || whiteBg || canvasHasTransparency(workCtx, srcW, srcH);

  const framed = drawIntoPortraitFrame(work, srcW, srcH, transparent ? 'contain' : 'cover');
  if (transparent) return encodeTransparent(framed);
  const jpeg = await encodeCanvas(framed, 'image/jpeg', IMAGE_QUALITY);
  return { blob: jpeg, ext: 'jpg', contentType: 'image/jpeg' };
}

/** @deprecated normalizePortraitRemoteImage kullanın */
export async function transparentizeRemoteImage(
  url: string,
  _maxWidth = MAX_IMAGE_WIDTH
): Promise<{ blob: Blob; ext: string; contentType: string } | null> {
  return normalizePortraitRemoteImage(url);
}

function loadCrossOriginImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
    const sep = url.includes('?') ? '&' : '?';
    img.src = `${url}${sep}cb=${Date.now()}`;
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Fotoğraf okunamadı.'));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToFile(dataUrl: string, filename = 'vesikalik.jpg'): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName === 'jpeg') return 'jpg';
  if (fromName === 'jpg' || fromName === 'png' || fromName === 'webp') return fromName;
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpg';
}
