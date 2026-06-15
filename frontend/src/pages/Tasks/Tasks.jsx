import { useState } from 'react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import TaskDetailModal from '../../components/TaskDetailModal/TaskDetailModal.jsx'
import TaskForm from '../../components/TaskForm/TaskForm.jsx'
import TasksTable from '../../components/TasksTable/TasksTable.jsx'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useTasks'
import {
  formatMemberName,
  formatTaskDate,
  TASK_STATUS_OPTIONS,
} from '../../utils/taskUtils'
import './Tasks.css'

function Tasks() {
  const { user } = useAuth()
  const colocationId = user?.colocations?.[0]?.id

  const {
    tasks,
    history,
    members,
    filters,
    setFilters,
    isLoading,
    isHistoryLoading,
    error,
    formError,
    isSubmitting,
    isDeleting,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    clearFormError,
  } = useTasks(colocationId)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async (payload) => {
    const success = await createTask(payload)
    if (success) {
      setIsCreateOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) {
      return
    }

    const success = await deleteTask(taskToDelete.id)
    if (success) {
      setTaskToDelete(null)
      setSelectedTask(null)
    }
  }

  const handleTaskUpdated = async (taskId, payload) => {
    const updated = await updateTask(taskId, payload)
    if (updated) {
      setSelectedTask(updated)
    }
    return updated
  }

  const handleTaskCompleted = async (taskId) => {
    const updated = await completeTask(taskId)
    if (updated) {
      setSelectedTask(updated)
    }
    return updated
  }

  if (!colocationId) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Taches menageres</h1>
            <p>Rejoignez ou creez une colocation pour gerer les taches.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Taches menageres</h1>
          <p>Repartition equitable des corvees.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            clearFormError()
            setIsCreateOpen(true)
          }}
        >
          + Nouvelle tache
        </button>
      </div>

      {error && (
        <p className="tasks-page__error" role="alert">
          {error}
        </p>
      )}

      <div className="tasks-page__filters">
        <label>
          Statut
          <select
            value={filters.status}
            onChange={(event) =>
              handleFilterChange('status', event.target.value)
            }
          >
            <option value="">Tous</option>
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Membre
          <select
            value={filters.assignedTo}
            onChange={(event) =>
              handleFilterChange('assignedTo', event.target.value)
            }
          >
            <option value="">Tous</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <TasksTable
          tasks={tasks}
          isLoading={isLoading}
          onSelectTask={setSelectedTask}
        />
      </div>

      <section className="tasks-page__history">
        <h2>Dernieres taches terminees</h2>
        <div className="tasks-page__history-list">
          {isHistoryLoading ? (
            <p className="tasks-page__status">Chargement...</p>
          ) : history.length === 0 ? (
            <p className="tasks-page__status">Aucun historique pour le moment.</p>
          ) : (
            history.map((task) => (
              <button
                key={task.id}
                type="button"
                className="tasks-page__history-item"
                onClick={() => setSelectedTask(task)}
              >
                <span>{task.title}</span>
                <small>
                  {formatMemberName(task.assignedTo)} -{' '}
                  {formatTaskDate(task.dueDate, 'Sans echeance')}
                </small>
              </button>
            ))
          )}
        </div>
      </section>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouvelle tache"
      >
        <div className="modal__body">
          <TaskForm
            members={members}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </div>
      </Modal>

      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        members={members}
        onUpdate={handleTaskUpdated}
        onComplete={handleTaskCompleted}
        onDeleteRequest={setTaskToDelete}
        isSubmitting={isSubmitting}
        formError={formError}
        clearFormError={clearFormError}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la tache"
        message={`Supprimer "${taskToDelete?.title}" ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Tasks
