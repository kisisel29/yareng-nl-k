export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 1600;
export const IMAGE_QUALITY = 0.82;

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

export async function optimizeImage(
  file: File,
  maxWidth = MAX_IMAGE_WIDTH
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  if (!isAllowedImage(file)) {
    throw new Error('Yalnızca JPG, JPEG, PNG veya WEBP yükleyebilirsiniz.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Dosya boyutu 5 MB sınırını aşıyor.');
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      bitmap.close();
      return { blob: file, ext: extensionOf(file), contentType: file.type || 'image/jpeg' };
    }
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const hadAlpha = prefersAlpha(file) || canvasHasTransparency(ctx, width, height);
    const whiteBg = likelyWhiteBackground(ctx, width, height);
    if (whiteBg) removeNearWhiteBackground(ctx, width, height);

    if (hadAlpha || whiteBg || canvasHasTransparency(ctx, width, height)) {
      return encodeTransparent(canvas);
    }

    const jpeg = await encodeCanvas(canvas, 'image/jpeg', IMAGE_QUALITY);
    return { blob: jpeg, ext: 'jpg', contentType: 'image/jpeg' };
  } catch {
    return { blob: file, ext: extensionOf(file), contentType: file.type || 'image/jpeg' };
  }
}

/** Uzak görseli indirip beyaz zemini şeffafa çevirir. Değişiklik yoksa null döner. */
export async function transparentizeRemoteImage(
  url: string,
  maxWidth = MAX_IMAGE_WIDTH
): Promise<{ blob: Blob; ext: string; contentType: string } | null> {
  const img = await loadCrossOriginImage(url);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const alreadyAlpha = canvasHasTransparency(ctx, width, height);
  const whiteBg = likelyWhiteBackground(ctx, width, height);
  if (!whiteBg && alreadyAlpha) return null;
  if (!whiteBg) return null;

  removeNearWhiteBackground(ctx, width, height);
  return encodeTransparent(canvas);
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
