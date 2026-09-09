import { useCallback, useEffect, useState } from 'react';
import { AUTHOR_NAME, COPY_PROTECTION_MESSAGE, SOCIAL_LINKS } from '../../lib/constants';
import { Modal } from '../ui/Modal';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

export function ContentProtection() {
  const [open, setOpen] = useState(false);

  const warn = useCallback((event: Event) => {
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const blocked =
        (event.ctrlKey || event.metaKey) &&
        (key === 'c' || key === 'x' || key === 's' || key === 'u' || key === 'p' || key === 'a');
      if (blocked || event.key === 'PrintScreen') {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('copy', warn, true);
    document.addEventListener('cut', warn, true);
    document.addEventListener('contextmenu', warn, true);
    document.addEventListener('dragstart', warn, true);
    document.addEventListener('selectstart', warn, true);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('copy', warn, true);
      document.removeEventListener('cut', warn, true);
      document.removeEventListener('contextmenu', warn, true);
      document.removeEventListener('dragstart', warn, true);
      document.removeEventListener('selectstart', warn, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [warn]);

  return (
    <Modal open={open} title="İzinsiz kopyalama" onClose={() => setOpen(false)}>
      <p className="leading-relaxed text-ink-700">{COPY_PROTECTION_MESSAGE}</p>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="me noopener noreferrer"
            className="text-burgundy-700 hover:underline"
          >
            {AUTHOR_NAME} — {link.label}
          </a>
        ))}
      </div>
      <button
        type="button"
        className="mt-6 w-full rounded-sm bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-700"
        onClick={() => setOpen(false)}
      >
        Anladım
      </button>
    </Modal>
  );
}
