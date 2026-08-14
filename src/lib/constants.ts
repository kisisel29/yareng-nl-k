export const PAGE_SIZE = 12;
export const FEATURED_LIMIT = 8;
export const SEARCH_DEBOUNCE_MS = 350;

export const SITE_NAME = 'Gümüşhaneli Simalar';
export const SITE_TAGLINE = "Gümüşhane'nin İnsan Hafızası";
export const DEFAULT_DESCRIPTION =
  "Geçmişten bugüne Gümüşhane'nin kültürüne, düşünce dünyasına ve toplumsal hayatına katkı sunmuş isimlerden oluşan dijital biyografi arşivi.";

export const GENDER_OPTIONS = [
  { value: '', label: 'Belirtilmedi' },
  { value: 'female', label: 'Kadın' },
  { value: 'male', label: 'Erkek' },
] as const;

/** İsmail Hayal, Gümüşhaneli Simalar — kitabın bölüm sırası */
export const BOOK_SECTIONS: { name: string; slug: string }[] = [
  { name: 'Akademisyenler', slug: 'akademisyenler' },
  { name: 'Allah Dostları', slug: 'allah-dostlari' },
  { name: 'Asker ve Emniyetçiler', slug: 'asker-ve-emniyetciler' },
  { name: 'Belediye Başkanları', slug: 'belediye-baskanlari' },
  { name: 'Bürokratlar', slug: 'burokratlar' },
  { name: 'Doktorlar', slug: 'doktorlar' },
  { name: 'Gazeteciler', slug: 'gazeteciler' },
  { name: 'Gönül Erleri', slug: 'gonul-erleri' },
  { name: 'Hukukçular', slug: 'hukukcular' },
  { name: 'İş İnsanları', slug: 'is-insanlari' },
  { name: 'Renkli ve Tarihi Simalar', slug: 'renkli-ve-tarihi-simalar' },
  { name: 'Sanatçılar', slug: 'sanatcilar' },
  { name: 'Siyasetçiler', slug: 'siyasetciler' },
  { name: 'Sporcular', slug: 'sporcular' },
  { name: 'STK ve Dernek Başkanları', slug: 'stk-ve-dernek-baskanlari' },
  { name: 'Şair, Yazar ve Aşıklar', slug: 'sair-yazar-ve-asiklar' },
  { name: 'Şehitlerimiz', slug: 'sehitlerimiz' },
  { name: 'Unutulmaz Eğitimciler', slug: 'unutulmaz-egitimciler' },
  { name: "Gümüşhane'de İz Bırakanlar", slug: 'gumushane-de-iz-birakanlar' },
];

/** Supabase e-posta beklediği için kullanıcı adı bu adrese çevrilir. */
export const AUTH_EMAIL_DOMAIN = 'simalar.com';

export function toAuthEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) return trimmed;
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@${AUTH_EMAIL_DOMAIN}`;
}
