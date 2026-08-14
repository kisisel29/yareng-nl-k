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
const DashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage }))
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
              <Route path="/admin/simalar" element={<PeopleListPage />} />
              <Route path="/admin/simalar/yeni" element={<PersonFormPage />} />
              <Route path="/admin/simalar/ice-aktar" element={<ImportPage />} />
              <Route path="/admin/simalar/:id/duzenle" element={<PersonFormPage />} />
              <Route path="/admin/kategoriler" element={<CategoriesPage />} />
              <Route path="/admin/kaynaklar" element={<SourcesPage />} />
              <Route path="/admin/basvurular" element={<SubmissionsPage />} />
              <Route path="/admin/ayarlar" element={<SettingsPage />} />
              <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/simalar" element={<PeoplePage />} />
            <Route path="/simalar/:slug" element={<PersonDetailPage />} />
            <Route path="/hakkinda" element={<AboutPage />} />
            <Route path="/biyografi-gonder" element={<SubmitBiographyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
