import {
  formatMemberName,
  formatTaskDate,
  getTaskPriority,
  getTaskRecurrence,
  getTaskStatus,
} from '../../utils/taskUtils'

function TasksTable({ tasks, isLoading, onSelectTask }) {
  if (isLoading) {
    return <p className="tasks-page__status">Chargement...</p>
  }

  if (tasks.length === 0) {
    return (
      <p className="tasks-page__status">
        Aucune tache pour le moment. Ajoutez-en une !
      </p>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Tache</th>
            <th>Assigne a</th>
            <th>Echeance</th>
            <th>Priorite</th>
            <th>Statut</th>
            <th>Recurrence</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = getTaskStatus(task.status)
            const priority = getTaskPriority(task.priority)

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
                <td>{getTaskRecurrence(task.recurrence)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TasksTable
