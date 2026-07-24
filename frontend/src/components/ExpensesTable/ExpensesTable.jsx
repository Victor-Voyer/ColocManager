import {
  formatAmount,
  formatExpenseDate,
  formatMemberName,
  getExpenseStatus,
} from '../../utils/expenseUtils'

function ExpensesTable({
  expenses,
  isLoading,
  pagination,
  page,
  onPageChange,
  onSelectExpense,
}) {
  if (isLoading) {
    return <p className="page__status">Chargement…</p>
  }

  if (expenses.length === 0) {
    return (
      <p className="page__status">
        Aucune dépense pour le moment. Ajoutez-en une !
      </p>
    )
  }

  return (
    <>
      <div className="table__container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Payé par</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const status = getExpenseStatus(expense)
              return (
                <tr
                  key={expense.id}
                  className="table__row--clickable"
                  onClick={() => onSelectExpense(expense)}
                >
                  <td>{formatExpenseDate(expense.expenseDate)}</td>
                  <td>{expense.description}</td>
                  <td>{formatMemberName(expense.paidBy)}</td>
                  <td>{formatAmount(expense.amount)}</td>
                  <td>
                    <span className={`badge badge--${status.variant}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="expenses-page__pagination">
          <button
            type="button"
            className="btn btn--neutral"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Précédent
          </button>
          <span>
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            type="button"
            className="btn btn--neutral"
            disabled={page >= pagination.pages}
            onClick={() => onPageChange(page + 1)}
          >
            Suivant
          </button>
        </div>
      )}
    </>
  )
}

export default ExpensesTable
