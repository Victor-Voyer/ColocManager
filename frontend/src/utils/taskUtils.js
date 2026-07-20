export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminee' },
]

export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
]

export function canChangeTaskStatus(task, user) {
  return (
    task.createdBy?.id === user?.id ||
    task.assignedTo?.id === user?.id ||
    user?.colocation?.role === 'admin'
  )
}

export function formatMemberName(member) {
  if (!member) {
    return 'Non assigne'
  }

  return `${member.firstName} ${member.lastName}`.trim()
}

export function formatTaskDate(date, fallback = 'Aucune echeance') {
  if (!date) {
    return fallback
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function getTaskStatus(status) {
  return (
    {
      pending: { label: 'A faire', variant: 'warning' },
      in_progress: { label: 'En cours', variant: 'info' },
      done: { label: 'Terminee', variant: 'success' },
    }[status] ?? { label: status, variant: 'neutral' }
  )
}

export function getTaskPriority(priority) {
  return (
    {
      low: { label: 'Basse', variant: 'success' },
      medium: { label: 'Moyenne', variant: 'warning' },
      high: { label: 'Haute', variant: 'danger' },
    }[priority] ?? { label: priority, variant: 'neutral' }
  )
}
