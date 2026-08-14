import { useEffect, useState } from 'react';
import { Seo } from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import { fetchSiteSettings } from '../../lib/api';
import { upsertSiteSettings } from '../../lib/admin';
import { btnPrimary, inputClass, labelClass } from '../../lib/cn';

export function SettingsPage() {
  const { notify } = useToast();
  const [form, setForm] = useState({
    about_intro: '',
    about_book: '',
    default_source_author: '',
    default_source_book: '',
    default_source_year: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then((settings) =>
        setForm({
          about_intro: settings.about_intro ?? '',
          about_book: settings.about_book ?? '',
          default_source_author: settings.default_source_author ?? '',
          default_source_book: settings.default_source_book ?? '',
          default_source_year: settings.default_source_year ?? '',
        })
      )
      .catch(() => notify('Ayarlar yüklenemedi.', 'error'));
  }, [notify]);

  async function save() {
    setSaving(true);
    try {
      await upsertSiteSettings(form);
      notify('Ayarlar kaydedildi.', 'success');
    } catch {
      notify('Ayarlar kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Seo title="Ayarlar" noindex />
      <h1 className="font-serif text-3xl text-ink-900">Ayarlar</h1>
      <form
        className="mt-6 max-w-2xl space-y-4 rounded-lg border border-cream-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="block">
          <span className={labelClass}>Hakkında metni</span>
          <textarea
            className={inputClass}
            rows={5}
            value={form.about_intro}
            onChange={(e) => setForm({ ...form, about_intro: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Kitap ve yazar metni</span>
          <textarea
            className={inputClass}
            rows={5}
            value={form.about_book}
            onChange={(e) => setForm({ ...form, about_book: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Varsayılan kaynak yazarı</span>
          <input
            className={inputClass}
            value={form.default_source_author}
            onChange={(e) => setForm({ ...form, default_source_author: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Varsayılan kitap adı</span>
          <input
            className={inputClass}
            value={form.default_source_book}
            onChange={(e) => setForm({ ...form, default_source_book: e.target.value })}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Varsayılan baskı yılı</span>
          <input
            className={inputClass}
            value={form.default_source_year}
            onChange={(e) => setForm({ ...form, default_source_year: e.target.value })}
          />
        </label>
        <button type="submit" className={btnPrimary} disabled={saving}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </form>
    </>
  );
}
