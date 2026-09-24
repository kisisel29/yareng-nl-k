/** Köşe adı — yazı başlıklarından ayırt edilir. */
export function ColumnNameLabel({
  name,
  className = '',
  size = 'md',
}: {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'lg' ? 'text-sm' : size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span
      className={`mt-1 inline-flex max-w-full items-baseline gap-1.5 ${sizeClass} ${className}`.trim()}
    >
      <span className="shrink-0 font-sans font-normal uppercase tracking-[0.14em] text-ink-400">
        Köşe
      </span>
      <span className="min-w-0 font-serif font-normal italic leading-snug tracking-normal text-burgundy-800">
        {name}
      </span>
    </span>
  );
}
