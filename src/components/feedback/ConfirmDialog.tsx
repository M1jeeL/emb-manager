import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>

          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </Modal>
  );
}
