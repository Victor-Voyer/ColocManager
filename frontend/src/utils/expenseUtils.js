export function formatExpenseDate(isoDate, style = 'short') {
  const options =
    style === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' }

  return new Date(isoDate).toLocaleDateString('fr-FR', options)
}

export function formatAmount(amount) {
  return `${Number(amount).toFixed(2)} €`
}

export function formatMemberName(person) {
  return `${person.firstName} ${person.lastName}`
}

export function getExpenseStatus(expense) {
  if (!expense.shares?.length) {
    return { label: '—', variant: 'warning' }
  }

  const allPaid = expense.shares.every((share) => share.isPaid)
  const somePaid = expense.shares.some((share) => share.isPaid)

  if (allPaid) {
    return { label: 'Remboursé', variant: 'success' }
  }
  if (somePaid) {
    return { label: 'Partiel', variant: 'warning' }
  }
  return { label: 'En attente', variant: 'warning' }
}

export function mergeShareIntoExpense(expense, userId, updatedShare) {
  return {
    ...expense,
    shares: expense.shares.map((share) =>
      share.userId === userId ? { ...share, ...updatedShare } : share,
    ),
  }
}
