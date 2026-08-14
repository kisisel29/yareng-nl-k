import { btnDanger, btnSecondary } from '../../lib/cn';
import { Modal } from '../ui/Modal';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Sil',
  onConfirm,
  onClose,
  loading = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-relaxed text-ink-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className={btnSecondary} onClick={onClose} disabled={loading}>
          Vazgeç
        </button>
        <button type="button" className={btnDanger} onClick={onConfirm} disabled={loading}>
          {loading ? 'İşleniyor…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
