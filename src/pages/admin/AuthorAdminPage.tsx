import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ImageField } from '../../components/admin/ImageField';
import { BookCover } from '../../components/author/BookCover';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { useToast } from '../../context/ToastContext';
import { fetchAuthorBooks, fetchAuthorProfile } from '../../lib/api';
import {
  clearAuthorBookCover,
  clearAuthorPhoto,
  createAuthorBook,
  deleteAuthorBook,
  setAuthorBookCover,
  setAuthorPhoto,
  uniqueAuthorBookSlug,
  updateAuthorBook,
  upsertAuthorProfile,
} from '../../lib/admin';
import { AUTHOR_NAME, AUTHOR_PAGE_PATH, DEFAULT_AUTHOR_BIOGRAPHY, DEFAULT_AUTHOR_SHORT_BIO, DEFAULT_AUTHOR_TITLE } from '../../lib/constants';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import type { AuthorBook, AuthorBookFormValues, AuthorProfile } from '../../types';

const emptyBookForm = (): AuthorBookFormValues => ({
  title: '',
  year: '',
  publisher: '',
  description: '',
  published: true,
});

export function AuthorAdminPage() {
  const { notify } = useToast();
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [fullName, setFullName] = useState(AUTHOR_NAME);
  const [title, setTitle] = useState(DEFAULT_AUTHOR_TITLE);
  const [shortBio, setShortBio] = useState(DEFAULT_AUTHOR_SHORT_BIO);
  const [biography, setBiography] = useState(DEFAULT_AUTHOR_BIOGRAPHY);
  const [birthDate, setBirthDate] = useState('1969-05-23');
  const [birthPlace, setBirthPlace] = useState('Gümüşhane');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [books, setBooks] = useState<AuthorBook[]>([]);
  const [editingBook, setEditingBook] = useState<AuthorBook | null>(null);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [bookForm, setBookForm] = useState<AuthorBookFormValues>(emptyBookForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [clearCover, setClearCover] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [toDelete, setToDelete] = useState<AuthorBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function reload() {
    try {
      const [nextProfile, nextBooks] = await Promise.all([
        fetchAuthorProfile(),
        fetchAuthorBooks({ includeUnpublished: true }),
      ]);
      if (nextProfile) {
        setProfile(nextProfile);
        setFullName(nextProfile.full_name || AUTHOR_NAME);
        setTitle(nextProfile.title || '');
        setShortBio(nextProfile.short_bio || '');
        setBiography(nextProfile.biography || '');
        setBirthDate(nextProfile.birth_date || '');
        setBirthPlace(nextProfile.birth_place || '');
      }
      setBooks(nextBooks);
    } catch {
      notify('İsmail Hayal bilgileri yüklenemedi.', 'error');
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const saved = await upsertAuthorProfile({
        full_name: fullName,
        title,
        short_bio: shortBio,
        biography,
        birth_date: birthDate,
        birth_place: birthPlace,
      });
      setProfile(saved);
      if (clearPhoto) {
        await clearAuthorPhoto(saved.photo_path ?? profile?.photo_path);
      } else if (photoFile) {
        await setAuthorPhoto(photoFile, saved.photo_path ?? profile?.photo_path);
      }
      setPhotoFile(null);
      setPhotoPreview(null);
      setClearPhoto(false);
      await reload();
      notify('Özgeçmiş kaydedildi.', 'success');
    } catch {
      notify('Özgeçmiş kaydedilemedi.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function openNewBook() {
    setEditingBook(null);
    setBookForm(emptyBookForm());
    setCoverFile(null);
    setCoverPreview(null);
    setClearCover(false);
    setBookFormOpen(true);
  }

  function openEditBook(book: AuthorBook) {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      year: book.year?.toString() ?? '',
      publisher: book.publisher ?? '',
      description: book.description ?? '',
      published: book.published,
    });
    setCoverFile(null);
    setCoverPreview(null);
    setClearCover(false);
    setBookFormOpen(true);
  }

  async function saveBook() {
    if (!bookForm.title.trim()) {
      notify('Kitap adı zorunludur.', 'error');
      return;
    }
    setSavingBook(true);
    try {
      const slug = await uniqueAuthorBookSlug(bookForm.title, editingBook?.id);
      const saved = editingBook
        ? await updateAuthorBook(editingBook.id, bookForm, slug, editingBook.sort_order)
        : await createAuthorBook(bookForm, slug);

      if (clearCover) {
        await clearAuthorBookCover(saved.id, saved.cover_path);
      } else if (coverFile) {
        await setAuthorBookCover(saved.id, coverFile, saved.cover_path);
      }

      setBookFormOpen(false);
      setEditingBook(null);
      setCoverFile(null);
      setCoverPreview(null);
      await reload();
      notify(editingBook ? 'Kitap güncellendi.' : 'Kitap eklendi.', 'success');
    } catch {
      notify('Kitap kaydedilemedi.', 'error');
    } finally {
      setSavingBook(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAuthorBook(toDelete);
      setToDelete(null);
      await reload();
      notify('Kitap silindi.', 'success');
    } catch {
      notify('Kitap silinemedi.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const photoSrc = clearPhoto ? null : photoPreview || profile?.photo_url || null;
  const coverSrc = clearCover ? null : coverPreview || editingBook?.cover_url || null;

  return (
    <>
      <Seo title="Kitaplarım" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Kitaplarım</h1>
          <p className="mt-1 text-sm text-ink-500">
            Kitapları buradan ekleyin. Özgeçmiş Hakkında sayfasında görünür.
          </p>
        </div>
        <Link to={AUTHOR_PAGE_PATH} className="text-sm text-burgundy-700 hover:underline">
          Sayfayı gör
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-ink-900">Hakkında / özgeçmiş</h2>
        <p className="mt-1 text-sm text-ink-500">Bu bölüm sitede Hakkında sayfasında gösterilir.</p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void saveProfile();
          }}
        >
          <ImageField
            label="Fotoğraf"
            src={photoSrc}
            frameClassName="h-40 w-32"
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
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Unvan</span>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Doğum tarihi</span>
              <input
                type="date"
                className={inputClass}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Doğum yeri</span>
              <input className={inputClass} value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className={labelClass}>Kısa tanıtım</span>
            <textarea className={inputClass} rows={3} value={shortBio} onChange={(e) => setShortBio(e.target.value)} />
          </label>
          <div>
            <span className={labelClass}>Özgeçmiş</span>
            <RichTextEditor value={biography} onChange={setBiography} placeholder="Özgeçmişi yazın…" />
          </div>
          <button type="submit" className={btnPrimary} disabled={savingProfile}>
            {savingProfile ? 'Kaydediliyor…' : 'Özgeçmişi kaydet'}
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-2xl text-ink-900">Kitaplar</h2>
          <button type="button" className={btnPrimary} onClick={openNewBook}>
            <Plus className="h-4 w-4" />
            Yeni kitap
          </button>
        </div>

        {bookFormOpen ? (
          <form
            className="mt-6 space-y-4 border border-cream-200 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveBook();
            }}
          >
            <h3 className="font-serif text-xl">{editingBook ? 'Kitabı düzenle' : 'Yeni kitap'}</h3>
            <ImageField
              label="Kapak fotoğrafı"
              src={coverSrc}
              frameClassName="h-48 w-32"
              onSelect={(file) => {
                setClearCover(false);
                setCoverFile(file);
                setCoverPreview(file ? URL.createObjectURL(file) : null);
              }}
              onClear={() => {
                setCoverFile(null);
                setCoverPreview(null);
                setClearCover(true);
              }}
            />
            <label className="block">
              <span className={labelClass}>Kitap adı</span>
              <input
                className={inputClass}
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Yıl</span>
                <input
                  className={inputClass}
                  value={bookForm.year}
                  onChange={(e) => setBookForm({ ...bookForm, year: e.target.value })}
                  inputMode="numeric"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Yayınevi</span>
                <input
                  className={inputClass}
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Açıklama</span>
              <textarea
                className={inputClass}
                rows={4}
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={bookForm.published}
                onChange={(e) => setBookForm({ ...bookForm, published: e.target.checked })}
              />
              Sitede göster
            </label>
            <div className="flex gap-2">
              <button type="submit" className={btnPrimary} disabled={savingBook}>
                {savingBook ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setBookFormOpen(false);
                  setEditingBook(null);
                }}
              >
                Vazgeç
              </button>
            </div>
          </form>
        ) : null}

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <li key={book.id} className="border border-cream-200">
              <div className="aspect-[2/3] bg-cream-100">
                <BookCover book={book} />
              </div>
              <div className="p-3">
                <p className="font-medium text-ink-900">{book.title}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {[book.year, book.publisher].filter(Boolean).join(' · ') || 'Yıl belirtilmedi'}
                  {book.published ? '' : ' · Taslak'}
                </p>
                <div className="mt-3 flex gap-2">
                  <button type="button" className={btnSecondary} onClick={() => openEditBook(book)}>
                    <Pencil className="h-4 w-4" />
                    Düzenle
                  </button>
                  <button type="button" className={btnSecondary} onClick={() => setToDelete(book)}>
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Kitabı sil"
        message={toDelete ? `"${toDelete.title}" silinsin mi?` : ''}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
        loading={deleting}
      />
    </>
  );
}
