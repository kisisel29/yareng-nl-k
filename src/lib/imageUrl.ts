/**
 * Supabase Storage görsellerini gösterileceği boyuta göre indirir.
 *
 * Tam boy (örn. 900×1125 portre) her liste/kart görünümünde indirilmez;
 * Supabase'in boyutlandırma adresi (/render/image/) üzerinden ekrandaki
 * boyuta uygun sürüm istenir. Kalite 85 + WebP, gösterilen boyutta
 * gözle fark edilmeyecek kayıpla genelde %60-85 daha az veri demektir.
 * Dönüştürülemeyen adresler (yerel dosyalar, harici URL'ler, GIF)
 * olduğu gibi döner.
 */
const OBJECT_PUBLIC = '/storage/v1/object/public/';
const RENDER_PUBLIC = '/storage/v1/render/image/public/';
const DEFAULT_QUALITY = 85;

export function isSupabaseStorageUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.includes(OBJECT_PUBLIC));
}

export type OptimizedImageOptions = {
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
};

export function optimizedImageUrl(
  url: string | null | undefined,
  width: number,
  options: OptimizedImageOptions = {}
): string {
  if (!url) return '';
  if (!isSupabaseStorageUrl(url)) return url;
  if (/\.gif(\?|$)/i.test(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname.replace(OBJECT_PUBLIC, RENDER_PUBLIC);
    parsed.searchParams.set('width', String(Math.max(16, Math.round(width))));
    if (options.height) parsed.searchParams.set('height', String(Math.max(16, Math.round(options.height))));
    if (options.resize) parsed.searchParams.set('resize', options.resize);
    parsed.searchParams.set('quality', String(options.quality ?? DEFAULT_QUALITY));
    parsed.searchParams.set('format', 'webp');
    return parsed.toString();
  } catch {
    return url;
  }
}

export function imageSrcSet(
  url: string | null | undefined,
  widths: number[],
  options: OptimizedImageOptions = {}
): string | undefined {
  if (!url || !isSupabaseStorageUrl(url)) return undefined;
  const unique = [...new Set(widths.map((w) => Math.max(16, Math.round(w))))].sort((a, b) => a - b);
  if (unique.length === 0) return undefined;
  return unique.map((w) => `${optimizedImageUrl(url, w, options)} ${w}w`).join(', ');
}
