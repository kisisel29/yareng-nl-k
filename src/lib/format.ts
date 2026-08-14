import type { Person } from '../types';

export function personName(person: Pick<Person, 'first_name' | 'last_name' | 'display_name'>): string {
  const display = person.display_name?.trim();
  if (display) return display;
  return `${person.first_name} ${person.last_name}`.trim();
}

export function yearFromDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const year = value.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

export function formatLifeYears(
  birth: string | null | undefined,
  death: string | null | undefined
): string | null {
  const birthYear = yearFromDate(birth);
  const deathYear = yearFromDate(death);
  if (!birthYear && !deathYear) return null;
  if (birthYear && deathYear) return `${birthYear} – ${deathYear}`;
  if (birthYear) return `${birthYear} –`;
  return `– ${deathYear}`;
}

export function formatDateTr(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTimeTr(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function siteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function hasText(value: string | null | undefined): boolean {
  if (!value) return false;
  const stripped = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return stripped.length > 0;
}

export function plainTextExcerpt(html: string | null | undefined, max = 160): string {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}
