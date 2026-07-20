import ExpenseForm from '../ExpenseForm/ExpenseForm.jsx'
import Modal from '../Modal/Modal.jsx'

function CreateExpenseModal({
  isOpen,
  onClose,
  members = [],
  currentUserId,
  onSubmit,
  isSubmitting = false,
  error = '',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle dépense">
      <div className="modal__body">
        <ExpenseForm
          members={members}
          currentUserId={currentUserId}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </Modal>
  )
}

export default CreateExpenseModal
