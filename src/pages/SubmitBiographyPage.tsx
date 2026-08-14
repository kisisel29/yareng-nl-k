import { useEffect, useState, type FormEvent } from 'react';
import { Seo } from '../components/seo/Seo';
import { createBiographySubmission, fetchCategories } from '../lib/api';
import { btnPrimary, inputClass, labelClass } from '../lib/cn';
import type { Category } from '../types';

export function SubmitBiographyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [profession, setProfession] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [biography, setBiography] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (honeypot) {
      setDone(true);
      return;
    }
    if (fullName.trim().length < 3 || biography.trim().length < 40) {
      setError('Ad soyad ve en az birkaç cümlelik bir biyografi metni gereklidir.');
      return;
    }
    setSubmitting(true);
    try {
      await createBiographySubmission({
        full_name: fullName,
        email,
        category_id: categoryId || undefined,
        profession,
        birth_place: birthPlace,
        biography,
        notes,
      });
      setDone(true);
    } catch {
      setError('Başvuru gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Biyografi gönder"
        description="Gümüşhaneli bir simanın biyografisini arşive önerin. Başvurular yönetici onayından sonra yayınlanır."
        path="/biyografi-gonder"
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">Biyografi gönder</h1>
        <p className="mt-4 leading-relaxed text-ink-600">
          Kendinizin veya bir hemşerinin biyografisini önerin. Metinler yönetici incelemesinden sonra arşive eklenir.
        </p>

        {done ? (
          <p className="mt-10 border border-cream-200 bg-cream-50 p-6 leading-relaxed text-ink-700">
            Başvurunuz alındı. İncelemenin ardından uygun görülürse arşive eklenir.
          </p>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <label className="hidden">
              Site
              <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
            <label className="block">
              <span className={labelClass}>Ad soyad</span>
              <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label className="block">
              <span className={labelClass}>İletişim e-postası (isteğe bağlı)</span>
              <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className={labelClass}>Bölüm</span>
              <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Seçilmedi</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Meslek</span>
                <input className={inputClass} value={profession} onChange={(e) => setProfession(e.target.value)} />
              </label>
              <label className="block">
                <span className={labelClass}>Doğum yeri</span>
                <input className={inputClass} value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Biyografi</span>
              <textarea
                className={inputClass}
                rows={10}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Kaynak veya not (isteğe bağlı)</span>
              <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            {error ? <p className="text-sm text-red-800">{error}</p> : null}
            <button type="submit" className={`${btnPrimary} min-h-11 w-full sm:w-auto`} disabled={submitting}>
              {submitting ? 'Gönderiliyor…' : 'Başvuruyu gönder'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
