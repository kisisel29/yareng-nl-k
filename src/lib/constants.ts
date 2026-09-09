export const PAGE_SIZE = 12;
export const FEATURED_LIMIT = 8;
export const SEARCH_DEBOUNCE_MS = 350;

export const SITE_NAME = 'Gümüşhaneli Simalar';
export const SITE_TAGLINE = "Gümüşhane'nin İnsan Hafızası";
export const AUTHOR_NAME = 'İsmail Hayal';
export const AUTHOR_PAGE_PATH = '/ismail-hayal';
export const COPY_PROTECTION_MESSAGE =
  "Bu sitedeki yazılar, araştırmalar ve görseller İsmail Hayal'in emeğidir. Kopyalamak, çoğaltmak veya kullanmak için lütfen İsmail Hayal ile iletişime geçiniz.";
export const DEFAULT_AUTHOR_TITLE = 'Eğitimci, şair ve yazar';
export const DEFAULT_AUTHOR_SHORT_BIO =
  "Gümüşhane doğumlu eğitimci, şair ve araştırmacı yazar. Gümüşhane'nin insan hafızasını kayıt altına alan kitapları ve Gümüşhaneli Simalar arşiviyle tanınır.";
export const DEFAULT_AUTHOR_BIOGRAPHY =
  "<p>İsmail Hayal, 23 Mayıs 1969'da Gümüşhane'de doğdu. İlk, orta ve lise öğrenimini Trabzon'da, yükseköğrenimini Ankara Gazi Üniversitesi Eğitim Fakültesi'nde tamamladı.</p><p>Öğretmenlik ve idarecilik görevlerini Kars Kağızman, Gümüşhane Kürtün ve Gümüşhane'de sürdürdü. Gümüşhane Rehberlik Araştırma Merkezi müdürlüğü, Gümüşhane Ticaret Meslek Lisesi müdür başyardımcılığı ve 2012–2014 yıllarında Gümüşhane Milli Eğitim Şube Müdürlüğü görevlerinde bulundu.</p><p>Ulusal ve yerel basında şiir, makale, desen ve karikatürleri yayımlandı. Hayal Dükkanı başlığıyla uzun yıllar kültür ve sanat yazıları yazdı.</p><p>Gümüşhane'nin eğitim, kültür ve insan hafızasına dair çok sayıda kitabı bulunmaktadır. Gümüşhaneli Simalar dijital arşivi, bu birikimin çevrimiçi devamıdır.</p>";
export const DEFAULT_DESCRIPTION =
  "İsmail Hayal'in resmi sitesi. Gümüşhaneli Simalar eserinden yola çıkan dijital biyografi arşivi.";

export const SOCIAL_LINKS = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ismailhayal',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/ismhayal29/',
  },
] as const;

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

export const TURKISH_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ',
  'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T',
  'U', 'Ü', 'V', 'Y', 'Z',
] as const;

/** Supabase e-posta beklediği için kullanıcı adı bu adrese çevrilir. */
export const AUTH_EMAIL_DOMAIN = 'simalar.com';

export function toAuthEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) return trimmed;
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@${AUTH_EMAIL_DOMAIN}`;
}
