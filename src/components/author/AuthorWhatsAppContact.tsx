import { MessageCircle } from 'lucide-react';
import {
  AUTHOR_NAME,
  AUTHOR_PHONE_DISPLAY,
  AUTHOR_WHATSAPP_URL,
  DEFAULT_AUTHOR_TITLE,
} from '../../lib/constants';

function buildWhatsAppHref(bookTitle?: string) {
  const text = bookTitle
    ? `Merhaba ${AUTHOR_NAME}, ${bookTitle} kitabı hakkında bilgi almak istiyorum.`
    : `Merhaba ${AUTHOR_NAME}, kitaplarınız hakkında bilgi almak istiyorum.`;
  const params = new URLSearchParams({
    phone: '905306072929',
    text,
  });
  return `${AUTHOR_WHATSAPP_URL}?${params.toString()}`;
}

export function AuthorWhatsAppContact({
  bookTitle,
  className = '',
}: {
  bookTitle?: string;
  className?: string;
}) {
  const href = buildWhatsAppHref(bookTitle);

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
          <a href={`tel:+905306072929`} className="mt-2 block text-sm tabular-nums text-ink-700 hover:underline">
            {AUTHOR_PHONE_DISPLAY}
          </a>
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
        Açılmazsa numarayı kaydedip WhatsApp uygulamasından yazabilirsiniz.
      </p>
    </aside>
  );
}
