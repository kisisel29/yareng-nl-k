import Papa from 'papaparse';
import type { Category, Person, PersonFormValues } from '../types';
import { slugify } from './slug';
import { isRichTextEmpty } from './sanitize';

const CSV_COLUMNS = [
  'ad',
  'soyad',
  'tam_ad',
  'slug',
  'dogum_tarihi',
  'olum_tarihi',
  'dogum_yeri',
  'ilce',
  'meslek',
  'unvan',
  'kategori',
  'kisa_biyografi',
  'uzun_biyografi',
  'kaynak_yazar',
  'kaynak_kitap',
  'kaynak_yil',
  'kaynak_sayfa',
] as const;

type CsvRow = Record<(typeof CSV_COLUMNS)[number], string>;

function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const match = Object.keys(row).find((item) => item.trim().toLowerCase() === key.toLowerCase());
    if (match && row[match] != null) return String(row[match]).trim();
  }
  return '';
}

export function parsePeopleCsv(text: string): Record<string, string>[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) {
    throw new Error(parsed.errors[0]?.message || 'CSV okunamadı.');
  }
  return parsed.data;
}

export function csvRowToFormValues(
  row: Record<string, string>,
  categories: Category[]
): PersonFormValues {
  const firstName = cell(row, 'ad', 'first_name');
  const lastName = cell(row, 'soyad', 'last_name');
  const displayName = cell(row, 'tam_ad', 'display_name');
  const categoryName = cell(row, 'kategori', 'category');
  const category = categories.find(
    (item) =>
      item.name.toLowerCase() === categoryName.toLowerCase() ||
      item.slug.toLowerCase() === slugify(categoryName)
  );

  return {
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    slug: cell(row, 'slug') || slugify(`${firstName} ${lastName}`),
    gender: '',
    short_bio: cell(row, 'kisa_biyografi', 'short_bio'),
    biography: wrapBiography(cell(row, 'uzun_biyografi', 'biography')),
    education: '',
    positions: '',
    works: '',
    notable_works: '',
    contributions: '',
    birth_date: normalizeDate(cell(row, 'dogum_tarihi', 'birth_date')),
    death_date: normalizeDate(cell(row, 'olum_tarihi', 'death_date')),
    birth_place: cell(row, 'dogum_yeri', 'birth_place'),
    district: cell(row, 'ilce', 'district'),
    profession: cell(row, 'meslek', 'profession'),
    title: cell(row, 'unvan', 'title'),
    category_id: category?.id ?? '',
    featured: false,
    status: 'draft',
    source_author: cell(row, 'kaynak_yazar', 'author'),
    source_book_title: cell(row, 'kaynak_kitap', 'book_title'),
    source_edition_year: cell(row, 'kaynak_yil', 'edition_year'),
    source_page_number: cell(row, 'kaynak_sayfa', 'page'),
    source_extra: '',
    source_description: '',
  };
}

function wrapBiography(value: string): string {
  if (!value) return '';
  if (value.includes('<p>') || value.includes('<h')) return value;
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function normalizeDate(value: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  const tr = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (tr) {
    return `${tr[3]}-${tr[2].padStart(2, '0')}-${tr[1].padStart(2, '0')}`;
  }
  return '';
}

export function peopleToCsv(people: Person[]): string {
  const rows: CsvRow[] = people.map((person) => ({
    ad: person.first_name,
    soyad: person.last_name,
    tam_ad: person.display_name ?? '',
    slug: person.slug,
    dogum_tarihi: person.birth_date ?? '',
    olum_tarihi: person.death_date ?? '',
    dogum_yeri: person.birth_place ?? '',
    ilce: person.district ?? '',
    meslek: person.profession ?? '',
    unvan: person.title ?? '',
    kategori: person.category?.name ?? '',
    kisa_biyografi: person.short_bio ?? '',
    uzun_biyografi: isRichTextEmpty(person.biography) ? '' : person.biography ?? '',
    kaynak_yazar: person.sources?.[0]?.author ?? '',
    kaynak_kitap: person.sources?.[0]?.book_title ?? '',
    kaynak_yil: person.sources?.[0]?.edition_year?.toString() ?? '',
    kaynak_sayfa: person.sources?.[0]?.page_number ?? '',
  }));

  return Papa.unparse(rows);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const CSV_TEMPLATE = CSV_COLUMNS.join(',') + '\n';
