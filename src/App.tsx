import { lazy, Suspense, useLayoutEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

const PeoplePage = lazy(() =>
  import('./pages/PeoplePage').then((module) => ({ default: module.PeoplePage }))
);
const PersonDetailPage = lazy(() =>
  import('./pages/PersonDetailPage').then((module) => ({ default: module.PersonDetailPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((module) => ({ default: module.AboutPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const SubmitBiographyPage = lazy(() =>
  import('./pages/SubmitBiographyPage').then((module) => ({ default: module.SubmitBiographyPage }))
);
const AuthorPage = lazy(() =>
  import('./pages/AuthorPage').then((module) => ({ default: module.AuthorPage }))
);
const BookDetailPage = lazy(() =>
  import('./pages/BookDetailPage').then((module) => ({ default: module.BookDetailPage }))
);
const ColumnistsPage = lazy(() =>
  import('./pages/ColumnistsPage').then((module) => ({ default: module.ColumnistsPage }))
);
const PoemsPage = lazy(() =>
  import('./pages/PoemsPage').then((module) => ({ default: module.PoemsPage }))
);
const NewsPage = lazy(() =>
  import('./pages/NewsPage').then((module) => ({ default: module.NewsPage }))
);
const InterviewsPage = lazy(() =>
  import('./pages/InterviewsPage').then((module) => ({ default: module.InterviewsPage }))
);
const AuthorAdminPage = lazy(() =>
  import('./pages/admin/AuthorAdminPage').then((module) => ({ default: module.AuthorAdminPage }))
);
const ColumnistsAdminPage = lazy(() =>
  import('./pages/admin/ColumnistsAdminPage').then((module) => ({ default: module.ColumnistsAdminPage }))
);
const PoemsAdminPage = lazy(() =>
  import('./pages/admin/PoemsAdminPage').then((module) => ({ default: module.PoemsAdminPage }))
);
const NewsAdminPage = lazy(() =>
  import('./pages/admin/NewsAdminPage').then((module) => ({ default: module.NewsAdminPage }))
);
const InterviewsAdminPage = lazy(() =>
  import('./pages/admin/InterviewsAdminPage').then((module) => ({ default: module.InterviewsAdminPage }))
);
const AdsAdminPage = lazy(() =>
  import('./pages/admin/AdsAdminPage').then((module) => ({ default: module.AdsAdminPage }))
);
const CommentsAdminPage = lazy(() =>
  import('./pages/admin/CommentsAdminPage').then((module) => ({ default: module.CommentsAdminPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/admin/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage }))
);
const PeopleListPage = lazy(() =>
  import('./pages/admin/PeopleListPage').then((module) => ({ default: module.PeopleListPage }))
);
const PersonFormPage = lazy(() =>
  import('./pages/admin/PersonFormPage').then((module) => ({ default: module.PersonFormPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/admin/CategoriesPage').then((module) => ({ default: module.CategoriesPage }))
);
const SourcesPage = lazy(() =>
  import('./pages/admin/SourcesPage').then((module) => ({ default: module.SourcesPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/admin/SettingsPage').then((module) => ({ default: module.SettingsPage }))
);
const ImportPage = lazy(() =>
  import('./pages/admin/ImportPage').then((module) => ({ default: module.ImportPage }))
);
const SubmissionsPage = lazy(() =>
  import('./pages/admin/SubmissionsPage').then((module) => ({ default: module.SubmissionsPage }))
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-500">
      Yükleniyor…
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/analiz" element={<AnalyticsPage />} />
              <Route path="/admin/simalar" element={<PeopleListPage />} />
              <Route path="/admin/simalar/yeni" element={<PersonFormPage />} />
              <Route path="/admin/simalar/ice-aktar" element={<ImportPage />} />
              <Route path="/admin/simalar/:id/duzenle" element={<PersonFormPage />} />
              <Route path="/admin/kategoriler" element={<CategoriesPage />} />
              <Route path="/admin/kaynaklar" element={<SourcesPage />} />
              <Route path="/admin/basvurular" element={<SubmissionsPage />} />
              <Route path="/admin/kitaplarim" element={<AuthorAdminPage />} />
              <Route path="/admin/siirler" element={<PoemsAdminPage />} />
              <Route path="/admin/haberler" element={<NewsAdminPage />} />
              <Route path="/admin/soylesiler" element={<InterviewsAdminPage />} />
              <Route path="/admin/yorumlar" element={<CommentsAdminPage />} />
              <Route path="/admin/kose-yazarlari" element={<ColumnistsAdminPage />} />
              <Route path="/admin/reklamlar" element={<AdsAdminPage />} />
              <Route path="/admin/ismail-hayal" element={<Navigate to="/admin/kitaplarim" replace />} />
              <Route path="/admin/ayarlar" element={<SettingsPage />} />
              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/simalar" element={<PeoplePage />} />
            <Route path="/simalar/:slug" element={<PersonDetailPage />} />
            <Route path="/kitaplarim/:slug" element={<BookDetailPage />} />
            <Route path="/kitaplarim" element={<AuthorPage />} />
            <Route path="/siirler/:slug" element={<PoemsPage />} />
            <Route path="/siirler" element={<PoemsPage />} />
            <Route path="/haberler/:slug" element={<NewsPage />} />
            <Route path="/haberler" element={<NewsPage />} />
            <Route path="/soylesiler/:slug" element={<InterviewsPage />} />
            <Route path="/soylesiler" element={<InterviewsPage />} />
            <Route path="/kose-yazarlari/:slug/:articleSlug" element={<ColumnistsPage />} />
            <Route path="/kose-yazarlari/:slug" element={<ColumnistsPage />} />
            <Route path="/kose-yazarlari" element={<ColumnistsPage />} />
            <Route path="/ismail-hayal" element={<AboutPage />} />
            <Route path="/hakkinda" element={<Navigate to="/ismail-hayal" replace />} />
            <Route path="/biyografi-gonder" element={<SubmitBiographyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
