import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedCount } from '../../lib/api';
import { cn } from '../../lib/cn';

export function ArchivePeopleCount({
  className,
  link = true,
}: {
  className?: string;
  link?: boolean;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublishedCount()
      .then((value) => {
        if (active) setCount(value);
      })
      .catch(() => {
        if (active) setCount(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (count == null) return null;

  const label = (
    <>
      <span className="tabular-nums font-medium text-ink-900">{count.toLocaleString('tr-TR')}</span>
      {' '}
      Gümüşhaneli sima
    </>
  );

  if (!link) {
    return <p className={cn('text-sm text-ink-600', className)}>{label}</p>;
  }

  return (
    <p className={cn('text-sm text-ink-600', className)}>
      <Link to="/simalar" className="hover:text-ink-900 hover:underline">
        {label}
      </Link>
      {' '}
      arşivde
    </p>
  );
}
