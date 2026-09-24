/** Köşe adı — yazar adının altında, yazı başlığıyla aynı Calibri stili. */
export function ColumnNameLabel({
  name,
  className = '',
  size = 'md',
}: {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'sm' ? 'text-xs text-ink-500' : 'text-sm text-ink-600';

  return (
    <span className={`mt-1 block font-calibri leading-snug ${sizeClass} ${className}`.trim()}>
      {name}
    </span>
  );
}
