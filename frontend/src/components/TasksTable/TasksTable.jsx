import {
  canChangeTaskStatus,
  formatMemberName,
  formatTaskDate,
  getTaskPriority,
  getTaskStatus,
} from '../../utils/taskUtils'

function TasksTable({
  tasks,
  isLoading,
  completingTaskId = null,
  currentUser,
  onSelectTask,
  onCompleteTask,
}) {
  if (isLoading) {
    return <p className="page-status">Chargement…</p>
  }

  if (tasks.length === 0) {
    return (
      <p className="page-status">
        Aucune tâche pour le moment. Ajoutez-en une !
      </p>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Tâche</th>
            <th>Assigné à</th>
            <th>Échéance</th>
            <th>Priorité</th>
            <th>Statut</th>
            <th>Faite</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = getTaskStatus(task.status)
            const priority = getTaskPriority(task.priority)
            const canChangeStatus = canChangeTaskStatus(task, currentUser)

            return (
              <tr
                key={task.id}
                className="table__row--clickable"
                onClick={() => onSelectTask(task)}
              >
                <td>{task.title}</td>
                <td>{formatMemberName(task.assignedTo)}</td>
                <td>{formatTaskDate(task.dueDate)}</td>
                <td>
                  <span className={`badge badge--${priority.variant}`}>
                    {priority.label}
                  </span>
                </td>
                <td>
                  <span className={`badge badge--${status.variant}`}>
                    {status.label}
                  </span>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="tasks-page__done-checkbox"
                    aria-label={`Marquer ${task.title} comme terminée`}
                    checked={task.status === 'done'}
                    disabled={
                      !canChangeStatus ||
                      task.status === 'done' ||
                      completingTaskId === task.id
                    }
                    onChange={(event) => {
                      event.stopPropagation()
                      if (event.target.checked) {
                        onCompleteTask(task)
                      }
                    }}
                    onClick={(event) => event.stopPropagation()}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TasksTable
