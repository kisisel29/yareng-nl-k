import { AUTHOR_PHONE_DISPLAY, AUTHOR_WHATSAPP_URL } from './constants';
import type { AdPlacement, AdSlotId } from '../types';

export const ADS_ADMIN_PATH = '/admin/reklamlar';

export const SANTA_STORE_AD_HREF = 'https://www.shopier.com/santastore29';
export const SANTA_STORE_AD_IMAGE = '/ads/santa-store.jpg?v=3';

export const AD_SLOT_META: Record<
  AdSlotId,
  { label: string; description: string; format: AdPlacement['format']; size_label: string }
> = {
  home_after_hero: {
    label: 'Ana sayfa — üst bant',
    description: 'Arama ile alfabe dizini arasında. Yüksek görünürlük.',
    format: 'leaderboard',
    size_label: '728 × 90 (mobilde tam genişlik)',
  },
  home_mid: {
    label: 'Ana sayfa — orta bant',
    description: 'Haberler ile Kitaplarım bölümleri arasında.',
    format: 'leaderboard',
    size_label: '970 × 90 / 728 × 90',
  },
  sidebar: {
    label: 'Yan menü',
    description: 'Köşe yazarlarının altında, masaüstünde yapışkan.',
    format: 'rectangle',
    size_label: '300 × 250',
  },
  content_after: {
    label: 'İçerik sonu',
    description: 'Haber, biyografi ve köşe yazısı metninin altında.',
    format: 'inline',
    size_label: '680 × 120',
  },
  footer: {
    label: 'Sayfa altı',
    description: 'Footer’dan hemen önce, tüm genel sayfalarda.',
    format: 'leaderboard',
    size_label: '728 × 90',
  },
};

export function adsContactHref(): string {
  const digits = AUTHOR_PHONE_DISPLAY.replace(/\D/g, '');
  const phone = digits.startsWith('0') ? `90${digits.slice(1)}` : digits;
  const text = encodeURIComponent(
    'Merhaba, Gümüşhaneli Simalar sitesinde reklam vermek istiyorum.'
  );
  return `${AUTHOR_WHATSAPP_URL}?phone=${phone}&text=${text}`;
}

function placeholderAd(
  id: string,
  slot: AdSlotId,
  format: AdPlacement['format'],
  body: string,
  cta: string
): AdPlacement {
  return {
    id,
    slot,
    format,
    enabled: true,
    live: false,
    headline: 'Buraya reklam verebilirsiniz',
    body,
    cta,
    href: adsContactHref(),
    image_url: null,
    sponsor: null,
    size_label: AD_SLOT_META[slot].size_label,
  };
}

export function defaultAdPlacements(): AdPlacement[] {
  return [
    {
      id: 'ad-home-after-hero',
      slot: 'home_after_hero',
      format: 'leaderboard',
      enabled: true,
      live: true,
      headline: 'Santa Store — Outdoor giyim ve Gümüşhane temalı tasarımlar',
      body: 'Tişört, sweatshirt, gömlek, pantolon ve şişme yelek. 650 TL’den başlayan fiyatlarla.',
      cta: 'Şimdi İncele',
      href: SANTA_STORE_AD_HREF,
      image_url: SANTA_STORE_AD_IMAGE,
      sponsor: 'Santa Store',
      size_label: AD_SLOT_META.home_after_hero.size_label,
    },
    placeholderAd(
      'ad-home-mid',
      'home_mid',
      'leaderboard',
      'Haberler ile kitaplar arasında premium bant. Haftalık veya aylık rezervasyon.',
      'Yer ayırt'
    ),
    placeholderAd(
      'ad-sidebar',
      'sidebar',
      'rectangle',
      'Yan sütunda 300×250 alan. Gümüşhaneli okuyucuya sürekli görünürlük.',
      'Teklif al'
    ),
    placeholderAd(
      'ad-content-after',
      'content_after',
      'inline',
      'Haber ve biyografi yazılarının altında. İçerikle uyumlu, sakin tanıtım alanı.',
      'İletişime geç'
    ),
    placeholderAd(
      'ad-footer',
      'footer',
      'leaderboard',
      'Tüm genel sayfalarda alt bant. Kurumsal duyuru ve etkinlikler için ideal.',
      'Reklam ver'
    ),
  ];
}
