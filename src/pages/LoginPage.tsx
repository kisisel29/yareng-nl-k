import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { useAuth } from '../context/AuthContext';
import { btnPrimary, inputClass, labelClass } from '../lib/cn';
import { SITE_NAME } from '../lib/constants';
import { SiteLogo } from '../components/brand/SiteLogo';

export function LoginPage() {
  const { user, loading, configured, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!configured) {
      setError('Supabase yapılandırması eksik. Lütfen ortam değişkenlerini ekleyin.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? 'Kullanıcı adı veya şifre hatalı.' : 'Giriş yapılamadı.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Yönetici Girişi" path="/login" noindex />
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md border border-cream-200 p-8">
          <Link to="/" aria-label={SITE_NAME} className="mx-auto mb-4 block w-24">
            <SiteLogo className="h-24 w-24" decorative />
          </Link>
          <p className="text-center text-sm text-ink-500">{SITE_NAME}</p>
          <h1 className="mt-2 text-center font-serif text-3xl text-ink-900">Yönetici Girişi</h1>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className={labelClass}>Kullanıcı adı veya e-posta</span>
              <input
                type="text"
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Şifre</span>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="text-sm text-red-800">{error}</p> : null}
            <button type="submit" className={`${btnPrimary} w-full`} disabled={submitting}>
              {submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link to="/" className="text-ink-500 hover:text-ink-800">
              Ana sayfaya dön
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
