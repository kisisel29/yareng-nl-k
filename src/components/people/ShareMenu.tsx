import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { SITE_NAME } from '../../lib/constants';

export function ShareMenu({ title, url }: { title: string; url: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — ${SITE_NAME}`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border border-cream-300 px-3 py-1.5 text-sm text-ink-600 hover:bg-cream-100"
      >
        <Share2 className="h-4 w-4" />
        Paylaş
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-cream-200 bg-white p-2 shadow-card">
          <a
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="block rounded px-3 py-2 text-sm hover:bg-cream-100"
          >
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="block rounded px-3 py-2 text-sm hover:bg-cream-100"
          >
            X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="block rounded px-3 py-2 text-sm hover:bg-cream-100"
          >
            Facebook
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-cream-100"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
