import { Helmet } from 'react-helmet-async';
import { SITE_BANNER_SRC } from '../brand/SiteBanner';
import { DEFAULT_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE } from '../../lib/constants';
import { siteUrl } from '../../lib/format';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image,
  keywords = SITE_KEYWORDS,
  noindex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | ${SITE_TAGLINE}`;
  const canonical = `${siteUrl()}${path}`;
  const ogImage = image || `${siteUrl()}${SITE_BANNER_SRC}`;

  return (
    <Helmet>
      <html lang="tr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="İsmail Hayal" />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
