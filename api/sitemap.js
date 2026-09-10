export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || '')
    .replace(/\/$/, '');

  if (!supabaseUrl || !supabaseKey || !siteUrl) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Sitemap yapılandırması eksik.');
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/people?select=slug,updated_at&status=eq.published&order=updated_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('People fetch failed');
    }

    const people = await response.json();
    const lastmod = new Date().toISOString().split('T')[0];

    const urls = [
      { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${siteUrl}/simalar`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${siteUrl}/kitaplarim`, changefreq: 'monthly', priority: '0.9' },
      { loc: `${siteUrl}/kose-yazarlari`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${siteUrl}/hakkinda`, changefreq: 'monthly', priority: '0.5' },
      ...people.map((person) => ({
        loc: `${siteUrl}/simalar/${person.slug}`,
        lastmod: person.updated_at
          ? String(person.updated_at).split('T')[0]
          : lastmod,
        changefreq: 'monthly',
        priority: '0.8',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.end(xml);
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Sitemap oluşturulamadı.');
  }
}
