import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SITE_NAME, SITE_TAGLINE } from '../../lib/constants';
import { cn } from '../../lib/cn';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const NAV = [
    { to: '/', label: 'Ana Sayfa' },
    { to: '/simalar', label: 'Simalar' },
    { to: '/hakkinda', label: 'Hakkında' },
    { to: user ? '/admin' : '/login', label: user ? 'Yönetim' : 'Giriş' },
  ];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="min-w-0">
          <p className="font-serif text-xl font-semibold leading-tight text-ink-900 sm:text-2xl">
            {SITE_NAME}
          </p>
          <p className="mt-0.5 text-xs tracking-wide text-ink-500 sm:text-sm">{SITE_TAGLINE}</p>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-burgundy-700' : 'text-ink-600 hover:text-ink-900'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-ink-800 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-cream-200 bg-cream-50 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-3 text-base',
                    isActive ? 'bg-cream-100 text-burgundy-700' : 'text-ink-700'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
