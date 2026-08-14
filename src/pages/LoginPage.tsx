import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '../components/seo/Seo';
import { useAuth } from '../context/AuthContext';
import { btnPrimary, inputClass, labelClass } from '../lib/cn';
import { SITE_NAME } from '../lib/constants';

export function LoginPage() {
  const { user, loading, configured, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/admin';
  const [email, setEmail] = useState('');
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
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? 'E-posta veya şifre hatalı.' : 'Giriş yapılamadı.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Yönetici Girişi" path="/login" noindex />
      <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-cream-200 bg-white p-8 shadow-card">
          <p className="text-center font-serif text-sm tracking-wide text-burgundy-700">{SITE_NAME}</p>
          <h1 className="mt-2 text-center font-serif text-3xl text-ink-900">Yönetici Girişi</h1>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className={labelClass}>E-posta</span>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
