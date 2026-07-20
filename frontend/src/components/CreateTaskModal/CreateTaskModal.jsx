import Modal from '../Modal/Modal.jsx'
import TaskForm from '../TaskForm/TaskForm.jsx'

function CreateTaskModal({
  isOpen,
  onClose,
  members = [],
  onSubmit,
  isSubmitting = false,
  error = '',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle tâche">
      <div className="modal__body">
        <TaskForm
          members={members}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </Modal>
  )
}

export default CreateTaskModal
