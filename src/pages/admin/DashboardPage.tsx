import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { fetchAdminStats } from '../../lib/api';
import { btnPrimary } from '../../lib/cn';

interface Stats {
  totalPeople: number;
  publishedPeople: number;
  draftPeople: number;
  totalCategories: number;
  noPhotoPeople: number;
  pendingSubmissions: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError('İstatistikler yüklenemedi. Supabase bağlantısını kontrol edin.'));
  }, []);

  const cards = stats
    ? [
        { label: 'Toplam kişi', value: stats.totalPeople },
        { label: 'Toplam kategori', value: stats.totalCategories },
        { label: 'Yayındaki kişi', value: stats.publishedPeople },
        { label: 'Taslak kişi', value: stats.draftPeople },
        { label: 'Fotoğrafı olmayan kişi', value: stats.noPhotoPeople },
        { label: 'Bekleyen başvuru', value: stats.pendingSubmissions },
      ]
    : [];

  return (
    <>
      <Seo title="Yönetim" path="/admin" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Genel Bakış</h1>
          <p className="mt-1 text-sm text-ink-500">Arşiv özeti</p>
        </div>
        <Link to="/admin/simalar/yeni" className={btnPrimary}>
          Yeni kişi ekle
        </Link>
      </div>
      {error ? <p className="mt-6 text-sm text-red-800">{error}</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats
          ? cards.map((card) => (
              <div key={card.label} className="rounded-lg border border-cream-200 bg-white p-5">
                <p className="text-xs uppercase tracking-wider text-ink-500">{card.label}</p>
                <p className="mt-2 font-serif text-4xl text-ink-900">{card.value}</p>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-lg bg-cream-100" />
            ))}
      </div>
      {stats && stats.pendingSubmissions > 0 ? (
        <p className="mt-6 text-sm">
          <Link to="/admin/basvurular" className="text-burgundy-700 hover:underline">
            {stats.pendingSubmissions} bekleyen biyografi başvurusunu incele
          </Link>
        </p>
      ) : null}
    </>
  );
}
