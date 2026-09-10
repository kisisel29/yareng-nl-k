import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ContentProtection } from './ContentProtection';
import { ColumnistsSidebar } from '../columnists/ColumnistsSidebar';

export function PublicLayout() {
  return (
    <div className="public-site flex min-h-screen flex-col bg-white text-ink-800">
      <ContentProtection />
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <main className="min-w-0 flex-1">
          <div className="lg:hidden">
            <ColumnistsSidebar variant="horizontal" />
          </div>
          <Outlet />
        </main>
        <aside className="hidden w-72 shrink-0 border-l border-cream-200 bg-cream-50 lg:block">
          <div className="sticky top-[3.6rem] max-h-[calc(100vh-3.6rem)] overflow-y-auto">
            <ColumnistsSidebar />
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
