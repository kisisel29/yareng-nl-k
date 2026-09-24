import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import { AD_SLOT_META, adsContactHref, defaultAdPlacements } from '../../lib/ads';
import { saveAds } from '../../lib/admin';
import { fetchAds } from '../../lib/api';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import { AUTHOR_PHONE_DISPLAY } from '../../lib/constants';
import type { AdPlacement } from '../../types';

export function AdsAdminPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  useEffect(() => {
    fetchAds()
      .then((list) => {
        setItems(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .catch(() => {
        const fallback = defaultAdPlacements();
        setItems(fallback);
        setSelectedId(fallback[0]?.id ?? null);
        notify('Reklamlar yüklenemedi; varsayılanlar açıldı.', 'error');
      })
      .finally(() => setLoading(false));
  }, [notify]);

  function updateSelected(patch: Partial<AdPlacement>) {
    if (!selected) return;
    setItems((prev) => prev.map((item) => (item.id === selected.id ? { ...item, ...patch } : item)));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAds(items);
      notify('Reklam alanları kaydedildi.', 'success');
    } catch {
      notify('Kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    const next = defaultAdPlacements();
    setItems(next);
    setSelectedId(next[0]?.id ?? null);
  }

  return (
    <>
      <Seo title="Reklamlar" noindex />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Reklam alanları</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-600">
            Sitedeki hazır alanlar. Boşken satılık alan metni görünür; canlı reklam için görsel ve link
            ekleyin. İletişim: {AUTHOR_PHONE_DISPLAY} (
            <a className="text-burgundy-700 hover:underline" href={adsContactHref()} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            ).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecondary} onClick={resetDefaults}>
            Varsayılanlara dön
          </button>
          <button type="button" className={btnPrimary} disabled={saving || loading} onClick={() => void save()}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-ink-500">Yükleniyor…</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-md border px-3 py-3 text-left text-sm ${
                    selected?.id === item.id
                      ? 'border-burgundy-700 bg-white'
                      : 'border-cream-200 bg-cream-50 hover:bg-white'
                  }`}
                >
                  <span className="block font-medium text-ink-900">{AD_SLOT_META[item.slot].label}</span>
                  <span className="mt-1 block text-xs text-ink-500">
                    {item.enabled ? (item.live ? 'Canlı reklam' : 'Satılık alan') : 'Kapalı'} · {item.size_label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <form
              className="space-y-4 rounded-lg border border-cream-200 bg-white p-5 sm:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                void save();
              }}
            >
              <div>
                <h2 className="font-serif text-2xl text-ink-900">{AD_SLOT_META[selected.slot].label}</h2>
                <p className="mt-1 text-sm text-ink-500">{AD_SLOT_META[selected.slot].description}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.enabled}
                    onChange={(e) => updateSelected({ enabled: e.target.checked })}
                  />
                  Sitede göster
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.live}
                    onChange={(e) => updateSelected({ live: e.target.checked })}
                  />
                  Canlı reklam (görsel/link)
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Başlık</span>
                <input
                  className={inputClass}
                  value={selected.headline}
                  onChange={(e) => updateSelected({ headline: e.target.value })}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Metin</span>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={selected.body}
                  onChange={(e) => updateSelected({ body: e.target.value })}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Buton yazısı</span>
                <input
                  className={inputClass}
                  value={selected.cta}
                  onChange={(e) => updateSelected({ cta: e.target.value })}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Bağlantı (WhatsApp veya web)</span>
                <input
                  className={inputClass}
                  value={selected.href ?? ''}
                  onChange={(e) => updateSelected({ href: e.target.value || null })}
                  placeholder={adsContactHref()}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Görsel URL (canlı reklam)</span>
                <input
                  className={inputClass}
                  value={selected.image_url ?? ''}
                  onChange={(e) => updateSelected({ image_url: e.target.value || null })}
                  placeholder="https://…"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Sponsor adı (isteğe bağlı)</span>
                <input
                  className={inputClass}
                  value={selected.sponsor ?? ''}
                  onChange={(e) => updateSelected({ sponsor: e.target.value || null })}
                />
              </label>
              <p className="text-xs text-ink-500">Ölçü: {selected.size_label}</p>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className={btnPrimary} disabled={saving}>
                  {saving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
                <Link to="/" className={btnSecondary}>
                  Sitede bak
                </Link>
              </div>
            </form>
          ) : null}
        </div>
      )}
    </>
  );
}
