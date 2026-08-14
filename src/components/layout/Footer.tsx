import { Link } from 'react-router-dom';
import { SITE_NAME, SITE_TAGLINE } from '../../lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-200 bg-cream-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-lg text-ink-900">{SITE_NAME}</p>
          <p className="mt-1 text-sm text-ink-500">{SITE_TAGLINE}</p>
        </div>
        <div className="flex gap-5 text-sm text-ink-600">
          <Link to="/simalar" className="hover:text-ink-900">
            Simalar
          </Link>
          <Link to="/hakkinda" className="hover:text-ink-900">
            Hakkında
          </Link>
        </div>
      </div>
    </footer>
  );
}
