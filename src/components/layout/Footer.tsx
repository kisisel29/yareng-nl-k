import { Link } from 'react-router-dom';
import { SITE_NAME, SITE_TAGLINE } from '../../lib/constants';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-ink-600 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-lg text-ink-900">{SITE_NAME}</p>
          <p className="mt-1">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p>İsmail Hayal</p>
          <p>Gümüşhaneli Simalar</p>
        </div>
        <div className="flex gap-6">
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
