import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchAds, recordAdClick } from '../../lib/api';
import { AD_SLOT_META, adsContactHref, defaultAdPlacements } from '../../lib/ads';
import { cn } from '../../lib/cn';
import type { AdPlacement, AdSlotId } from '../../types';

function adClickLabel(ad: AdPlacement): string {
  if (ad.live) return ad.sponsor?.trim() || ad.headline;
  return `Satılık · ${AD_SLOT_META[ad.slot].label}`;
}

function trackAdClick(ad: AdPlacement) {
  void recordAdClick({
    adId: ad.id,
    slot: ad.slot,
    label: adClickLabel(ad),
  });
}

function defaultForSlot(slot: AdSlotId): AdPlacement | null {
  return defaultAdPlacements().find((item) => item.slot === slot && item.enabled) ?? null;
}

export function AdSlot({
  slot,
  className,
  tone = 'light',
}: {
  slot: AdSlotId;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const [ad, setAd] = useState<AdPlacement | null>(() => defaultForSlot(slot));

  useEffect(() => {
    let active = true;
    setAd(defaultForSlot(slot));
    fetchAds()
      .then((items) => {
        if (!active) return;
        const next = items.find((item) => item.slot === slot && item.enabled) ?? defaultForSlot(slot);
        setAd(next);
      })
      .catch(() => {
        if (active) setAd(defaultForSlot(slot));
      });
    return () => {
      active = false;
    };
  }, [slot]);

  if (!ad) return null;

  const dark = tone === 'dark';
  const href = ad.href || adsContactHref();
  const isExternal = href.startsWith('http');
  const placeholder = !ad.live;

  const liveImage = Boolean(ad.image_url && ad.live);

  const shell = cn(
    'group relative block overflow-hidden transition',
    placeholder
      ? cn(
          'ad-slot-placeholder border-2 border-dashed',
          dark
            ? 'border-cream-300/50 bg-ink-800/70 hover:border-cream-200/70'
            : 'border-burgundy-700/45 bg-[linear-gradient(135deg,#F7F5F0_0%,#EFECE4_45%,#E2DDD3_100%)] hover:border-burgundy-700/70'
        )
      : liveImage
        ? 'border-0 bg-transparent'
        : cn(
            'border',
            dark
              ? 'border-cream-100/15 bg-ink-900/40 hover:border-cream-100/30'
              : 'border-cream-300/70 bg-white hover:border-cream-400'
          ),
    liveImage
      ? 'leading-none'
      : cn(
          ad.format === 'rectangle' ? 'min-h-[15rem] w-full' : 'w-full',
          ad.format === 'leaderboard' ? 'min-h-[6.75rem] sm:min-h-[7.5rem]' : null,
          ad.format === 'inline' ? 'min-h-[7.5rem]' : null
        ),
    className
  );

  const inner = liveImage ? (
    <img
      src={ad.image_url!}
      alt={ad.headline}
      className="block h-auto w-full"
      loading="lazy"
    />
  ) : placeholder ? (
    <PlaceholderCreative ad={ad} dark={dark} />
  ) : (
    <LiveTextCreative ad={ad} dark={dark} />
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={shell}
        aria-label={ad.headline}
        onClick={() => trackAdClick(ad)}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={href} className={shell} aria-label={ad.headline} onClick={() => trackAdClick(ad)}>
      {inner}
    </Link>
  );
}

function PlaceholderCreative({ ad, dark }: { ad: AdPlacement; dark: boolean }) {
  const stacked = ad.format === 'rectangle';

  return (
    <span
      className={cn(
        'relative flex h-full w-full items-center gap-3 px-3 py-4 sm:gap-4 sm:px-5',
        stacked ? 'flex-col justify-center text-center' : 'flex-row'
      )}
    >
      <span className="ad-slot-corners pointer-events-none absolute inset-2" aria-hidden />
      <span className="ad-slot-shimmer pointer-events-none absolute inset-0" aria-hidden />

      <span
        className={cn(
          'ad-slot-badge relative z-[1] flex shrink-0 items-center justify-center',
          stacked ? 'h-14 w-14' : 'h-12 w-12 sm:h-14 sm:w-14',
          dark ? 'bg-cream-50/10 text-cream-50' : 'bg-burgundy-700/12 text-burgundy-800'
        )}
        aria-hidden
      >
        <AdMarkIcon className="h-7 w-7" />
      </span>

      <span className={cn('relative z-[1] min-w-0 flex-1', stacked ? 'px-1' : '')}>
        <span
          className={cn(
            'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]',
            dark ? 'text-cream-300' : 'text-burgundy-700'
          )}
        >
          <span className="ad-slot-dot h-1.5 w-1.5 rounded-full bg-current" />
          Reklam alanı boş
        </span>
        <span
          className={cn(
            'mt-1 block font-serif leading-snug',
            stacked ? 'text-lg' : 'text-lg sm:text-xl',
            dark ? 'text-cream-50' : 'text-ink-900'
          )}
        >
          Buraya reklam verebilirsiniz
        </span>
        <span
          className={cn(
            'mt-1 block text-xs leading-relaxed sm:text-sm',
            dark ? 'text-cream-200' : 'text-ink-600',
            stacked ? 'line-clamp-3' : 'line-clamp-2'
          )}
        >
          {ad.body}
        </span>
        <span className={cn('mt-1.5 block text-[10px] tracking-wide', dark ? 'text-cream-300/70' : 'text-ink-500')}>
          {ad.size_label}
        </span>
      </span>

      <span
        className={cn(
          'relative z-[1] inline-flex shrink-0 items-center justify-center px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm',
          dark
            ? 'bg-cream-50 text-ink-900 group-hover:bg-white'
            : 'bg-burgundy-700 text-cream-50 group-hover:bg-burgundy-800'
        )}
      >
        {ad.cta}
      </span>
    </span>
  );
}

function LiveTextCreative({ ad, dark }: { ad: AdPlacement; dark: boolean }) {
  return (
    <span className="flex h-full w-full flex-col justify-center gap-1.5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
      <span className="min-w-0">
        <span className={cn('block text-[10px] uppercase tracking-[0.14em]', dark ? 'text-cream-300' : 'text-ink-500')}>
          Sponsorlu{ad.sponsor ? ` · ${ad.sponsor}` : ''}
        </span>
        <span className={cn('mt-1 block font-serif text-lg leading-snug sm:text-xl', dark ? 'text-cream-50' : 'text-ink-900')}>
          {ad.headline}
        </span>
        <span className={cn('mt-1 block max-w-xl text-sm leading-relaxed', dark ? 'text-cream-200' : 'text-ink-600')}>
          {ad.body}
        </span>
      </span>
      <span
        className={cn(
          'mt-2 inline-flex shrink-0 items-center justify-center px-4 py-2 text-sm font-semibold sm:mt-0',
          dark ? 'bg-cream-50 text-ink-900 group-hover:bg-white' : 'bg-ink-900 text-cream-50 group-hover:bg-ink-800'
        )}
      >
        {ad.cta}
      </span>
    </span>
  );
}

function AdMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="10" width="36" height="28" stroke="currentColor" strokeWidth="2" />
      <path d="M6 18h36M16 10v8M32 10v8" stroke="currentColor" strokeWidth="2" />
      <circle className="ad-slot-pulse-fill" cx="24" cy="30" r="4" fill="currentColor" />
    </svg>
  );
}

export function AdBand({
  slot,
  className,
  tone = 'light',
}: {
  slot: AdSlotId;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>
      <AdSlot slot={slot} tone={tone} />
    </div>
  );
}
