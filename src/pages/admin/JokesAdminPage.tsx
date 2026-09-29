import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { fetchJokes } from '../../lib/api';
import { createJoke, deleteJoke, updateJoke } from '../../lib/admin';
import { JOKES_PAGE_PATH } from '../../lib/constants';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import type { Joke, JokeFormValues } from '../../types';

const emptyForm = (): JokeFormValues => ({
  title: '',
  body: '',
  published: true,
});

export function JokesAdminPage() {
  const { notify } = useToast();
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Joke | null>(null);
  const [form, setForm] = useState<JokeFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Joke | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function reload() {
    setJokes(await fetchJokes({ includeUnpublished: true }));
  }

  useEffect(() => {
    reload().catch(() => notify('Fıkralar yüklenemedi.', 'error'));
  }, [notify]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEdit(joke: Joke) {
    setEditing(joke);
    setForm({ title: joke.title, body: joke.body, published: joke.published });
    setFormOpen(true);
  }

  async function save() {
    if (!form.title.trim()) {
      notify('Fıkra başlığı zorunludur.', 'error');
      return;
    }
    if (!form.body.trim()) {
      notify('Fıkra metni zorunludur.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateJoke(editing.id, form);
      else await createJoke(form);
      setFormOpen(false);
      setEditing(null);
      await reload();
      notify(editing ? 'Fıkra güncellendi.' : 'Fıkra eklendi.', 'success');
    } catch {
      notify('Fıkra kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteJoke(toDelete);
      setToDelete(null);
      setFormOpen(false);
      await reload();
      notify('Fıkra silindi.', 'success');
    } catch {
      notify('Fıkra silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Seo title="Gümüşhane Fıkraları" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Gümüşhane Fıkraları</h1>
          <p className="mt-1 text-sm text-ink-500">Sitede görünecek fıkraları buradan ekleyin ve düzenleyin.</p>
        </div>
        <Link to={JOKES_PAGE_PATH} className="text-sm text-burgundy-700 hover:underline">
          Sayfayı gör
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-ink-900">Fıkra listesi</h2>
          <button type="button" className={btnPrimary} onClick={openNew}>
            <Plus className="h-4 w-4" />
            Yeni fıkra
          </button>
        </div>

        {formOpen ? (
          <form
            className="mt-6 space-y-4 border border-cream-200 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <h3 className="font-serif text-xl">{editing ? 'Fıkrayı düzenle' : 'Yeni fıkra'}</h3>
            <label className="block">
              <span className={labelClass}>Başlık</span>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Fıkra</span>
              <textarea
                className={`${inputClass} min-h-[12rem] font-serif leading-loose`}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Fıkrayı yazın…"
                required
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Sitede göster
            </label>
            <div className="flex gap-2">
              <button type="submit" className={btnPrimary} disabled={saving}>
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                Vazgeç
              </button>
            </div>
          </form>
        ) : null}

        <ul className="mt-6 divide-y divide-cream-200 border-t border-cream-200">
          {jokes.map((joke) => (
            <li key={joke.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-ink-900">{joke.title}</p>
                <p className="text-sm text-ink-500">{joke.published ? 'Yayında' : 'Taslak'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnSecondary} onClick={() => openEdit(joke)}>
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </button>
                <button type="button" className={btnSecondary} onClick={() => setToDelete(joke)}>
                  <Trash2 className="h-4 w-4" />
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
        {jokes.length === 0 && !formOpen ? (
          <p className="mt-4 text-sm text-ink-500">Henüz fıkra eklenmedi.</p>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Fıkrayı sil"
        message={toDelete ? `"${toDelete.title}" silinsin mi?` : ''}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
        loading={deleting}
      />
    </>
  );
}
