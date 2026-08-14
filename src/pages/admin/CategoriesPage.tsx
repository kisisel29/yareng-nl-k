import { useEffect, useState } from 'react';
import { Seo } from '../../components/seo/Seo';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { fetchCategories } from '../../lib/api';
import { createCategory, deleteCategory, updateCategory } from '../../lib/admin';
import { slugify } from '../../lib/slug';
import { btnPrimary, btnSecondary, inputClass } from '../../lib/cn';
import type { Category } from '../../types';

export function CategoriesPage() {
  const { notify } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  async function reload() {
    const data = await fetchCategories();
    setCategories(data);
  }

  useEffect(() => {
    reload().catch(() => notify('Kategoriler yüklenemedi.', 'error'));
  }, [notify]);

  async function handleSave() {
    if (!name.trim()) {
      notify('Kategori adı zorunludur.', 'error');
      return;
    }
    const payload = {
      name: name.trim(),
      slug: slugify(slug || name),
      description: description.trim() || null,
      sort_order: editing?.sort_order ?? categories.length + 1,
    };
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        notify('Kategori güncellendi.', 'success');
      } else {
        await createCategory(payload);
        notify('Kategori eklendi.', 'success');
      }
      setName('');
      setSlug('');
      setDescription('');
      setEditing(null);
      await reload();
    } catch {
      notify('Kategori kaydedilemedi. Slug benzersiz olmalı.', 'error');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete.id);
      notify('Kategori silindi.', 'success');
      setToDelete(null);
      await reload();
    } catch {
      notify('Kategori silinemedi.', 'error');
    }
  }

  return (
    <>
      <Seo title="Kategoriler" noindex />
      <h1 className="font-serif text-3xl text-ink-900">Kategoriler</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[20rem_1fr]">
        <form
          className="space-y-3 rounded-lg border border-cream-200 bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <h2 className="font-serif text-xl">{editing ? 'Kategoriyi düzenle' : 'Yeni kategori'}</h2>
          <input
            className={inputClass}
            placeholder="Ad"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editing) setSlug(slugify(e.target.value));
            }}
          />
          <input className={inputClass} placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <textarea
            className={inputClass}
            placeholder="Açıklama"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" className={btnPrimary}>
              Kaydet
            </button>
            {editing ? (
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setEditing(null);
                  setName('');
                  setSlug('');
                  setDescription('');
                }}
              >
                Vazgeç
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-lg border border-cream-200 bg-white px-4 py-3">
              <div>
                <p className="font-medium text-ink-900">{category.name}</p>
                <p className="text-xs text-ink-500">{category.slug}</p>
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(category);
                    setName(category.name);
                    setSlug(category.slug);
                    setDescription(category.description ?? '');
                  }}
                >
                  Düzenle
                </button>
                <button type="button" onClick={() => setToDelete(category)}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Kategoriyi sil"
        message="Bu kategoriyi silmek istediğinizden emin misiniz? Bağlı kişiler kategorisiz kalır."
        onClose={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
