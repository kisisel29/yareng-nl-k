import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PersonForm, type PersonFormExtras } from '../../components/admin/PersonForm';
import { Seo } from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import { fetchCategories, fetchPersonById, fetchSiteSettings } from '../../lib/api';
import {
  addGalleryImage,
  clearProfileImage,
  createPerson,
  deleteGalleryImage,
  setProfileImage,
  updatePerson,
} from '../../lib/admin';
import type { Category, Person, PersonFormValues } from '../../types';

export function PersonFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();
  const [person, setPerson] = useState<Person | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaults, setDefaults] = useState({ author: '', book: '', year: '' });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([]);
        notify(
          'Kategoriler yüklenemedi. Supabase SQL Editor’de 001_initial_schema.sql dosyasını çalıştırmanız gerekiyor.',
          'error'
        );
      });
    fetchSiteSettings()
      .then((settings) =>
        setDefaults({
          author: settings.default_source_author ?? '',
          book: settings.default_source_book ?? '',
          year: settings.default_source_year ?? '',
        })
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetchPersonById(id)
      .then((result) => {
        if (!active) return;
        if (!result) {
          notify('Kişi bulunamadı.', 'error');
          navigate('/admin/simalar');
          return;
        }
        setPerson(result);
      })
      .catch(() => notify('Kişi yüklenemedi.', 'error'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, navigate, notify]);

  async function handleSubmit(values: PersonFormValues, extras: PersonFormExtras) {
    setSaving(true);
    try {
      const saved = isEdit && person
        ? await updatePerson(person.id, values, person.sources?.[0])
        : await createPerson(values);

      if (extras.clearProfile) {
        await clearProfileImage(saved.id, person?.profile_image_path);
      } else if (extras.profileFile) {
        await setProfileImage(saved.id, extras.profileFile, person?.profile_image_path);
      }

      for (const image of extras.removedGallery) {
        await deleteGalleryImage(image.id, image.storage_path);
      }
      for (const file of extras.galleryFiles) {
        await addGalleryImage(saved.id, file);
      }

      notify(values.status === 'published' ? 'Kişi yayınlandı.' : 'Kişi kaydedildi.', 'success');
      navigate('/admin/simalar');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kayıt kaydedilemedi.';
      notify(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-lg bg-cream-100" />;
  }

  return (
    <>
      <Seo title={isEdit ? 'Kişiyi düzenle' : 'Yeni kişi'} noindex />
      <h1 className="mb-6 font-serif text-3xl text-ink-900">
        {isEdit ? 'Kişiyi düzenle' : 'Yeni kişi ekle'}
      </h1>
      <PersonForm
        person={person}
        categories={categories}
        defaultSource={defaults}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </>
  );
}
