/** Köşe adı — yazı başlıklarından ayırt edilen masthead stili. */
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
    size === 'lg'
      ? 'text-xl tracking-[0.2em] sm:text-2xl'
      : size === 'sm'
        ? 'text-[11px] tracking-[0.16em]'
        : 'text-base tracking-[0.18em]';

  return (
    <span
      className={`mt-1 block font-column font-semibold uppercase leading-tight text-burgundy-700 ${sizeClass} ${className}`.trim()}
    >
      {name}
    </span>
  );
}
