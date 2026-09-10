import { cn } from '../../lib/cn';
import type { Columnist } from '../../types';

export function columnistInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KY';
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase('tr-TR');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase('tr-TR');
}

export function ColumnistAvatar({
  columnist,
  size = 'md',
}: {
  columnist: Pick<Columnist, 'name' | 'photo_url'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'h-24 w-24 text-xl' : size === 'sm' ? 'h-10 w-10 text-xs' : 'h-12 w-12 text-sm';
  if (columnist.photo_url) {
    return (
      <img
        src={columnist.photo_url}
        alt={columnist.name}
        className={cn('shrink-0 rounded object-cover', sizeClass)}
      />
    );
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded bg-cream-200 font-semibold text-ink-700',
        sizeClass
      )}
      aria-hidden
    >
      {columnistInitials(columnist.name)}
    </span>
  );
}
