import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ImageField } from '../../components/admin/ImageField';
import { useToast } from '../../context/ToastContext';
import { fetchNews } from '../../lib/api';
import { createNews, deleteNews, updateNews } from '../../lib/admin';
import { NEWS_PAGE_PATH } from '../../lib/constants';
import { formatDateTimeTr } from '../../lib/format';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import type { NewsFormValues, NewsItem } from '../../types';

const emptyForm = (): NewsFormValues => ({
  title: '',
  body: '',
  published: true,
});

export function NewsAdminPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<NewsFormValues>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const imageSrc = clearImage ? null : imagePreview || editing?.image_url || null;

  async function reload() {
    setItems(await fetchNews({ includeUnpublished: true }));
  }

  useEffect(() => {
    reload().catch(() => notify('Haberler yüklenemedi.', 'error'));
  }, [notify]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    setImagePreview(null);
    setClearImage(false);
    setFormOpen(true);
  }

  function openEdit(item: NewsItem) {
    setEditing(item);
    setForm({ title: item.title, body: item.body, published: item.published });
    setImageFile(null);
    setImagePreview(null);
    setClearImage(false);
    setFormOpen(true);
  }

  async function save() {
    if (!form.title.trim()) {
      notify('Haber başlığı zorunludur.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateNews(editing.id, form, imageFile, clearImage);
      } else {
        await createNews(form, imageFile);
      }
      setFormOpen(false);
      setEditing(null);
      await reload();
      notify(editing ? 'Haber güncellendi.' : 'Haber eklendi.', 'success');
    } catch {
      notify('Haber kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteNews(toDelete);
      setToDelete(null);
      setFormOpen(false);
      await reload();
      notify('Haber silindi.', 'success');
    } catch {
      notify('Haber silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Seo title="Haberler" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Haberler</h1>
          <p className="mt-1 text-sm text-ink-500">Gümüşhaneli simalardan haber ekleyin; fotoğraf ve yazı ekleyebilirsiniz.</p>
        </div>
        <Link to={NEWS_PAGE_PATH} className="text-sm text-burgundy-700 hover:underline">
          Sayfayı gör
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl text-ink-900">Haber listesi</h2>
          <button type="button" className={btnPrimary} onClick={openNew}>
            <Plus className="h-4 w-4" />
            Yeni haber
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
            <h3 className="font-serif text-xl">{editing ? 'Haberi düzenle' : 'Yeni haber'}</h3>
            <ImageField
              label="Haber fotoğrafı"
              src={imageSrc}
              frameClassName="h-40 w-full max-w-md"
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
              <span className={labelClass}>Haber metni</span>
              <textarea
                className={`${inputClass} min-h-[14rem] leading-relaxed`}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Haberi yazın… Linkler için https:// ile başlayan adresi aynen yapıştırın; sitede tıklanabilir olur."
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
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-24 overflow-hidden bg-cream-100">
                  {item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div>
                  <p className="font-medium text-ink-900">{item.title}</p>
                  <p className="text-sm text-ink-500">
                    {item.published ? 'Yayında' : 'Taslak'}
                    {item.created_at ? ` · ${formatDateTimeTr(item.created_at)}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnSecondary} onClick={() => openEdit(item)}>
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </button>
                <button type="button" className={btnSecondary} onClick={() => setToDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && !formOpen ? (
          <p className="mt-4 text-sm text-ink-500">Henüz haber eklenmedi.</p>
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Haberi sil"
        message={toDelete ? `"${toDelete.title}" silinsin mi?` : ''}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
        loading={deleting}
      />
    </>
  );
}
