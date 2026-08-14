import { useEffect, type ReactNode } from 'react';

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink-900/40"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-cream-200 bg-white p-6 shadow-card">
        <h2 className="font-serif text-2xl text-ink-900">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
