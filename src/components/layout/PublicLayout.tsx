import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ContentProtection } from './ContentProtection';
import { ColumnistsSidebar } from '../columnists/ColumnistsSidebar';
import { AdSlot } from '../ads/AdSlot';
import { TrafficTracker } from '../analytics/TrafficTracker';

export function PublicLayout() {
  return (
    <div className="public-site flex min-h-screen flex-col text-ink-800">
      <TrafficTracker />
      <ContentProtection />
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <main className="min-w-0 flex-1">
          <div className="lg:hidden">
            <ColumnistsSidebar variant="horizontal" />
            <div className="border-b border-cream-200 px-4 py-3">
              <AdSlot slot="sidebar" />
            </div>
          </div>
          <Outlet />
        </main>
        <aside className="hidden w-72 shrink-0 border-l border-cream-200 lg:block">
          <div className="sticky top-[3.6rem] max-h-[calc(100vh-3.6rem)] overflow-y-auto">
            <ColumnistsSidebar />
            <div className="border-t border-cream-200 p-4">
              <AdSlot slot="sidebar" />
            </div>
          </div>
        </aside>
      </div>
      <div className="border-t border-cream-200 py-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AdSlot slot="footer" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
