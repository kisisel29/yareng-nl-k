import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { SITE_NAME } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';

const LINKS = [
  { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
    { to: '/admin/simalar', label: 'Simalar', icon: Users, end: true },
  { to: '/admin/simalar/yeni', label: 'Yeni Kişi Ekle', icon: Plus, end: false },
  { to: '/admin/kategoriler', label: 'Kategoriler', icon: FolderOpen, end: false },
  { to: '/admin/kaynaklar', label: 'Kaynaklar', icon: BookOpen, end: false },
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
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="font-serif text-lg text-cream-50">{SITE_NAME}</p>
              <p className="text-xs text-cream-300">Yönetim</p>
            </div>
            <button type="button" className="md:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-3">
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
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-cream-200 bg-white px-4 py-3 md:hidden">
            <button type="button" onClick={() => setOpen(true)} aria-label="Menü">
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-serif text-lg">Yönetim</span>
          </div>
          <div className="flex-1 p-4 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
