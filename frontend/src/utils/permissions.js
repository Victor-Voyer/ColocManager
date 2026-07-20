export function canChangeTaskStatus(task, user) {
  return (
    task.createdBy?.id === user?.id ||
    task.assignedTo?.id === user?.id ||
    user?.colocation?.role === 'admin'
  )
}

export function canManageTask(task, user) {
  return (
    task.createdBy?.id === user?.id || user?.colocation?.role === 'admin'
  )
}

export function canManageExpenseRepayments(expense, user) {
  return expense.createdBy?.id === user?.id
}

export function canDeleteExpense(expense, user) {
  return (
    expense.paidBy?.id === user?.id || user?.colocation?.role === 'admin'
  )
}

export function buildTaskPayload(task, status = task.status) {
  return {
    title: task.title,
    description: task.description ?? null,
    status,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    assignedToUserId: task.assignedTo ? Number(task.assignedTo.id) : null,
  }
}
