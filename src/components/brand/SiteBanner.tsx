import { SITE_NAME, SITE_TAGLINE } from '../../lib/constants';

export const SITE_BANNER_SRC = '/banner.jpg';

export function SiteBanner() {
  return (
    <div className="bg-black">
      <img
        src={SITE_BANNER_SRC}
        alt={`${SITE_NAME} — ${SITE_TAGLINE}`}
        width={1024}
        height={309}
        className="mx-auto block h-[10.5rem] w-full object-cover object-center sm:h-auto sm:object-contain"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
