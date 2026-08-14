import { Facebook, Youtube } from 'lucide-react';
import { AUTHOR_NAME, SOCIAL_LINKS } from '../../lib/constants';
import { cn } from '../../lib/cn';

const ICONS = {
  YouTube: Youtube,
  Facebook: Facebook,
} as const;

interface SocialLinksProps {
  className?: string;
  variant?: 'text' | 'icons' | 'buttons';
}

export function SocialLinks({ className, variant = 'text' }: SocialLinksProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.label];
        const label = `${AUTHOR_NAME} ${link.label}`;

        if (variant === 'icons') {
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label={label}
              title={label}
              className="rounded-sm p-1.5 text-ink-600 hover:text-ink-900"
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        }

        if (variant === 'buttons') {
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="me noopener noreferrer"
              className="inline-flex items-center gap-2 border border-cream-300 px-4 py-2.5 text-sm text-ink-800 hover:border-ink-900 hover:text-ink-900"
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </a>
          );
        }

        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="me noopener noreferrer"
            className="hover:text-ink-900"
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
