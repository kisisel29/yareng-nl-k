import { Link } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { SiteLogo } from '../components/brand/SiteLogo';
import { btnPrimary } from '../lib/cn';

export function NotFoundPage({ message }: { message?: string }) {
  return (
    <>
      <Seo title="Sayfa bulunamadı" noindex />
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <SiteLogo className="mx-auto mb-6 h-20 w-20" decorative />
        <p className="text-sm uppercase tracking-widest text-burgundy-700">404</p>
        <h1 className="mt-3 font-serif text-4xl text-ink-900">Sayfa bulunamadı</h1>
        <p className="mt-4 text-ink-600">
          {message || 'Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.'}
        </p>
        <Link to="/" className={`${btnPrimary} mt-8`}>
          Ana sayfaya dön
        </Link>
      </div>
    </>
  );
}
