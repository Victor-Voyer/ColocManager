import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  canChangeTaskStatus,
  canManageTask,
  formatMemberName,
  formatTaskDate,
  getTaskPriority,
  getTaskStatus,
  TASK_STATUS_OPTIONS,
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
  onStatusChange,
  onDeleteRequest,
  isSubmitting,
  formError,
  clearFormError,
}) {
  const [mode, setMode] = useState('view')
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const { user } = useAuth()

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

  const handleStatusChange = async (status) => {
    setIsChangingStatus(true)
    try {
      await onStatusChange(task.id, status)
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (!task) {
    return null
  }

  const status = getTaskStatus(task.status)
  const priority = getTaskPriority(task.priority)
  const canChangeStatus = canChangeTaskStatus(task, user)
  const canManage = canManageTask(task, user)
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
            <div className="detail-modal__meta">
              <div>
                <span className="detail-modal__label">Titre</span>
                <p className="detail-modal__value task-detail__title">
                  {task.title}
                </p>
              </div>
              <div>
                <span className="detail-modal__label">Statut</span>
                {canChangeStatus ? (
                  <select
                    className="task-detail__status-select"
                    value={task.status}
                    disabled={isChangingStatus}
                    onChange={(event) => handleStatusChange(event.target.value)}
                  >
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="detail-modal__value">
                    <span className={`badge badge--${status.variant}`}>
                      {status.label}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <span className="detail-modal__label">Assignée à</span>
                <p className="detail-modal__value">
                  {formatMemberName(task.assignedTo)}
                </p>
              </div>
              <div>
                <span className="detail-modal__label">Échéance</span>
                <p className="detail-modal__value">
                  {formatTaskDate(task.dueDate)}
                </p>
              </div>
              <div>
                <span className="detail-modal__label">Priorité</span>
                <p className="detail-modal__value">
                  <span className={`badge badge--${priority.variant}`}>
                    {priority.label}
                  </span>
                </p>
              </div>
            </div>

            <div className="task-detail__section">
              <span className="detail-modal__label">Description</span>
              <p className="task-detail__description">
                {task.description || 'Aucune description.'}
              </p>
            </div>
          </div>

          {canManage && (
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
            </footer>
          )}
        </>
      )}
    </Modal>
  )
}

export default TaskDetailModal
