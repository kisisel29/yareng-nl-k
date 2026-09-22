import { useEffect, useMemo, useState } from 'react';
import { Seo } from '../../components/seo/Seo';
import { fetchSiteTrafficSummary, type TrafficSummary } from '../../lib/api';
import { cn } from '../../lib/cn';

function formatDayLabel(isoDay: string): string {
  const date = new Date(`${isoDay}T12:00:00+03:00`);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function AnalyticsPage() {
  const [summary, setSummary] = useState<TrafficSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSiteTrafficSummary(30)
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch(() => {
        if (active) {
          setSummary({
            today: { visits: 0, clicks: 0 },
            week: { visits: 0, clicks: 0 },
            month: { visits: 0, clicks: 0 },
            series: [],
            available: false,
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const maxValue = useMemo(() => {
    if (!summary?.series.length) return 1;
    return Math.max(1, ...summary.series.map((row) => Math.max(row.visits, row.clicks)));
  }, [summary]);

  const cards = summary
    ? [
        { period: 'Bugün', visits: summary.today.visits, clicks: summary.today.clicks },
        { period: 'Son 7 gün', visits: summary.week.visits, clicks: summary.week.clicks },
        { period: 'Son 30 gün', visits: summary.month.visits, clicks: summary.month.clicks },
      ]
    : [];

  return (
    <>
      <Seo title="Trafik Analizi" noindex />
      <div>
        <h1 className="font-serif text-3xl text-ink-900">Trafik Analizi</h1>
        <p className="mt-1 text-sm text-ink-500">
          Günlük, haftalık ve aylık ziyaret ile tıklanma özeti (Türkiye saati).
        </p>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-lg bg-cream-100" />
          ))}
        </div>
      ) : null}

      {!loading && summary && !summary.available ? (
        <div className="mt-8 rounded-lg border border-cream-200 bg-white p-5 text-sm leading-relaxed text-ink-700">
          Trafik tablosu henüz hazır değil. Supabase SQL Editor’de{' '}
          <code className="rounded bg-cream-100 px-1">supabase/migrations/007_site_traffic.sql</code>{' '}
          dosyasını bir kez çalıştırın; ardından ziyaret ve tıklamalar burada birikecek.
        </div>
      ) : null}

      {!loading && summary?.available ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {cards.map((card) => (
              <div key={card.period} className="rounded-lg border border-cream-200 bg-white p-5">
                <p className="text-xs uppercase tracking-wider text-ink-500">{card.period}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm text-ink-600">Ziyaret</p>
                    <p className="font-serif text-3xl text-ink-900">{card.visits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-600">Tıklama</p>
                    <p className="font-serif text-3xl text-ink-900">{card.clicks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-10 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-2xl text-ink-900">Son 30 gün</h2>
              <div className="flex gap-4 text-xs text-ink-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-ink-900" /> Ziyaret
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-burgundy-700" /> Tıklama
                </span>
              </div>
            </div>

            <div className="mt-6 flex h-48 items-end gap-1 overflow-x-auto sm:gap-1.5">
              {summary.series.map((row) => (
                <div key={row.day} className="flex min-w-[1.1rem] flex-1 flex-col items-center gap-1">
                  <div className="flex h-40 w-full items-end justify-center gap-0.5">
                    <div
                      className="w-1/2 min-w-[3px] rounded-t-sm bg-ink-900"
                      style={{ height: `${Math.max(2, (row.visits / maxValue) * 100)}%` }}
                      title={`${row.day}: ${row.visits} ziyaret`}
                    />
                    <div
                      className="w-1/2 min-w-[3px] rounded-t-sm bg-burgundy-700"
                      style={{ height: `${Math.max(2, (row.clicks / maxValue) * 100)}%` }}
                      title={`${row.day}: ${row.clicks} tıklama`}
                    />
                  </div>
                  <span className={cn('hidden text-[10px] text-ink-500 sm:block', row.day.endsWith('-01') || row.day === summary.series[summary.series.length - 1]?.day ? 'opacity-100' : 'opacity-60')}>
                    {formatDayLabel(row.day)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-cream-200 text-ink-500">
                  <tr>
                    <th className="px-2 py-2 font-medium">Gün</th>
                    <th className="px-2 py-2 font-medium">Ziyaret</th>
                    <th className="px-2 py-2 font-medium">Tıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {[...summary.series].reverse().map((row) => (
                    <tr key={row.day} className="border-b border-cream-100">
                      <td className="px-2 py-2 text-ink-800">
                        {new Date(`${row.day}T12:00:00+03:00`).toLocaleDateString('tr-TR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-2 py-2 text-ink-800">{row.visits}</td>
                      <td className="px-2 py-2 text-ink-800">{row.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
