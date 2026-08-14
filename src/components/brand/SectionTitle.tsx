import type { ReactNode } from 'react';

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-cream-200 pb-4">
      <div>
        {eyebrow ? <p className="text-xs uppercase tracking-[0.16em] text-ink-500">{eyebrow}</p> : null}
        <h2 className="mt-1 font-serif text-3xl text-ink-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}
