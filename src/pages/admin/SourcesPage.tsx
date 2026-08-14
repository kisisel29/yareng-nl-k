import { useEffect, useState } from 'react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { fetchAllSources } from '../../lib/api';
import { deleteSource, updateSource } from '../../lib/admin';
import { personName } from '../../lib/format';
import { btnPrimary, btnSecondary, inputClass } from '../../lib/cn';
import type { Person, Source } from '../../types';

type SourceRow = Source & {
  person: Pick<Person, 'id' | 'first_name' | 'last_name' | 'display_name' | 'slug'> | null;
};

export function SourcesPage() {
  const { notify } = useToast();
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [editing, setEditing] = useState<SourceRow | null>(null);
  const [toDelete, setToDelete] = useState<SourceRow | null>(null);
  const [form, setForm] = useState({
    author: '',
    book_title: '',
    edition_year: '',
    page_number: '',
    extra_source: '',
    description: '',
  });

  async function reload() {
    const data = await fetchAllSources();
    setSources(data);
  }

  useEffect(() => {
    reload().catch(() => notify('Kaynaklar yüklenemedi.', 'error'));
  }, [notify]);

  async function save() {
    if (!editing) return;
    try {
      await updateSource(editing.id, {
        author: form.author || null,
        book_title: form.book_title || null,
        edition_year: form.edition_year ? Number(form.edition_year) : null,
        page_number: form.page_number || null,
        extra_source: form.extra_source || null,
        description: form.description || null,
      });
      notify('Kaynak güncellendi.', 'success');
      setEditing(null);
      await reload();
    } catch {
      notify('Kaynak kaydedilemedi.', 'error');
    }
  }

  return (
    <>
      <Seo title="Kaynaklar" noindex />
      <h1 className="font-serif text-3xl text-ink-900">Kaynaklar</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">
        Kişi kayıtlarına bağlı kaynak bilgileri. Varsayılan kitap bilgisi Ayarlar sayfasından düzenlenebilir.
      </p>
      <div className="mt-6 space-y-3">
        {sources.map((source) => (
          <article key={source.id} className="rounded-lg border border-cream-200 bg-white p-4">
            <p className="font-medium text-ink-900">
              {source.person ? personName(source.person) : 'Kişi silinmiş'}
            </p>
            <p className="mt-1 text-sm text-ink-600">
              {[source.author, source.book_title, source.edition_year, source.page_number && `s. ${source.page_number}`]
                .filter(Boolean)
                .join(', ') || 'Kaynak ayrıntısı yok'}
            </p>
            <div className="mt-3 flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditing(source);
                  setForm({
                    author: source.author ?? '',
                    book_title: source.book_title ?? '',
                    edition_year: source.edition_year?.toString() ?? '',
                    page_number: source.page_number ?? '',
                    extra_source: source.extra_source ?? '',
                    description: source.description ?? '',
                  });
                }}
              >
                Düzenle
              </button>
              <button type="button" onClick={() => setToDelete(source)}>
                Sil
              </button>
            </div>
          </article>
        ))}
        {sources.length === 0 ? <p className="text-sm text-ink-500">Henüz kaynak kaydı yok.</p> : null}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-ink-900/40" onClick={() => setEditing(null)} />
          <form
            className="relative w-full max-w-lg space-y-3 rounded-lg bg-white p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <h2 className="font-serif text-2xl">Kaynağı düzenle</h2>
            <input className={inputClass} placeholder="Yazar" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <input className={inputClass} placeholder="Kitap adı" value={form.book_title} onChange={(e) => setForm({ ...form, book_title: e.target.value })} />
            <input className={inputClass} placeholder="Baskı yılı" value={form.edition_year} onChange={(e) => setForm({ ...form, edition_year: e.target.value })} />
            <input className={inputClass} placeholder="Sayfa" value={form.page_number} onChange={(e) => setForm({ ...form, page_number: e.target.value })} />
            <input className={inputClass} placeholder="Ek kaynak" value={form.extra_source} onChange={(e) => setForm({ ...form, extra_source: e.target.value })} />
            <input className={inputClass} placeholder="Açıklama" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>
                Vazgeç
              </button>
              <button type="submit" className={btnPrimary}>
                Kaydet
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Kaynağı sil"
        message="Bu kaynağı silmek istediğinizden emin misiniz?"
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          void deleteSource(toDelete.id)
            .then(async () => {
              notify('Kaynak silindi.', 'success');
              setToDelete(null);
              await reload();
            })
            .catch(() => notify('Kaynak silinemedi.', 'error'));
        }}
      />
    </>
  );
}
