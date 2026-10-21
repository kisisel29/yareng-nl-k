import { cn } from '../../lib/cn';
import { OptimizedImage } from '../ui/OptimizedImage';
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
      <span className={cn('inline-flex shrink-0 items-end justify-center overflow-hidden bg-transparent', sizeClass)}>
        <OptimizedImage
          src={columnist.photo_url}
          alt={columnist.name}
          width={size === 'lg' ? 192 : size === 'sm' ? 80 : 96}
          srcSetWidths={[96, 192]}
          sizes={size === 'lg' ? '96px' : '48px'}
          className="h-full w-full object-contain object-bottom"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded bg-cream-200/80 font-semibold text-ink-700',
        sizeClass
      )}
      aria-hidden
    >
      {columnistInitials(columnist.name)}
    </span>
  );
}
