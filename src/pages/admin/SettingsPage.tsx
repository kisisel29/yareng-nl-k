import { useEffect, useRef, useState } from 'react';
import { Seo } from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import { fetchSiteSettings } from '../../lib/api';
import { reprocessPortraitBackgrounds, upsertSiteSettings } from '../../lib/admin';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';

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
  const [fixingPortraits, setFixingPortraits] = useState(false);

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

  async function fixPortraits() {
    setFixingPortraits(true);
    try {
      const result = await reprocessPortraitBackgrounds();
      await upsertSiteSettings({ portraits_bg_fixed: '1' });
      notify(
        `Arka plan düzeltildi: ${result.fixed} güncellendi, ${result.skipped} atlandı, ${result.failed} hata.`,
        result.failed ? 'error' : 'success'
      );
    } catch {
      notify('Fotoğraf arka planları düzeltilemedi. Supabase depolama CORS ayarını kontrol edin.', 'error');
    } finally {
      setFixingPortraits(false);
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

      <section className="mt-8 max-w-2xl rounded-lg border border-cream-200 bg-white p-6">
        <h2 className="font-serif text-2xl text-ink-900">Fotoğraf bakımı</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Simalar, şiirler ve köşe yazarlarındaki beyaz zeminli portreleri otomatik şeffafa çevirir. Bir kez
          çalıştırmanız yeterlidir; yeni yüklemeler zaten şeffaf kaydedilir.
        </p>
        <button
          type="button"
          className={`${btnSecondary} mt-4`}
          disabled={fixingPortraits}
          onClick={() => void fixPortraits()}
        >
          {fixingPortraits ? 'Düzeltiliyor…' : 'Beyaz arka planları düzelt'}
        </button>
      </section>
      <PortraitBackgroundAutoFix />
    </>
  );
}

/** Admin Ayarlar’a girince, daha önce çalışmadıysa bir kez otomatik düzeltir. */
function PortraitBackgroundAutoFix() {
  const { notify } = useToast();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let active = true;
    (async () => {
      try {
        const settings = await fetchSiteSettings();
        if (settings.portraits_bg_fixed === '1') return;
        const result = await reprocessPortraitBackgrounds();
        await upsertSiteSettings({ portraits_bg_fixed: '1' });
        if (!active) return;
        if (result.fixed > 0) {
          notify(`Eski fotoğraflar güncellendi (${result.fixed} adet).`, 'success');
        }
      } catch {
        /* CORS veya yetki yoksa sessiz; kullanıcı butondan tekrar deneyebilir */
      }
    })();
    return () => {
      active = false;
    };
  }, [notify]);

  return null;
}
