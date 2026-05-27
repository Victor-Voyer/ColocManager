import Modal from '../Modal/Modal.jsx'
import './ConfirmDialog.css'

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="modal__body">
        <p className="confirm-dialog__message">{message}</p>
      </div>
      <footer className="modal__footer">
        <button
          type="button"
          className="btn btn--neutral"
          onClick={onClose}
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="button"
          className="btn confirm-dialog__danger"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Suppression…' : confirmLabel}
        </button>
      </footer>
    </Modal>
  )
}

export default ConfirmDialog
