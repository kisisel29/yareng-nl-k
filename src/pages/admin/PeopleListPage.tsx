import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Eye, Pencil, Trash2, Upload } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { PersonPlaceholder } from '../../components/people/PersonPlaceholder';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchAdminPeople, fetchAllPeopleForExport, fetchCategories } from '../../lib/api';
import { deletePerson } from '../../lib/admin';
import { downloadCsv, peopleToCsv } from '../../lib/csv';
import { formatDateTimeTr, personName } from '../../lib/format';
import { btnSecondary, inputClass } from '../../lib/cn';
import { SEARCH_DEBOUNCE_MS } from '../../lib/constants';
import type { Category, Person } from '../../types';
import type { PersonStatusFilter } from '../../lib/api';

export function PeopleListPage() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [status, setStatus] = useState<PersonStatusFilter>('all');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debounced, status, categoryId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminPeople({
      query: debounced,
      status,
      categoryId: categoryId || undefined,
      page,
      pageSize,
    })
      .then((result) => {
        if (!active) return;
        setPeople(result.items);
        setTotal(result.total);
      })
      .catch(() => notify('Kişiler yüklenemedi.', 'error'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debounced, status, categoryId, page, notify]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deletePerson(toDelete);
      setPeople((current) => current.filter((item) => item.id !== toDelete.id));
      setTotal((value) => value - 1);
      notify('Kişi silindi.', 'success');
      setToDelete(null);
    } catch {
      notify('Silme işlemi başarısız.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function exportCsv() {
    try {
      const all = await fetchAllPeopleForExport();
      downloadCsv('gumushaneli-simalar.csv', peopleToCsv(all));
      notify('CSV indirildi.', 'success');
    } catch {
      notify('Dışa aktarma başarısız.', 'error');
    }
  }

  return (
    <>
      <Seo title="Simalar yönetimi" path="/admin/simalar" noindex />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Simalar</h1>
          <p className="mt-1 text-sm text-ink-500">{total} kayıt</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecondary} onClick={() => void exportCsv()}>
            <Download className="h-4 w-4" />
            CSV dışa aktar
          </button>
          <Link to="/admin/simalar/ice-aktar" className={btnSecondary}>
            <Upload className="h-4 w-4" />
            CSV'den içeri aktar
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input
          className={inputClass}
          placeholder="Ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as PersonStatusFilter)}>
          <option value="all">Tüm durumlar</option>
          <option value="published">Yayında</option>
          <option value="draft">Taslak</option>
        </select>
        <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Tüm kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-cream-200 bg-white md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-cream-100 text-ink-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fotoğraf</th>
                    <th className="px-4 py-3 font-medium">Ad Soyad</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Meslek</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">Oluşturma</th>
                    <th className="px-4 py-3 font-medium">Güncelleme</th>
                    <th className="px-4 py-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.id} className="border-t border-cream-200">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 overflow-hidden rounded">
                          {person.profile_image_url ? (
                            <img src={person.profile_image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <PersonPlaceholder person={person} className="h-full w-full text-[10px]" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink-900">{personName(person)}</td>
                      <td className="px-4 py-3">{person.category?.name || '—'}</td>
                      <td className="px-4 py-3">{person.profession || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge person={person} />
                      </td>
                      <td className="px-4 py-3">{formatDateTimeTr(person.created_at)}</td>
                      <td className="px-4 py-3">{formatDateTimeTr(person.updated_at)}</td>
                      <td className="px-4 py-3">
                        <RowActions
                          onView={() => navigate(`/simalar/${person.slug}`)}
                          onEdit={() => navigate(`/admin/simalar/${person.id}/duzenle`)}
                          onDelete={() => setToDelete(person)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {people.map((person) => (
                <article key={person.id} className="rounded-lg border border-cream-200 bg-white p-4">
                  <div className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded">
                      {person.profile_image_url ? (
                        <img src={person.profile_image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PersonPlaceholder person={person} className="h-full w-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900">{personName(person)}</p>
                      <p className="text-sm text-ink-500">{person.category?.name || 'Kategorisiz'}</p>
                      <StatusBadge person={person} />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <RowActions
                      onView={() => navigate(`/simalar/${person.slug}`)}
                      onEdit={() => navigate(`/admin/simalar/${person.id}/duzenle`)}
                      onDelete={() => setToDelete(person)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Kişiyi sil"
        message="Bu kişiyi silmek istediğinizden emin misiniz?"
        onClose={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
      />
    </>
  );
}

function StatusBadge({ person }: { person: Person }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs ${person.status === 'published' ? 'text-emerald-800' : 'text-ink-500'}`}>
      {person.status === 'published' ? 'Yayında' : 'Taslak'}
      {person.featured ? <span className="text-burgundy-700">• Öne çıkan</span> : null}
    </span>
  );
}

function RowActions({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-1">
      <button type="button" className="rounded p-2 hover:bg-cream-100" onClick={onView} aria-label="Görüntüle">
        <Eye className="h-4 w-4" />
      </button>
      <button type="button" className="rounded p-2 hover:bg-cream-100" onClick={onEdit} aria-label="Düzenle">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" className="rounded p-2 hover:bg-cream-100" onClick={onDelete} aria-label="Sil">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
