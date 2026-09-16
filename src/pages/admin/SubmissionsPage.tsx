import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ImageField } from '../../components/admin/ImageField';
import { useToast } from '../../context/ToastContext';
import {
  deleteSubmission,
  fetchCategories,
  fetchSubmissions,
  parseSubmissionPhoto,
  updateSubmission,
  updateSubmissionStatus,
} from '../../lib/api';
import { splitFullName } from '../../lib/slug';
import { formatDateTimeTr } from '../../lib/format';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import type { BiographySubmission, Category, PersonFormValues, SubmissionStatus } from '../../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface EditState {
  full_name: string;
  email: string;
  category_id: string;
  profession: string;
  birth_place: string;
  biography: string;
  notes: string;
}

function emptyEdit(): EditState {
  return {
    full_name: '',
    email: '',
    category_id: '',
    profession: '',
    birth_place: '',
    biography: '',
    notes: '',
  };
}

export function SubmissionsPage() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubmissionStatus | 'all'>('pending');
  const [items, setItems] = useState<BiographySubmission[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<BiographySubmission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>(emptyEdit());
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSubmissions(status)
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch(() => notify('Başvurular yüklenemedi. 003 numaralı SQL dosyasını çalıştırın.', 'error'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, notify]);

  useEffect(() => {
    if (!editPhotoFile) return;
    const url = URL.createObjectURL(editPhotoFile);
    setEditPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editPhotoFile]);

  function startEdit(item: BiographySubmission) {
    const parsed = parseSubmissionPhoto(item);
    setEditingId(item.id);
    setEdit({
      full_name: item.full_name,
      email: item.email ?? '',
      category_id: item.category_id ?? '',
      profession: item.profession ?? '',
      birth_place: item.birth_place ?? '',
      biography: item.biography,
      notes: parsed.notes ?? '',
    });
    setEditPhotoFile(null);
    setEditPhotoPreview(parsed.photoUrl);
    setClearPhoto(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(emptyEdit());
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setClearPhoto(false);
  }

  function openAsPerson(item: BiographySubmission) {
    const parsed = parseSubmissionPhoto(item);
    const names = splitFullName(item.full_name);
    const draft: Partial<PersonFormValues> = {
      first_name: names.first_name,
      last_name: names.last_name,
      display_name: item.full_name,
      biography: item.biography
        .split(/\n+/)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join(''),
      short_bio: item.biography.slice(0, 220),
      profession: item.profession ?? '',
      birth_place: item.birth_place ?? '',
      category_id: item.category_id ?? '',
      source_description: parsed.notes ?? '',
      status: 'draft',
    };
    void updateSubmissionStatus(item.id, 'approved').catch(() => undefined);
    navigate('/admin/simalar/yeni', {
      state: { draft, submissionId: item.id, photoUrl: parsed.photoUrl, photoPath: parsed.photoPath },
    });
  }

  async function reject(item: BiographySubmission) {
    try {
      await updateSubmissionStatus(item.id, 'rejected');
      setItems((current) =>
        status === 'pending'
          ? current.filter((row) => row.id !== item.id)
          : current.map((row) => (row.id === item.id ? { ...row, status: 'rejected' } : row))
      );
      if (editingId === item.id) cancelEdit();
      notify('Başvuru reddedildi.', 'success');
    } catch {
      notify('Durum güncellenemedi.', 'error');
    }
  }

  async function saveEdit(event: FormEvent, item: BiographySubmission) {
    event.preventDefault();
    if (edit.full_name.trim().length < 3 || edit.biography.trim().length < 40) {
      notify('Ad soyad ve biyografi metni gereklidir.', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await updateSubmission(
        item.id,
        {
          full_name: edit.full_name,
          email: edit.email,
          category_id: edit.category_id || null,
          profession: edit.profession,
          birth_place: edit.birth_place,
          biography: edit.biography,
          notes: edit.notes,
        },
        { photo: editPhotoFile, clearPhoto: clearPhoto && !editPhotoFile, current: item }
      );
      setItems((current) => current.map((row) => (row.id === item.id ? saved : row)));
      cancelEdit();
      notify('Başvuru güncellendi.', 'success');
    } catch {
      notify('Başvuru kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteSubmission(toDelete.id);
      setItems((current) => current.filter((row) => row.id !== toDelete.id));
      if (editingId === toDelete.id) cancelEdit();
      notify('Başvuru silindi.', 'success');
      setToDelete(null);
    } catch {
      notify('Silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Seo title="Biyografi başvuruları" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Başvurular</h1>
          <p className="mt-1 text-sm text-ink-500">Gönderilen biyografiler onay, düzenleme veya silme için burada durur.</p>
        </div>
        <select
          className="rounded-sm border border-cream-300 bg-white px-3 py-2.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus | 'all')}
        >
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylanan</option>
          <option value="rejected">Reddedilen</option>
          <option value="all">Tümü</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="h-40 animate-pulse rounded-lg bg-cream-100" />
        ) : items.length === 0 ? (
          <p className="text-sm text-ink-500">Bu durumda başvuru yok.</p>
        ) : (
          items.map((item) => {
            const parsed = parseSubmissionPhoto(item);
            const isEditing = editingId === item.id;
            return (
              <article key={item.id} className="border border-cream-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    {parsed.photoUrl ? (
                      <img
                        src={parsed.photoUrl}
                        alt=""
                        className="h-28 w-20 shrink-0 object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl text-ink-900">{item.full_name}</h2>
                      <p className="mt-1 text-sm text-ink-500">
                        {item.category?.name || 'Bölümsüz'}
                        {item.profession ? ` · ${item.profession}` : ''}
                        {item.birth_place ? ` · ${item.birth_place}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-ink-500">
                        {formatDateTimeTr(item.created_at)}
                        {item.email ? ` · ${item.email}` : ''}
                        {` · ${item.status === 'pending' ? 'Onay bekliyor' : item.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btnSecondary} onClick={() => (isEditing ? cancelEdit() : startEdit(item))}>
                      {isEditing ? 'Vazgeç' : 'Düzenle'}
                    </button>
                    <button type="button" className={btnSecondary} onClick={() => openAsPerson(item)}>
                      Kişi olarak ekle
                    </button>
                    {item.status === 'pending' ? (
                      <button type="button" className={btnSecondary} onClick={() => void reject(item)}>
                        Reddet
                      </button>
                    ) : null}
                    <button type="button" className={btnSecondary} onClick={() => setToDelete(item)}>
                      Sil
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <form className="mt-5 space-y-4 border-t border-cream-200 pt-5" onSubmit={(event) => void saveEdit(event, item)}>
                    <label className="block">
                      <span className={labelClass}>Ad soyad</span>
                      <input
                        className={inputClass}
                        value={edit.full_name}
                        onChange={(e) => setEdit((current) => ({ ...current, full_name: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>İletişim e-postası</span>
                      <input
                        className={inputClass}
                        type="email"
                        value={edit.email}
                        onChange={(e) => setEdit((current) => ({ ...current, email: e.target.value }))}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Bölüm</span>
                      <select
                        className={inputClass}
                        value={edit.category_id}
                        onChange={(e) => setEdit((current) => ({ ...current, category_id: e.target.value }))}
                      >
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
                        <input
                          className={inputClass}
                          value={edit.profession}
                          onChange={(e) => setEdit((current) => ({ ...current, profession: e.target.value }))}
                        />
                      </label>
                      <label className="block">
                        <span className={labelClass}>Doğum yeri</span>
                        <input
                          className={inputClass}
                          value={edit.birth_place}
                          onChange={(e) => setEdit((current) => ({ ...current, birth_place: e.target.value }))}
                        />
                      </label>
                    </div>
                    <ImageField
                      label="Vesikalık fotoğraf"
                      src={clearPhoto && !editPhotoFile ? null : editPhotoPreview}
                      frameClassName="h-48 w-36"
                      onSelect={(file) => {
                        setClearPhoto(false);
                        setEditPhotoFile(file);
                      }}
                      onClear={() => {
                        setEditPhotoFile(null);
                        setEditPhotoPreview(null);
                        setClearPhoto(true);
                      }}
                    />
                    <label className="block">
                      <span className={labelClass}>Biyografi</span>
                      <textarea
                        className={inputClass}
                        rows={10}
                        value={edit.biography}
                        onChange={(e) => setEdit((current) => ({ ...current, biography: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Kaynak veya not</span>
                      <textarea
                        className={inputClass}
                        rows={3}
                        value={edit.notes}
                        onChange={(e) => setEdit((current) => ({ ...current, notes: e.target.value }))}
                      />
                    </label>
                    <button type="submit" className={btnPrimary} disabled={saving}>
                      {saving ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-700">{item.biography}</p>
                    {parsed.notes ? <p className="mt-3 text-sm text-ink-500">Not: {parsed.notes}</p> : null}
                  </>
                )}
              </article>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Başvuruyu sil"
        message="Bu başvuruyu silmek istediğinizden emin misiniz?"
        onClose={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
      />
    </>
  );
}
