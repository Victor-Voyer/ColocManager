import { useState } from 'react'
import {
  TASK_PRIORITY_OPTIONS,
  TASK_RECURRENCE_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '../../utils/taskUtils'
import './TaskForm.css'

function buildInitialState(task) {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      recurrence: task.recurrence,
      dueDate: task.dueDate ?? '',
      assignedToUserId: task.assignedTo ? String(task.assignedTo.id) : '',
      rotationMemberUserIds: task.rotationMembers.map((member) => member.userId),
    }
  }

  return {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    recurrence: 'none',
    dueDate: '',
    assignedToUserId: '',
    rotationMemberUserIds: [],
  }
}

function TaskForm({
  task = null,
  members = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = '',
}) {
  const [form, setForm] = useState(() => buildInitialState(task))

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleRotationMember = (userId) => {
    setForm((prev) => {
      const ids = prev.rotationMemberUserIds
      const next = ids.includes(userId)
        ? ids.filter((id) => id !== userId)
        : [...ids, userId]
      return { ...prev, rotationMemberUserIds: next }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const isRecurring = form.recurrence !== 'none'

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      recurrence: form.recurrence,
      dueDate: form.dueDate || null,
      assignedToUserId:
        !isRecurring && form.assignedToUserId
          ? Number(form.assignedToUserId)
          : null,
      rotationMemberUserIds: isRecurring ? form.rotationMemberUserIds : [],
    })
  }

  const isRecurring = form.recurrence !== 'none'

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="task-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="task-form__field">
        <label htmlFor="task-title">Titre</label>
        <input
          id="task-title"
          type="text"
          required
          maxLength={255}
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
        />
      </div>

      <div className="task-form__field">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          rows="3"
          maxLength={2000}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </div>

      <div className="task-form__row">
        <div className="task-form__field">
          <label htmlFor="task-status">Statut</label>
          <select
            id="task-status"
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="task-form__field">
          <label htmlFor="task-priority">Priorite</label>
          <select
            id="task-priority"
            value={form.priority}
            onChange={(event) => updateField('priority', event.target.value)}
          >
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="task-form__row">
        <div className="task-form__field">
          <label htmlFor="task-recurrence">Recurrence</label>
          <select
            id="task-recurrence"
            value={form.recurrence}
            onChange={(event) => updateField('recurrence', event.target.value)}
          >
            {TASK_RECURRENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="task-form__field">
          <label htmlFor="task-due-date">Echeance</label>
          <input
            id="task-due-date"
            type="date"
            value={form.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
          />
        </div>
      </div>

      {isRecurring ? (
        <div className="task-form__field">
          <label>Rotation</label>
          <p className="task-form__hint">
            L'ordre de selection détermine la rotation des membres.
          </p>
          <div className="task-form__members">
            {members.map((member) => (
              <label key={member.id} className="task-form__member">
                <input
                  type="checkbox"
                  checked={form.rotationMemberUserIds.includes(member.id)}
                  onChange={() => toggleRotationMember(member.id)}
                />
                {member.firstName} {member.lastName}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="task-form__field">
          <label htmlFor="task-assigned-to">Assigner à</label>
          <select
            id="task-assigned-to"
            value={form.assignedToUserId}
            onChange={(event) =>
              updateField('assignedToUserId', event.target.value)
            }
          >
            <option value="">Non assignée</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      <footer className="modal__footer">
        <button
          type="button"
          className="btn btn--neutral"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Enregistrement...'
            : task
              ? 'Enregistrer'
              : 'Ajouter'}
        </button>
      </footer>
    </form>
  )
}

export default TaskForm
