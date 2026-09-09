import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from '../../context/AuthContext';
import { SocialLinks } from './SocialLinks';
import { SearchBox } from '../people/SearchBox';
import { SiteWordmark } from '../brand/SiteLogo';

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const NAV = [
    { to: '/', label: 'Ana Sayfa' },
    { to: '/simalar', label: 'Simalar' },
    { to: '/ismail-hayal', label: 'İsmail Hayal' },
    { to: '/hakkinda', label: 'Hakkında' },
    { to: '/biyografi-gonder', label: 'Biyografi gönder' },
    { to: user ? '/admin' : '/login', label: user ? 'Yönetim' : 'Giriş' },
  ];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  function submitSearch(event?: FormEvent) {
    event?.preventDefault();
    const value = query.trim();
    navigate(value ? `/simalar?q=${encodeURIComponent(value)}` : '/simalar');
    setQuery('');
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <SiteWordmark className="min-w-0 shrink" />

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'border-b-2 pb-0.5 text-sm',
                  isActive ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-600 hover:text-ink-900'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <SocialLinks variant="icons" className="ml-auto hidden md:flex" />

        <form onSubmit={submitSearch} className="hidden min-w-0 max-w-xs flex-1 items-center xl:flex">
          <label className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ara"
              className="w-full rounded-sm border border-cream-300 py-2 pl-9 pr-3 text-sm focus:border-ink-900 focus:outline-none"
            />
          </label>
        </form>

        <button
          type="button"
          className="ml-auto flex h-11 w-11 items-center justify-center text-ink-800 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-cream-200 px-4 py-3 lg:hidden">
          <SearchBox value={query} onChange={setQuery} onSubmit={() => submitSearch()} />
          <div className="mt-3 flex flex-col">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn('min-h-11 px-2 py-3 text-base', isActive ? 'text-ink-900' : 'text-ink-600')
                }
              >
                {item.label}
              </NavLink>
            ))}
            <SocialLinks className="px-2 py-3" />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
