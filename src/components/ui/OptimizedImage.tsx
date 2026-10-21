import { useEffect, useState } from 'react';
import { imageSrcSet, isSupabaseStorageUrl, optimizedImageUrl } from '../../lib/imageUrl';
import { cn } from '../../lib/cn';

type OptimizedImageProps = {
  src: string | null | undefined;
  alt: string;
  /** Görselin ekranda gösterileceği yaklaşık genişlik (px). */
  width: number;
  height?: number;
  /** srcset için ek genişlikler; tarayıcı ekran yoğunluğuna göre seçer. */
  srcSetWidths?: number[];
  sizes?: string;
  className?: string;
  /** İlk ekrandaki (hero vb.) görseller için tembel yüklemeyi kapatır. */
  eager?: boolean;
};

/**
 * Supabase görselini gösterildiği boyutta indirir; boyutlandırma
 * herhangi bir sebeple başarısız olursa otomatik olarak orijinal
 * adrese döner, görsel asla kırılmaz.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  srcSetWidths,
  sizes,
  className,
  eager = false,
}: OptimizedImageProps) {
  const original = src ?? '';
  const canOptimize = isSupabaseStorageUrl(original);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [original]);

  if (!original) return null;

  const displaySrc = failed || !canOptimize ? original : optimizedImageUrl(original, width, { height });
  const srcSet =
    failed || !canOptimize ? undefined : imageSrcSet(original, srcSetWidths ?? [width, width * 2], { height });

  return (
    <img
      src={displaySrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={cn(className)}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (!failed && canOptimize) setFailed(true);
      }}
    />
  );
}
