import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ImageField } from '../../components/admin/ImageField';
import { useToast } from '../../context/ToastContext';
import { fetchPoems } from '../../lib/api';
import { createPoem, deletePoem, updatePoem } from '../../lib/admin';
import { POEMS_PAGE_PATH } from '../../lib/constants';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import type { Poem, PoemFormValues } from '../../types';

const emptyForm = (): PoemFormValues => ({
  title: '',
  body: '',
  published: true,
});

export function PoemsAdminPage() {
  const { notify } = useToast();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Poem | null>(null);
  const [form, setForm] = useState<PoemFormValues>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Poem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const imageSrc = clearImage ? null : imagePreview || editing?.image_url || null;

  async function reload() {
    setPoems(await fetchPoems({ includeUnpublished: true }));
  }

  useEffect(() => {
    reload().catch(() => notify('Şiirler yüklenemedi.', 'error'));
  }, [notify]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    setImagePreview(null);
    setClearImage(false);
    setFormOpen(true);
  }

  function openEdit(poem: Poem) {
    setEditing(poem);
    setForm({ title: poem.title, body: poem.body, published: poem.published });
    setImageFile(null);
    setImagePreview(null);
    setClearImage(false);
    setFormOpen(true);
  }

  async function save() {
    if (!form.title.trim()) {
      notify('Şiir başlığı zorunludur.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updatePoem(editing.id, form, imageFile, clearImage);
      } else {
        await createPoem(form, imageFile);
      }
      setFormOpen(false);
      setEditing(null);
      await reload();
      notify(editing ? 'Şiir güncellendi.' : 'Şiir eklendi.', 'success');
    } catch {
      notify('Şiir kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deletePoem(toDelete);
      setToDelete(null);
      setFormOpen(false);
      await reload();
      notify('Şiir silindi.', 'success');
    } catch {
      notify('Şiir silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Seo title="Şiirler" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Şiirler</h1>
          <p className="mt-1 text-sm text-ink-500">Solda görsel, sağda şiir metni olacak şekilde ekleyin.</p>
        </div>
        <Link to={POEMS_PAGE_PATH} className="text-sm text-burgundy-700 hover:underline">
          Sayfayı gör
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-ink-900">Şiir listesi</h2>
          <button type="button" className={btnPrimary} onClick={openNew}>
            <Plus className="h-4 w-4" />
            Yeni şiir
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
            <h3 className="font-serif text-xl">{editing ? 'Şiiri düzenle' : 'Yeni şiir'}</h3>
            <ImageField
              label="Fotoğraf / resim"
              src={imageSrc}
              frameClassName="h-56 w-40"
              onSelect={(file) => {
                setClearImage(false);
                setImageFile(file);
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }}
              onClear={() => {
                setImageFile(null);
                setImagePreview(null);
                setClearImage(true);
              }}
            />
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
              <span className={labelClass}>Şiir</span>
              <textarea
                className={`${inputClass} min-h-[16rem] font-serif leading-loose`}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Şiiri satır satır yazın…"
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
          {poems.map((poem) => (
            <li key={poem.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-12 overflow-hidden bg-cream-100">
                  {poem.image_url ? <img src={poem.image_url} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div>
                  <p className="font-medium text-ink-900">{poem.title}</p>
                  <p className="text-sm text-ink-500">{poem.published ? 'Yayında' : 'Taslak'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnSecondary} onClick={() => openEdit(poem)}>
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </button>
                <button type="button" className={btnSecondary} onClick={() => setToDelete(poem)}>
                  <Trash2 className="h-4 w-4" />
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
        {poems.length === 0 && !formOpen ? (
          <p className="mt-4 text-sm text-ink-500">Henüz şiir eklenmedi.</p>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Şiiri sil"
        message={toDelete ? `"${toDelete.title}" silinsin mi?` : ''}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
        loading={deleting}
      />
    </>
  );
}
