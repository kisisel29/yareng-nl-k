import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { deleteSubmission, fetchSubmissions, updateSubmissionStatus } from '../../lib/api';
import { splitFullName } from '../../lib/slug';
import { formatDateTimeTr } from '../../lib/format';
import { btnSecondary } from '../../lib/cn';
import type { BiographySubmission, PersonFormValues, SubmissionStatus } from '../../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function SubmissionsPage() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubmissionStatus | 'all'>('pending');
  const [items, setItems] = useState<BiographySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<BiographySubmission | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  function openAsPerson(item: BiographySubmission) {
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
      source_description: item.notes ?? '',
      status: 'draft',
    };
    void updateSubmissionStatus(item.id, 'approved').catch(() => undefined);
    navigate('/admin/simalar/yeni', { state: { draft, submissionId: item.id } });
  }

  async function reject(item: BiographySubmission) {
    try {
      await updateSubmissionStatus(item.id, 'rejected');
      setItems((current) =>
        status === 'pending' ? current.filter((row) => row.id !== item.id) : current.map((row) => (row.id === item.id ? { ...row, status: 'rejected' } : row))
      );
      notify('Başvuru reddedildi.', 'success');
    } catch {
      notify('Durum güncellenemedi.', 'error');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteSubmission(toDelete.id);
      setItems((current) => current.filter((row) => row.id !== toDelete.id));
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
          <p className="mt-1 text-sm text-ink-500">Ziyaretçilerin gönderdiği biyografiler</p>
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
          items.map((item) => (
            <article key={item.id} className="border border-cream-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                    {` · ${item.status === 'pending' ? 'Bekliyor' : item.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-700">{item.biography}</p>
              {item.notes ? <p className="mt-3 text-sm text-ink-500">Not: {item.notes}</p> : null}
            </article>
          ))
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
