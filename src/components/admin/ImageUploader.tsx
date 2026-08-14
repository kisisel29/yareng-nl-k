import { ImagePlus, Trash2 } from 'lucide-react';
import { PersonPlaceholder } from '../people/PersonPlaceholder';
import { btnGhost } from '../../lib/cn';
import type { Person, PersonImage } from '../../types';

interface ImageUploaderProps {
  person?: Person | null;
  profilePreview: string | null;
  galleryPreviews: { id: string; url: string; caption?: string }[];
  existingGallery: PersonImage[];
  onProfileSelect: (file: File | null) => void;
  onGallerySelect: (files: FileList | null) => void;
  onRemoveExisting: (image: PersonImage) => void;
  onRemovePreview: (id: string) => void;
  onClearProfile: () => void;
}

export function ImageUploader({
  person,
  profilePreview,
  galleryPreviews,
  existingGallery,
  onProfileSelect,
  onGallerySelect,
  onRemoveExisting,
  onRemovePreview,
  onClearProfile,
}: ImageUploaderProps) {
  const profileSrc = profilePreview || person?.profile_image_url || null;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-700">Profil fotoğrafı</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-40 w-40 overflow-hidden rounded-md border border-cream-300 bg-cream-100">
            {profileSrc ? (
              <img src={profileSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <PersonPlaceholder person={person ?? undefined} className="h-full w-full" />
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cream-300 bg-white px-3 py-2 text-sm">
              <ImagePlus className="h-4 w-4" />
              Fotoğraf seç
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(event) => onProfileSelect(event.target.files?.[0] ?? null)}
              />
            </label>
            {profileSrc ? (
              <button type="button" className={btnGhost} onClick={onClearProfile}>
                <Trash2 className="h-4 w-4" />
                Kaldır
              </button>
            ) : null}
            <p className="text-xs text-ink-500">JPG, PNG veya WEBP. En fazla 5 MB. Görseller web için optimize edilir.</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-700">Ek fotoğraflar</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cream-300 bg-white px-3 py-2 text-sm">
          <ImagePlus className="h-4 w-4" />
          Galeriye ekle
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(event) => onGallerySelect(event.target.files)}
          />
        </label>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {existingGallery.map((image) => (
            <figure key={image.id} className="relative overflow-hidden rounded-md border border-cream-200">
              <img src={image.image_url} alt="" className="h-28 w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-white/90 p-1"
                onClick={() => onRemoveExisting(image)}
                aria-label="Görseli sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </figure>
          ))}
          {galleryPreviews.map((image) => (
            <figure key={image.id} className="relative overflow-hidden rounded-md border border-cream-200">
              <img src={image.url} alt="" className="h-28 w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-white/90 p-1"
                onClick={() => onRemovePreview(image.id)}
                aria-label="Görseli kaldır"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
