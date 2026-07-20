import { formatDateFr } from './dateUtils'
import { formatMemberName } from './memberUtils'

export function formatExpenseDate(isoDate, style = 'short') {
  return formatDateFr(isoDate, style)
}

export function formatAmount(amount) {
  return `${Number(amount).toFixed(2)} €`
}

export { formatMemberName }
export {
  canManageExpenseRepayments,
  canDeleteExpense,
} from './permissions'

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

function toCents(value) {
  const num = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(num) ? Math.round(num * 100) : 0
}

function centsToAmount(cents) {
  return (cents / 100).toFixed(2)
}

export function computeShareAmounts(totalAmount, shares) {
  const totalCents = toCents(totalAmount)
  let explicitCents = 0
  const cents = shares.map((share) => {
    if (!share.isManual) {
      return 0
    }
    const value = toCents(share.amountOwed)
    explicitCents += value
    return value
  })

  const autoPositions = shares
    .map((share, index) => (share.isManual ? null : index))
    .filter((index) => index !== null)

  if (autoPositions.length > 0) {
    const remainingCents = Math.max(totalCents - explicitCents, 0)
    const baseCents = Math.floor(remainingCents / autoPositions.length)
    const extraCents = remainingCents - baseCents * autoPositions.length

    autoPositions.forEach((index, position) => {
      cents[index] = baseCents + (position < extraCents ? 1 : 0)
    })
  }

  return cents.map(centsToAmount)
}

export function isShareSplitValid(totalAmount, shares) {
  if (shares.length === 0) {
    return false
  }

  const totalCents = toCents(totalAmount)
  if (totalCents <= 0) {
    return false
  }

  let manualCents = 0
  for (const share of shares) {
    if (!share.isManual) {
      continue
    }
    const value = toCents(share.amountOwed)
    if (value <= 0) {
      return false
    }
    manualCents += value
  }

  const hasAutoShare = shares.some((share) => !share.isManual)

  return hasAutoShare ? manualCents <= totalCents : manualCents === totalCents
}

export function mergeShareIntoExpense(expense, userId, updatedShare) {
  return {
    ...expense,
    shares: expense.shares.map((share) =>
      share.userId === userId ? { ...share, ...updatedShare } : share,
    ),
  }
}
