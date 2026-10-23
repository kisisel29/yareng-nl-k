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

const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

function splitUrlMatch(match: string): { rawUrl: string; suffix: string } {
  const trailing = match.match(/[.,;:!?)\]»”']+$/);
  return {
    rawUrl: trailing ? match.slice(0, -trailing[0].length) : match,
    suffix: trailing ? trailing[0] : '',
  };
}

function hrefFor(rawUrl: string): string {
  return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
}

function linkifyPlainText(escaped: string): string {
  return escaped.replace(URL_PATTERN, (match) => {
    const { rawUrl, suffix } = splitUrlMatch(match);
    if (!rawUrl) return match;
    return `<a href="${hrefFor(rawUrl)}" target="_blank" rel="noopener noreferrer">${rawUrl}</a>${suffix}`;
  });
}

/** Düz metin veya HTML gövdesini güvenli, tıklanabilir linklerle HTML'e çevirir. */
export function renderLinkedContent(input: string | null | undefined): string {
  if (!input) return '';
  const raw = input.trim();
  if (!raw) return '';

  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return linkifyHtml(sanitizeHtml(raw));
  }

  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return linkifyPlainText(escaped).replace(/\n/g, '<br>');
}

/**
 * HTML içindeki mevcut <a> etiketlerini güvenli hale getirir ve
 * metin düğümlerinde kalan düz URL'leri tıklanabilir linke çevirir.
 */
function linkifyHtml(html: string): string {
  if (typeof window === 'undefined' || !html) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) || href.startsWith('www.')) {
      const normalized = hrefFor(href);
      anchor.setAttribute('href', normalized);
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('a, script, style')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue || '';
    URL_PATTERN.lastIndex = 0;
    if (!URL_PATTERN.test(text)) continue;
    URL_PATTERN.lastIndex = 0;

    const frag = doc.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = URL_PATTERN.exec(text))) {
      const start = match.index;
      if (start > lastIndex) {
        frag.appendChild(doc.createTextNode(text.slice(lastIndex, start)));
      }
      const { rawUrl, suffix } = splitUrlMatch(match[0]);
      if (rawUrl) {
        const a = doc.createElement('a');
        a.setAttribute('href', hrefFor(rawUrl));
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.textContent = rawUrl;
        frag.appendChild(a);
        if (suffix) frag.appendChild(doc.createTextNode(suffix));
      } else {
        frag.appendChild(doc.createTextNode(match[0]));
      }
      lastIndex = start + match[0].length;
    }
    if (lastIndex < text.length) {
      frag.appendChild(doc.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }

  return doc.body.innerHTML;
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
}
