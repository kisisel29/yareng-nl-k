import { MessageCircle } from 'lucide-react';
import {
  AUTHOR_NAME,
  AUTHOR_PHONE_DISPLAY,
  AUTHOR_WHATSAPP_URL,
  DEFAULT_AUTHOR_TITLE,
} from '../../lib/constants';

export function AuthorWhatsAppContact({
  bookTitle,
  className = '',
}: {
  bookTitle?: string;
  className?: string;
}) {
  const message = bookTitle
    ? encodeURIComponent(`Merhaba ${AUTHOR_NAME}, "${bookTitle}" kitabı hakkında bilgi almak istiyorum.`)
    : encodeURIComponent(`Merhaba ${AUTHOR_NAME}, kitaplarınız hakkında bilgi almak istiyorum.`);
  const href = `${AUTHOR_WHATSAPP_URL}?text=${message}`;

  return (
    <aside
      className={`border-t border-cream-200 pt-8 ${className}`}
      aria-label={`${AUTHOR_NAME} ile WhatsApp üzerinden iletişim`}
    >
      <p className="text-xs uppercase tracking-[0.14em] text-ink-500">İletişim</p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-2xl text-ink-900">{AUTHOR_NAME}</p>
          <p className="mt-1 text-sm text-ink-600">{DEFAULT_AUTHOR_TITLE}</p>
          <p className="mt-2 text-sm tabular-nums text-ink-700">{AUTHOR_PHONE_DISPLAY}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border border-[#25D366] bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp ile yazın
        </a>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-600">
        Kitap siparişi, imza veya bilgi için {AUTHOR_NAME} ile WhatsApp üzerinden doğrudan iletişime geçebilirsiniz.
      </p>
    </aside>
  );
}
