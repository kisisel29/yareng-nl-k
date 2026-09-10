import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ImageField } from '../../components/admin/ImageField';
import { ColumnistAvatar } from '../../components/columnists/ColumnistAvatar';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { useToast } from '../../context/ToastContext';
import { fetchColumnists } from '../../lib/api';
import {
  createColumnist,
  createColumnistArticle,
  deleteColumnist,
  deleteColumnistArticle,
  updateColumnist,
  updateColumnistArticle,
} from '../../lib/admin';
import { COLUMNISTS_PAGE_PATH } from '../../lib/constants';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import { formatDateTimeTr } from '../../lib/format';
import type { Columnist, ColumnistArticle, ColumnistArticleFormValues, ColumnistFormValues } from '../../types';

const emptyColumnistForm = (): ColumnistFormValues => ({
  name: '',
  title: '',
  published: true,
});

const emptyArticleForm = (): ColumnistArticleFormValues => ({
  title: '',
  body: '',
  published: true,
});

export function ColumnistsAdminPage() {
  const { notify } = useToast();
  const [columnists, setColumnists] = useState<Columnist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [columnistFormOpen, setColumnistFormOpen] = useState(false);
  const [editingColumnist, setEditingColumnist] = useState<Columnist | null>(null);
  const [columnistForm, setColumnistForm] = useState<ColumnistFormValues>(emptyColumnistForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [savingColumnist, setSavingColumnist] = useState(false);
  const [toDeleteColumnist, setToDeleteColumnist] = useState<Columnist | null>(null);

  const [articleFormOpen, setArticleFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ColumnistArticle | null>(null);
  const [articleForm, setArticleForm] = useState<ColumnistArticleFormValues>(emptyArticleForm);
  const [savingArticle, setSavingArticle] = useState(false);
  const [toDeleteArticle, setToDeleteArticle] = useState<ColumnistArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selected = columnists.find((item) => item.id === selectedId) ?? null;
  const photoSrc = clearPhoto ? null : photoPreview || editingColumnist?.photo_url || null;

  async function reload(nextSelectedId?: string | null) {
    const next = await fetchColumnists({ includeUnpublished: true });
    setColumnists(next);
    const preferred = nextSelectedId === undefined ? selectedId : nextSelectedId;
    setSelectedId(preferred && next.some((item) => item.id === preferred) ? preferred : next[0]?.id ?? null);
  }

  useEffect(() => {
    fetchColumnists({ includeUnpublished: true })
      .then((next) => {
        setColumnists(next);
        setSelectedId(next[0]?.id ?? null);
      })
      .catch(() => notify('Köşe yazarları yüklenemedi.', 'error'));
  }, [notify]);

  function openNewColumnist() {
    setEditingColumnist(null);
    setColumnistForm(emptyColumnistForm());
    setPhotoFile(null);
    setPhotoPreview(null);
    setClearPhoto(false);
    setColumnistFormOpen(true);
  }

  function openEditColumnist(columnist: Columnist) {
    setEditingColumnist(columnist);
    setColumnistForm({
      name: columnist.name,
      title: columnist.title ?? '',
      published: columnist.published,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setClearPhoto(false);
    setColumnistFormOpen(true);
  }

  async function saveColumnist() {
    if (!columnistForm.name.trim()) {
      notify('Yazar adı zorunludur.', 'error');
      return;
    }
    setSavingColumnist(true);
    try {
      const saved = editingColumnist
        ? await updateColumnist(editingColumnist.id, columnistForm, photoFile, clearPhoto)
        : await createColumnist(columnistForm, photoFile);
      setColumnistFormOpen(false);
      setEditingColumnist(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      await reload(saved.id);
      notify(editingColumnist ? 'Köşe yazarı güncellendi.' : 'Köşe yazarı eklendi.', 'success');
    } catch {
      notify('Köşe yazarı kaydedilemedi.', 'error');
    } finally {
      setSavingColumnist(false);
    }
  }

  function openNewArticle() {
    setEditingArticle(null);
    setArticleForm(emptyArticleForm());
    setArticleFormOpen(true);
  }

  function openEditArticle(article: ColumnistArticle) {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      body: article.body,
      published: article.published,
    });
    setArticleFormOpen(true);
  }

  async function saveArticle() {
    if (!selected) return;
    if (!articleForm.title.trim()) {
      notify('Yazı başlığı zorunludur.', 'error');
      return;
    }
    setSavingArticle(true);
    try {
      if (editingArticle) {
        await updateColumnistArticle(selected.id, editingArticle.id, articleForm);
      } else {
        await createColumnistArticle(selected.id, articleForm);
      }
      setArticleFormOpen(false);
      setEditingArticle(null);
      await reload();
      notify(editingArticle ? 'Yazı güncellendi.' : 'Yazı eklendi.', 'success');
    } catch {
      notify('Yazı kaydedilemedi.', 'error');
    } finally {
      setSavingArticle(false);
    }
  }

  async function confirmDeleteColumnist() {
    if (!toDeleteColumnist) return;
    setDeleting(true);
    try {
      await deleteColumnist(toDeleteColumnist);
      setToDeleteColumnist(null);
      setColumnistFormOpen(false);
      await reload(null);
      notify('Köşe yazarı silindi.', 'success');
    } catch {
      notify('Köşe yazarı silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function confirmDeleteArticle() {
    if (!selected || !toDeleteArticle) return;
    setDeleting(true);
    try {
      await deleteColumnistArticle(selected.id, toDeleteArticle.id);
      setToDeleteArticle(null);
      setArticleFormOpen(false);
      await reload();
      notify('Yazı silindi.', 'success');
    } catch {
      notify('Yazı silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Seo title="Köşe Yazarları" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Köşe Yazarları</h1>
          <p className="mt-1 text-sm text-ink-500">Yazar ekleyin, fotoğraf yükleyin ve yazılarını yönetin.</p>
        </div>
        <Link to={COLUMNISTS_PAGE_PATH} className="text-sm text-burgundy-700 hover:underline">
          Sayfayı gör
        </Link>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[20rem_1fr]">
        <section className="rounded-lg border border-cream-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl text-ink-900">Yazarlar</h2>
            <button type="button" className={btnPrimary} onClick={openNewColumnist}>
              <Plus className="h-4 w-4" />
              Yeni yazar
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {columnists.map((columnist) => (
              <li key={columnist.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(columnist.id);
                    setArticleFormOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left ${
                    selectedId === columnist.id ? 'bg-cream-100' : 'hover:bg-cream-50'
                  }`}
                >
                  <ColumnistAvatar columnist={columnist} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-900">{columnist.name}</span>
                    <span className="text-xs text-ink-500">
                      {columnist.articles.length} yazı{columnist.published ? '' : ' · Gizli'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {columnists.length === 0 ? <p className="mt-4 text-sm text-ink-500">Henüz yazar yok.</p> : null}
        </section>

        <div className="space-y-8">
          {columnistFormOpen ? (
            <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
              <h2 className="font-serif text-2xl text-ink-900">
                {editingColumnist ? 'Yazarı düzenle' : 'Yeni köşe yazarı'}
              </h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveColumnist();
                }}
              >
                <ImageField
                  label="Küçük fotoğraf"
                  hint="Yuvarlak görünecek. JPG, PNG veya WEBP."
                  src={photoSrc}
                  frameClassName="h-24 w-24 rounded-full"
                  onSelect={(file) => {
                    setClearPhoto(false);
                    setPhotoFile(file);
                    setPhotoPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  onClear={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setClearPhoto(true);
                  }}
                />
                <label className="block">
                  <span className={labelClass}>Ad soyad</span>
                  <input
                    className={inputClass}
                    value={columnistForm.name}
                    onChange={(e) => setColumnistForm({ ...columnistForm, name: e.target.value })}
                    required
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Unvan (isteğe bağlı)</span>
                  <input
                    className={inputClass}
                    value={columnistForm.title}
                    onChange={(e) => setColumnistForm({ ...columnistForm, title: e.target.value })}
                    placeholder="Köşe yazarı"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={columnistForm.published}
                    onChange={(e) => setColumnistForm({ ...columnistForm, published: e.target.checked })}
                  />
                  Sitede göster
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className={btnPrimary} disabled={savingColumnist}>
                    {savingColumnist ? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => {
                      setColumnistFormOpen(false);
                      setEditingColumnist(null);
                    }}
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {selected ? (
            <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <ColumnistAvatar columnist={selected} />
                  <div>
                    <h2 className="font-serif text-2xl text-ink-900">{selected.name}</h2>
                    <p className="text-sm text-ink-500">{selected.title || 'Köşe yazarı'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnSecondary} onClick={() => openEditColumnist(selected)}>
                    <Pencil className="h-4 w-4" />
                    Yazarı düzenle
                  </button>
                  <button type="button" className={btnSecondary} onClick={() => setToDeleteColumnist(selected)}>
                    <Trash2 className="h-4 w-4" />
                    Yazarı sil
                  </button>
                  <button type="button" className={btnPrimary} onClick={openNewArticle}>
                    <Plus className="h-4 w-4" />
                    Yeni yazı
                  </button>
                </div>
              </div>

              {articleFormOpen ? (
                <form
                  className="mt-6 space-y-4 border border-cream-200 p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveArticle();
                  }}
                >
                  <h3 className="font-serif text-xl">{editingArticle ? 'Yazıyı düzenle' : 'Yeni yazı'}</h3>
                  <label className="block">
                    <span className={labelClass}>Başlık</span>
                    <input
                      className={inputClass}
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      required
                    />
                  </label>
                  <div>
                    <span className={labelClass}>Yazı</span>
                    <RichTextEditor
                      key={editingArticle?.id ?? 'new-article'}
                      value={articleForm.body}
                      onChange={(body) => setArticleForm((current) => ({ ...current, body }))}
                      placeholder="Köşe yazısını yazın…"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={articleForm.published}
                      onChange={(e) => setArticleForm({ ...articleForm, published: e.target.checked })}
                    />
                    Sitede göster
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className={btnPrimary} disabled={savingArticle}>
                      {savingArticle ? 'Kaydediliyor…' : 'Kaydet'}
                    </button>
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => {
                        setArticleFormOpen(false);
                        setEditingArticle(null);
                      }}
                    >
                      Vazgeç
                    </button>
                  </div>
                </form>
              ) : null}

              <ul className="mt-6 divide-y divide-cream-200 border-t border-cream-200">
                {selected.articles.map((article) => (
                  <li key={article.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-ink-900">{article.title}</p>
                      <p className="text-sm text-ink-500">
                        {formatDateTimeTr(article.created_at)}
                        {article.published ? '' : ' · Taslak'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className={btnSecondary} onClick={() => openEditArticle(article)}>
                        <Pencil className="h-4 w-4" />
                        Düzenle
                      </button>
                      <button type="button" className={btnSecondary} onClick={() => setToDeleteArticle(article)}>
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {selected.articles.length === 0 && !articleFormOpen ? (
                <p className="mt-4 text-sm text-ink-500">Bu yazarın henüz yazısı yok.</p>
              ) : null}
            </section>
          ) : (
            <p className="text-sm text-ink-500">Yazı eklemek için önce bir köşe yazarı seçin veya yeni yazar ekleyin.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(toDeleteColumnist)}
        title="Köşe yazarını sil"
        message={
          toDeleteColumnist
            ? `"${toDeleteColumnist.name}" ve tüm yazıları silinsin mi? Bu işlem geri alınamaz.`
            : ''
        }
        onConfirm={() => void confirmDeleteColumnist()}
        onClose={() => setToDeleteColumnist(null)}
        loading={deleting}
      />
      <ConfirmDialog
        open={Boolean(toDeleteArticle)}
        title="Yazıyı sil"
        message={toDeleteArticle ? `"${toDeleteArticle.title}" silinsin mi?` : ''}
        onConfirm={() => void confirmDeleteArticle()}
        onClose={() => setToDeleteArticle(null)}
        loading={deleting}
      />
    </>
  );
}
