import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ContentProtection } from './ContentProtection';

export function PublicLayout() {
  return (
    <div className="public-site flex min-h-screen flex-col bg-white text-ink-800">
      <ContentProtection />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
