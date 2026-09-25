import { ImagePlus, Trash2 } from 'lucide-react';
import { btnGhost } from '../../lib/cn';

export function ImageField({
  label,
  hint = 'Şeffaf arka plan için PNG veya WEBP. JPG opak kalır. En fazla 5 MB.',
  src,
  onSelect,
  onClear,
  frameClassName = 'h-40 w-32',
}: {
  label: string;
  hint?: string;
  src: string | null;
  onSelect: (file: File | null) => void;
  onClear: () => void;
  frameClassName?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-700">{label}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`overflow-hidden rounded-md border border-cream-300 bg-[length:16px_16px] bg-[linear-gradient(45deg,#e2ddd3_25%,transparent_25%,transparent_75%,#e2ddd3_75%,#e2ddd3),linear-gradient(45deg,#e2ddd3_25%,#f7f5f0_25%,#f7f5f0_75%,#e2ddd3_75%,#e2ddd3)] bg-[position:0_0,8px_8px] ${frameClassName}`}
        >
          {src ? <img src={src} alt="" className="h-full w-full object-contain object-bottom" /> : null}
        </div>
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-cream-300 bg-white px-3 py-2 text-sm">
            <ImagePlus className="h-4 w-4" />
            Fotoğraf seç
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
            />
          </label>
          {src ? (
            <button type="button" className={btnGhost} onClick={onClear}>
              <Trash2 className="h-4 w-4" />
              Kaldır
            </button>
          ) : null}
          <p className="text-xs text-ink-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}
