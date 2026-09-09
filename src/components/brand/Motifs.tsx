import { SiteLogo } from './SiteLogo';

export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return <SiteLogo className={className} decorative />;
}
