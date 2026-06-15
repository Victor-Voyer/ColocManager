import { useState } from 'react'
import {
  formatMemberName,
  formatTaskDate,
  getTaskPriority,
  getTaskRecurrence,
  getTaskStatus,
} from '../../utils/taskUtils'
import Modal from '../Modal/Modal.jsx'
import TaskForm from '../TaskForm/TaskForm.jsx'
import './TaskDetailModal.css'

function TaskDetailModal({
  isOpen,
  onClose,
  task,
  members,
  onUpdate,
  onComplete,
  onDeleteRequest,
  isSubmitting,
  formError,
  clearFormError,
}) {
  const [mode, setMode] = useState('view')
  const [isCompleting, setIsCompleting] = useState(false)

  const handleClose = () => {
    setMode('view')
    clearFormError()
    onClose()
  }

  const handleUpdate = async (payload) => {
    const updated = await onUpdate(task.id, payload)
    if (updated) {
      setMode('view')
    }
  }

  const handleComplete = async () => {
    if (task.status === 'done') {
      return
    }

    setIsCompleting(true)
    try {
      await onComplete(task.id)
    } finally {
      setIsCompleting(false)
    }
  }

  if (!task) {
    return null
  }

  const status = getTaskStatus(task.status)
  const priority = getTaskPriority(task.priority)
  const isCompleted = task.status === 'done'
  const title = mode === 'edit' ? 'Modifier la tâche' : 'Détail de la tâche'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} wide>
      {mode === 'edit' ? (
        <div className="modal__body">
          <TaskForm
            task={task}
            members={members}
            onSubmit={handleUpdate}
            onCancel={() => {
              setMode('view')
              clearFormError()
            }}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </div>
      ) : (
        <>
          <div className="modal__body">
            <div className="task-detail__meta">
              <div>
                <span className="task-detail__label">Titre</span>
                <p className="task-detail__value task-detail__title">
                  {task.title}
                </p>
              </div>
              <div>
                <span className="task-detail__label">Statut</span>
                <p className="task-detail__value">
                  <span className={`badge badge--${status.variant}`}>
                    {status.label}
                  </span>
                </p>
              </div>
              <div>
                <span className="task-detail__label">Assignée à</span>
                <p className="task-detail__value">
                  {formatMemberName(task.assignedTo)}
                </p>
              </div>
              <div>
                <span className="task-detail__label">Echéance</span>
                <p className="task-detail__value">
                  {formatTaskDate(task.dueDate)}
                </p>
              </div>
              <div>
                <span className="task-detail__label">Priorité</span>
                <p className="task-detail__value">
                  <span className={`badge badge--${priority.variant}`}>
                    {priority.label}
                  </span>
                </p>
              </div>
              <div>
                <span className="task-detail__label">Récurrence</span>
                <p className="task-detail__value">
                  {getTaskRecurrence(task.recurrence)}
                </p>
              </div>
            </div>

            <div className="task-detail__section">
              <span className="task-detail__label">Description</span>
              <p className="task-detail__description">
                {task.description || 'Aucune description.'}
              </p>
            </div>

            {task.rotationMembers.length > 0 && (
              <div className="task-detail__section">
                <span className="task-detail__label">Rotation</span>
                <ol className="task-detail__rotation">
                  {task.rotationMembers.map((member) => (
                    <li key={member.userId}>
                      {member.firstName} {member.lastName}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <footer className="modal__footer task-detail__actions">
            <button
              type="button"
              className="btn btn--neutral"
              onClick={() => onDeleteRequest(task)}
            >
              Supprimer
            </button>
            <button
              type="button"
              className="btn btn--neutral"
              onClick={() => {
                clearFormError()
                setMode('edit')
              }}
            >
              Modifier
            </button>
            <button
              type="button"
              className="btn btn--primary task-detail__complete-btn"
              disabled={isCompleted || isCompleting}
              onClick={handleComplete}
            >
              {isCompleting ? 'Validation...' : 'Marquer comme terminée'}
            </button>
          </footer>
        </>
      )}
    </Modal>
  )
}

export default TaskDetailModal
