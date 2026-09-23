import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/** Düz metin veya HTML haber gövdesini güvenli, tıklanabilir linklerle HTML'e çevirir. */
export function renderLinkedContent(input: string | null | undefined): string {
  if (!input) return '';
  const raw = input.trim();
  if (!raw) return '';

  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return enhanceExternalLinks(sanitizeHtml(raw));
  }

  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const linked = escaped.replace(/(https?:\/\/[^\s<]+)/gi, (match) => {
    const trailing = match.match(/[.,;:!?)\]»”']+$/);
    const url = trailing ? match.slice(0, -trailing[0].length) : match;
    const suffix = trailing ? trailing[0] : '';
    if (!url) return match;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${suffix}`;
  });

  return linked.replace(/\n/g, '<br>');
}

function enhanceExternalLinks(html: string): string {
  if (typeof window === 'undefined' || !html) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return doc.body.innerHTML;
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
}
