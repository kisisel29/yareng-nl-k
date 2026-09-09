import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTHOR_NAME, SITE_NAME, SITE_TAGLINE } from '../../lib/constants';
import { fetchCategories } from '../../lib/api';
import { SocialLinks } from './SocialLinks';
import { SiteLogo } from '../brand/SiteLogo';
import type { Category } from '../../types';

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-auto border-t border-cream-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <SiteLogo className="h-16 w-16 shrink-0" decorative />
              <span>
                <span className="block font-serif text-lg text-ink-900">{SITE_NAME}</span>
                <span className="mt-0.5 block text-sm">{SITE_TAGLINE}</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-600">
              {AUTHOR_NAME}'in resmi sitesi. Gümüşhaneli Simalar dijital biyografi arşivi.
            </p>
          </div>
          <div>
            <Link to="/ismail-hayal" className="text-sm font-medium text-ink-900 hover:text-ink-700">
              {AUTHOR_NAME}
            </Link>
            <p className="mt-1 text-sm text-ink-600">Eğitimci, şair ve yazar</p>
            <SocialLinks className="mt-4 gap-5 text-sm" />
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/simalar" className="hover:text-ink-900">
              Simalar
            </Link>
            <Link to="/ismail-hayal" className="hover:text-ink-900">
              İsmail Hayal
            </Link>
            <Link to="/hakkinda" className="hover:text-ink-900">
              Hakkında
            </Link>
            <Link to="/biyografi-gonder" className="hover:text-ink-900">
              Biyografi gönder
            </Link>
          </div>
          <div className="text-sm">
            <p className="font-medium text-ink-900">Bölümler</p>
            <ul className="mt-3 grid grid-cols-1 gap-2">
              {categories.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link to={`/simalar?kategori=${category.slug}`} className="text-ink-600 hover:text-ink-900">
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length > 8 ? (
                <li>
                  <Link to="/simalar" className="text-burgundy-700 hover:underline">
                    Tüm bölümler
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-cream-200 pt-6 text-sm text-ink-500">
          Yazılar, araştırmalar ve görseller {AUTHOR_NAME}'e aittir. İzinsiz kopyalanamaz. Kullanmak için lütfen
          kendisiyle iletişime geçiniz.
        </p>
      </div>
    </footer>
  );
}
