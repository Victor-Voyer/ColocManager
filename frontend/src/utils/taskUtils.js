export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminée' },
]

export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
]

export { formatMemberName } from './memberUtils'
export { formatDateFr as formatTaskDate } from './dateUtils'
export {
  canChangeTaskStatus,
  canManageTask,
  buildTaskPayload,
} from './permissions'

export function getTaskStatus(status) {
  return (
    {
      pending: { label: 'À faire', variant: 'warning' },
      in_progress: { label: 'En cours', variant: 'info' },
      done: { label: 'Terminée', variant: 'success' },
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
