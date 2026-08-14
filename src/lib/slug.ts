const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  i: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

export function slugify(value: string): string {
  const replaced = value
    .trim()
    .split('')
    .map((char) => TURKISH_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return replaced;
}

export function sanitizeSearchTerm(value: string): string {
  return value.replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function letterFilterVariants(letter: string): string[] {
  const upper = letter.trim().charAt(0).toLocaleUpperCase('tr-TR');
  if (upper === 'I') return ['I', 'ı'];
  if (upper === 'İ') return ['İ', 'i'];
  return [upper, upper.toLocaleLowerCase('tr-TR')];
}

export function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts[parts.length - 1],
  };
}
