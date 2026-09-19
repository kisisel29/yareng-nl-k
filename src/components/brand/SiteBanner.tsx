import { SITE_NAME, SITE_TAGLINE } from '../../lib/constants';

export const SITE_BANNER_SRC = '/banner.jpg';

export function SiteBanner() {
  return (
    <div className="bg-white">
      <img
        src={SITE_BANNER_SRC}
        alt={`${SITE_NAME} — ${SITE_TAGLINE}`}
        width={989}
        height={388}
        className="mx-auto block h-auto w-full object-contain"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
