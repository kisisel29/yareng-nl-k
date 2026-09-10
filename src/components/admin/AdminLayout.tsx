import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderOpen,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  Library,
  PenLine,
  X,
} from 'lucide-react';
import { AUTHOR_ADMIN_PATH, COLUMNISTS_ADMIN_PATH, SITE_NAME } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';
import { SiteLogo } from '../brand/SiteLogo';

const LINKS = [
  { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: AUTHOR_ADMIN_PATH, label: 'Kitaplarım', icon: Library, end: false },
  { to: COLUMNISTS_ADMIN_PATH, label: 'Köşe Yazarları', icon: PenLine, end: false },
  { to: '/admin/simalar', label: 'Simalar', icon: Users, end: true },
  { to: '/admin/simalar/yeni', label: 'Yeni Kişi Ekle', icon: Plus, end: false },
  { to: '/admin/kategoriler', label: 'Kategoriler', icon: FolderOpen, end: false },
  { to: '/admin/kaynaklar', label: 'Kaynaklar', icon: BookOpen, end: false },
  { to: '/admin/basvurular', label: 'Başvurular', icon: Inbox, end: false },
  { to: '/admin/ayarlar', label: 'Ayarlar', icon: Settings, end: false },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-cream-50 text-ink-800">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 border-r border-cream-200 bg-ink-900 text-cream-100 transition-transform md:static md:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <div className="flex h-full flex-col overflow-y-auto pb-16">
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-50">
                <SiteLogo className="h-11 w-11" decorative />
              </span>
              <span>
                <span className="block font-serif text-lg text-cream-50">{SITE_NAME}</span>
                <span className="block text-xs text-cream-300">Yönetim</span>
              </span>
            </Link>
            <button type="button" className="md:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="mb-2 flex items-center gap-3 rounded-md border border-cream-700/40 px-3 py-2.5 text-sm text-cream-100 hover:bg-ink-800"
            >
              <Home className="h-4 w-4" />
              Ana sayfa
            </Link>
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm',
                    isActive ? 'bg-burgundy-700 text-cream-50' : 'text-cream-200 hover:bg-ink-800'
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-cream-200 hover:bg-ink-800"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </nav>
          <p className="absolute bottom-4 left-5 right-5 truncate text-xs text-cream-400">
            {user?.email}
          </p>
          </div>
        </aside>
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink-900/40 md:hidden"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-cream-200 bg-white px-4 py-3 md:hidden">
            <button type="button" onClick={() => setOpen(true)} aria-label="Menü">
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-serif text-lg">Yönetim</span>
            <Link to="/" className="ml-auto text-sm text-ink-600 hover:text-ink-900">
              Ana sayfa
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto p-4 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
