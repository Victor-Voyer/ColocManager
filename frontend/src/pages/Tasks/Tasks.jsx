import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ColocationRequired from '../../components/ColocationRequired/ColocationRequired.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import TaskDetailModal from '../../components/TaskDetailModal/TaskDetailModal.jsx'
import TaskForm from '../../components/TaskForm/TaskForm.jsx'
import TasksTable from '../../components/TasksTable/TasksTable.jsx'
import { useAuth } from '../../context/AuthContext'
import { useCrudPageState } from '../../hooks/useCrudPageState'
import { useTasks } from '../../hooks/useTasks'
import { formatMemberName, formatTaskDate } from '../../utils/taskUtils'
import './Tasks.css'

function Tasks() {
  const { user } = useAuth()
  const colocationId = user?.colocation?.id

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
    updateTaskStatus,
    deleteTask,
    clearFormError,
  } = useTasks(colocationId)

  const {
    isCreateOpen,
    openCreate,
    closeCreate,
    selectedItem: selectedTask,
    setSelectedItem: setSelectedTask,
    itemToDelete: taskToDelete,
    requestDelete: setTaskToDelete,
    cancelDelete,
    completeDelete,
  } = useCrudPageState()

  const [completingTaskId, setCompletingTaskId] = useState(null)

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async (payload) => {
    const success = await createTask(payload)
    if (success) {
      closeCreate()
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) {
      return
    }

    const success = await deleteTask(taskToDelete.id)
    if (success) {
      completeDelete()
    }
  }

  const handleTaskUpdated = async (taskId, payload) => {
    const updated = await updateTask(taskId, payload)
    if (updated) {
      setSelectedTask(updated)
    }
    return updated
  }

  const handleTaskStatusChange = async (taskId, status) => {
    setCompletingTaskId(taskId)
    try {
      const updated = await updateTaskStatus(taskId, status)
      if (updated) {
        setSelectedTask(updated)
      }
      return updated
    } finally {
      setCompletingTaskId(null)
    }
  }

  const handleTaskChecked = async (task) => {
    setCompletingTaskId(task.id)
    try {
      await updateTaskStatus(task.id, 'done')
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (!colocationId) {
    return (
      <ColocationRequired
        title="Tâches ménagères"
        message="Rejoignez ou créez une colocation pour gérer les tâches."
      />
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Tâches ménagères</h1>
          <p>Répartition équitable des corvées.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--with-icon"
          onClick={() => {
            clearFormError()
            openCreate()
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Nouvelle tâche
        </button>
      </div>

      {error && (
        <p className="alert--error" role="alert">
          {error}
        </p>
      )}

      <div className="tasks-page__filters">
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
          completingTaskId={completingTaskId}
          currentUser={user}
          onSelectTask={setSelectedTask}
          onCompleteTask={handleTaskChecked}
        />
      </div>

      <section className="tasks-page__history">
        <h2>Tâches terminées</h2>
        <div className="tasks-page__history-list">
          {isHistoryLoading ? (
            <p className="page-status">Chargement…</p>
          ) : history.length === 0 ? (
            <p className="page-status">Aucun historique pour le moment.</p>
          ) : (
            history.map((task) => (
              <div key={task.id} className="tasks-page__history-item">
                <button
                  type="button"
                  className="tasks-page__history-content"
                  onClick={() => setSelectedTask(task)}
                >
                  <span>{task.title}</span>
                  <small>
                    {formatMemberName(task.assignedTo)} -{' '}
                    {formatTaskDate(task.dueDate, 'Sans échéance')}
                  </small>
                </button>
                <button
                  type="button"
                  className="tasks-page__history-delete"
                  aria-label={`Supprimer ${task.title}`}
                  onClick={() => setTaskToDelete(task)}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreate}
        title="Nouvelle tâche"
      >
        <div className="modal__body">
          <TaskForm
            members={members}
            onSubmit={handleCreate}
            onCancel={closeCreate}
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
        onStatusChange={handleTaskStatusChange}
        onDeleteRequest={setTaskToDelete}
        isSubmitting={isSubmitting}
        formError={formError}
        clearFormError={clearFormError}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={cancelDelete}
        onConfirm={handleDelete}
        title="Supprimer la tâche"
        message={`Supprimer « ${taskToDelete?.title} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loadingLabel="Suppression…"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Tasks
