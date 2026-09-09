import { Link } from 'react-router-dom';
import { SITE_NAME } from '../../lib/constants';
import { cn } from '../../lib/cn';

export const SITE_LOGO_SRC = '/logo.webp';

export function SiteLogo({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <img
      src={SITE_LOGO_SRC}
      alt={decorative ? '' : SITE_NAME}
      width={640}
      height={613}
      className={cn('object-contain', className)}
      decoding="async"
    />
  );
}

export function SiteWordmark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex min-w-0 items-center gap-2 sm:gap-2.5', className)}>
      <SiteLogo className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" decorative />
      <span className="block truncate font-serif text-lg leading-tight text-ink-900 sm:text-2xl">
        {SITE_NAME}
      </span>
    </Link>
  );
}
