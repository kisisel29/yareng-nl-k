import { useEffect, useMemo, useState } from 'react';
import { Seo } from '../../components/seo/Seo';
import {
  fetchAdClickSummary,
  fetchSiteTrafficSummary,
  type AdClickSummary,
  type TrafficSummary,
} from '../../lib/api';
import { AD_SLOT_META } from '../../lib/ads';
import { cn } from '../../lib/cn';
import type { AdSlotId } from '../../types';

function formatDayLabel(isoDay: string): string {
  const date = new Date(`${isoDay}T12:00:00+03:00`);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function slotLabel(slot: string): string {
  return AD_SLOT_META[slot as AdSlotId]?.label ?? slot;
}

export function AnalyticsPage() {
  const [summary, setSummary] = useState<TrafficSummary | null>(null);
  const [adClicks, setAdClicks] = useState<AdClickSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSiteTrafficSummary(30), fetchAdClickSummary(30)])
      .then(([traffic, ads]) => {
        if (!active) return;
        setSummary(traffic);
        setAdClicks(ads);
      })
      .catch(() => {
        if (!active) return;
        setSummary({
          today: { visits: 0, clicks: 0 },
          week: { visits: 0, clicks: 0 },
          month: { visits: 0, clicks: 0 },
          series: [],
          available: false,
        });
        setAdClicks({ rows: [], available: false });
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

  const adTotals = useMemo(() => {
    const rows = adClicks?.rows ?? [];
    return {
      today: rows.reduce((sum, row) => sum + row.today, 0),
      week: rows.reduce((sum, row) => sum + row.week, 0),
      month: rows.reduce((sum, row) => sum + row.month, 0),
    };
  }, [adClicks]);

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

      {!loading ? (
        <section className="mt-10 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-ink-900">Reklam tıklamaları</h2>
              <p className="mt-1 text-sm text-ink-500">
                Hangi reklamın ne kadar tıklandığı (Türkiye saati, son 30 gün).
              </p>
            </div>
            {adClicks?.available ? (
              <div className="flex flex-wrap gap-4 text-xs text-ink-500">
                <span>
                  Bugün: <span className="font-medium text-ink-800">{adTotals.today}</span>
                </span>
                <span>
                  7 gün: <span className="font-medium text-ink-800">{adTotals.week}</span>
                </span>
                <span>
                  30 gün: <span className="font-medium text-ink-800">{adTotals.month}</span>
                </span>
              </div>
            ) : null}
          </div>

          {!adClicks?.available ? (
            <div className="mt-5 rounded-lg border border-cream-200 bg-cream-50 p-4 text-sm leading-relaxed text-ink-700">
              Reklam tıklama tablosu henüz hazır değil. Supabase SQL Editor’de{' '}
              <code className="rounded bg-cream-100 px-1">supabase/migrations/010_ad_clicks.sql</code>{' '}
              dosyasını bir kez çalıştırın; ardından her reklam tıklaması burada görünecek.
            </div>
          ) : adClicks.rows.length === 0 ? (
            <p className="mt-5 text-sm text-ink-600">
              Henüz kayıtlı reklam tıklaması yok. Ziyaretçiler bir reklam bandına tıkladığında burada
              listelenir.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-cream-200 text-ink-500">
                  <tr>
                    <th className="px-2 py-2 font-medium">Reklam</th>
                    <th className="px-2 py-2 font-medium">Alan</th>
                    <th className="px-2 py-2 font-medium">Bugün</th>
                    <th className="px-2 py-2 font-medium">7 gün</th>
                    <th className="px-2 py-2 font-medium">30 gün</th>
                  </tr>
                </thead>
                <tbody>
                  {adClicks.rows.map((row) => (
                    <tr key={row.adId} className="border-b border-cream-100">
                      <td className="px-2 py-2 text-ink-900">{row.label}</td>
                      <td className="px-2 py-2 text-ink-600">{slotLabel(String(row.slot))}</td>
                      <td className="px-2 py-2 text-ink-800">{row.today}</td>
                      <td className="px-2 py-2 text-ink-800">{row.week}</td>
                      <td className="px-2 py-2 font-medium text-ink-900">{row.month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
