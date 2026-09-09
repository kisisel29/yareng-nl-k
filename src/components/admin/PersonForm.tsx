import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Category, Person, PersonFormValues, PersonImage, PersonStatus } from '../../types';
import { GENDER_OPTIONS } from '../../lib/constants';
import { slugify } from '../../lib/slug';
import { slugExists } from '../../lib/api';
import { personExtraNotes } from '../../lib/format';
import { btnPrimary, btnSecondary, inputClass, labelClass } from '../../lib/cn';
import { RichTextEditor } from '../ui/RichTextEditor';
import { ImageUploader } from './ImageUploader';

interface PersonFormProps {
  person?: Person | null;
  draft?: Partial<PersonFormValues>;
  categories: Category[];
  defaultSource?: { author: string; book: string; year: string };
  saving: boolean;
  onSubmit: (values: PersonFormValues, extras: PersonFormExtras) => Promise<void>;
}

export interface PersonFormExtras {
  profileFile: File | null;
  galleryFiles: File[];
  removedGallery: PersonImage[];
  clearProfile: boolean;
}

const emptyValues = (defaults?: PersonFormProps['defaultSource']): PersonFormValues => ({
  first_name: '',
  last_name: '',
  display_name: '',
  slug: '',
  gender: '',
  short_bio: '',
  biography: '',
  education: '',
  positions: '',
  works: '',
  notable_works: '',
  contributions: '',
  birth_date: '',
  death_date: '',
  birth_place: '',
  district: '',
  profession: '',
  title: '',
  category_id: '',
  featured: false,
  status: 'draft',
  source_author: defaults?.author ?? '',
  source_book_title: defaults?.book ?? '',
  source_edition_year: defaults?.year ?? '',
  source_page_number: '',
  source_extra: '',
  source_description: '',
});

function personToValues(person: Person): PersonFormValues {
  const source = person.sources?.[0];
  return {
    first_name: person.first_name,
    last_name: person.last_name,
    display_name: person.display_name ?? '',
    slug: person.slug,
    gender: person.gender ?? '',
    short_bio: person.short_bio ?? '',
    biography: person.biography ?? '',
    education: personExtraNotes(person),
    positions: '',
    works: '',
    notable_works: '',
    contributions: '',
    birth_date: person.birth_date ?? '',
    death_date: person.death_date ?? '',
    birth_place: person.birth_place ?? '',
    district: person.district ?? '',
    profession: person.profession ?? '',
    title: person.title ?? '',
    category_id: person.category_id ?? '',
    featured: person.featured,
    status: person.status,
    source_author: source?.author ?? '',
    source_book_title: source?.book_title ?? '',
    source_edition_year: source?.edition_year?.toString() ?? '',
    source_page_number: source?.page_number ?? '',
    source_extra: source?.extra_source ?? '',
    source_description: source?.description ?? '',
  };
}

export function PersonForm({ person, draft, categories, defaultSource, saving, onSubmit }: PersonFormProps) {
  const [values, setValues] = useState<PersonFormValues>(() =>
    person ? personToValues(person) : { ...emptyValues(defaultSource), ...draft }
  );
  const [slugManual, setSlugManual] = useState(Boolean(person));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [clearProfile, setClearProfile] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<{ id: string; file: File; url: string }[]>([]);
  const [existingGallery, setExistingGallery] = useState<PersonImage[]>(person?.images ?? []);
  const [removedGallery, setRemovedGallery] = useState<PersonImage[]>([]);

  useEffect(() => {
    if (person) {
      setValues(personToValues(person));
      setExistingGallery(person.images ?? []);
    }
  }, [person]);

  useEffect(() => {
    if (person || !defaultSource) return;
    setValues((current) => ({
      ...current,
      source_author: current.source_author || defaultSource.author,
      source_book_title: current.source_book_title || defaultSource.book,
      source_edition_year: current.source_edition_year || defaultSource.year,
    }));
  }, [defaultSource, person]);

  useEffect(() => {
    if (slugManual) return;
    const base = values.display_name.trim() || `${values.first_name} ${values.last_name}`;
    setValues((current) => ({ ...current, slug: slugify(base) }));
  }, [values.first_name, values.last_name, values.display_name, slugManual]);

  const galleryPreviews = useMemo(
    () => galleryFiles.map((item) => ({ id: item.id, url: item.url })),
    [galleryFiles]
  );

  function update<K extends keyof PersonFormValues>(key: K, value: PersonFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function validate(nextStatus: PersonStatus): Promise<boolean> {
    const nextErrors: Record<string, string> = {};
    if (!values.first_name.trim()) nextErrors.first_name = 'Ad zorunludur.';
    if (!values.last_name.trim()) nextErrors.last_name = 'Soyad zorunludur.';
    if (!values.slug.trim()) nextErrors.slug = 'Slug zorunludur.';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
      nextErrors.slug = 'Slug yalnızca küçük harf, rakam ve tire içerebilir.';
    } else {
      const taken = await slugExists(values.slug, person?.id);
      if (taken) nextErrors.slug = 'Bu slug zaten kullanılıyor.';
    }
    if (nextStatus === 'published' && !values.short_bio.trim() && !values.biography.trim()) {
      nextErrors.short_bio = 'Yayınlamak için kısa tanıtım veya biyografi girin.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(status: PersonStatus) {
    const payload = { ...values, status };
    if (!(await validate(status))) return;
    await onSubmit(payload, {
      profileFile,
      galleryFiles: galleryFiles.map((item) => item.file),
      removedGallery,
      clearProfile,
    });
  }

  return (
    <form
      className="space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(values.status);
      }}
    >
      <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-ink-900">Temel Bilgiler</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Ad" error={errors.first_name}>
            <input
              className={inputClass}
              value={values.first_name}
              onChange={(e) => update('first_name', e.target.value)}
            />
          </Field>
          <Field label="Soyad" error={errors.last_name}>
            <input
              className={inputClass}
              value={values.last_name}
              onChange={(e) => update('last_name', e.target.value)}
            />
          </Field>
          <Field label="Tam ad / kullanılan isim">
            <input
              className={inputClass}
              value={values.display_name}
              onChange={(e) => update('display_name', e.target.value)}
            />
          </Field>
          <Field
            label="Sayfa adresi"
            error={errors.slug}
            hint="Ad ve soyaddan otomatik oluşur. Sitede /simalar/ismail-hayal gibi görünür."
          >
            <input
              className={inputClass}
              value={values.slug}
              onChange={(e) => {
                setSlugManual(true);
                update('slug', e.target.value);
              }}
            />
          </Field>
          <Field label="Cinsiyet">
            <select
              className={inputClass}
              value={values.gender}
              onChange={(e) => update('gender', e.target.value)}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value || 'none'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Kategori"
            hint={
              categories.length === 0
                ? 'Liste boş. Önce Supabase SQL şemasını çalıştırın veya Kategoriler menüsünden ekleyin.'
                : undefined
            }
          >
            <select
              className={inputClass}
              value={values.category_id}
              onChange={(e) => update('category_id', e.target.value)}
            >
              <option value="">Seçilmedi</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Doğum tarihi">
            <input
              type="date"
              className={inputClass}
              value={values.birth_date}
              onChange={(e) => update('birth_date', e.target.value)}
            />
          </Field>
          <Field label="Ölüm tarihi">
            <input
              type="date"
              className={inputClass}
              value={values.death_date}
              onChange={(e) => update('death_date', e.target.value)}
            />
          </Field>
          <Field label="Doğum yeri">
            <input
              className={inputClass}
              value={values.birth_place}
              onChange={(e) => update('birth_place', e.target.value)}
            />
          </Field>
          <Field label="İlçe">
            <input
              className={inputClass}
              value={values.district}
              onChange={(e) => update('district', e.target.value)}
            />
          </Field>
          <Field label="Meslek">
            <input
              className={inputClass}
              value={values.profession}
              onChange={(e) => update('profession', e.target.value)}
            />
          </Field>
          <Field label="Unvan">
            <input
              className={inputClass}
              value={values.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-ink-900">Tanıtım</h2>
        <div className="mt-5 space-y-4">
          <Field label="Kısa tanıtım" error={errors.short_bio}>
            <textarea
              className={inputClass}
              rows={3}
              value={values.short_bio}
              onChange={(e) => update('short_bio', e.target.value)}
            />
          </Field>
          <div>
            <span className={labelClass}>Uzun biyografi</span>
            <RichTextEditor value={values.biography} onChange={(html) => update('biography', html)} />
          </div>
          <Field
            label="Bilgiler"
            hint="Eğitim, görev, eser, önemli çalışmalar ve Gümüşhane'ye katkılar bu kutuya yazılır."
          >
            <textarea
              className={inputClass}
              rows={10}
              value={values.education}
              onChange={(e) => update('education', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-ink-900">Görseller</h2>
        <div className="mt-5">
          <ImageUploader
            person={person}
            profilePreview={clearProfile ? null : profilePreview}
            galleryPreviews={galleryPreviews}
            existingGallery={existingGallery}
            onProfileSelect={(file) => {
              setClearProfile(false);
              setProfileFile(file);
              setProfilePreview(file ? URL.createObjectURL(file) : null);
            }}
            onGallerySelect={(files) => {
              if (!files) return;
              const next = Array.from(files).map((file) => ({
                id: crypto.randomUUID(),
                file,
                url: URL.createObjectURL(file),
              }));
              setGalleryFiles((current) => [...current, ...next]);
            }}
            onRemoveExisting={(image) => {
              setExistingGallery((current) => current.filter((item) => item.id !== image.id));
              setRemovedGallery((current) => [...current, image]);
            }}
            onRemovePreview={(id) => {
              setGalleryFiles((current) => current.filter((item) => item.id !== id));
            }}
            onClearProfile={() => {
              setProfileFile(null);
              setProfilePreview(null);
              setClearProfile(true);
            }}
          />
        </div>
      </section>

      <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-ink-900">Kaynak</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Yazar">
            <input className={inputClass} value={values.source_author} onChange={(e) => update('source_author', e.target.value)} />
          </Field>
          <Field label="Kitap adı">
            <input className={inputClass} value={values.source_book_title} onChange={(e) => update('source_book_title', e.target.value)} />
          </Field>
          <Field label="Baskı yılı">
            <input className={inputClass} value={values.source_edition_year} onChange={(e) => update('source_edition_year', e.target.value)} />
          </Field>
          <Field label="Sayfa">
            <input className={inputClass} value={values.source_page_number} onChange={(e) => update('source_page_number', e.target.value)} />
          </Field>
          <Field label="Ek kaynak / not">
            <input className={inputClass} value={values.source_extra} onChange={(e) => update('source_extra', e.target.value)} />
          </Field>
          <Field label="Kaynak açıklaması">
            <input className={inputClass} value={values.source_description} onChange={(e) => update('source_description', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-cream-200 bg-white p-5 sm:p-6">
        <h2 className="font-serif text-2xl text-ink-900">Yayın</h2>
        <div className="mt-5 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => update('featured', e.target.checked)}
            />
            Öne çıkan
          </label>
          <p className="text-sm text-ink-500">
            Durum: {values.status === 'published' ? 'Yayında' : 'Taslak'}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" className={btnSecondary} disabled={saving} onClick={() => void submit('draft')}>
            Kaydet
          </button>
          <button type="button" className={btnPrimary} disabled={saving} onClick={() => void submit('published')}>
            Kaydet ve Yayınla
          </button>
        </div>
      </section>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-800">{error}</span> : null}
      {!error && hint ? <span className="mt-1 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}
