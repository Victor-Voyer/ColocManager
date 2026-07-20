import Modal from '../Modal/Modal.jsx'
import {
  canDeleteExpense,
  canManageExpenseRepayments,
  formatAmount,
  formatExpenseDate,
  formatMemberName,
} from '../../utils/expenseUtils'
import './ExpenseDetailModal.css'

function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  user,
  isUpdatingShare,
  onMarkShareAsPaid,
  onMarkShareAsUnpaid,
  onUpdated,
  onDeleteRequest,
}) {
  if (!expense) {
    return null
  }

  const canManageRepayments = canManageExpenseRepayments(expense, user)
  const canDelete = canDeleteExpense(expense, user)

  const handleShareAction = async (userId, action) => {
    const updated = await action(expense, userId)
    if (updated) {
      onUpdated(updated)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détail de la dépense" wide>
      <div className="modal__body">
        <div className="expense-detail__meta detail-modal__meta">
          <div>
            <span className="detail-modal__label">Montant</span>
            <p className="detail-modal__value expense-detail__amount">
              {formatAmount(expense.amount)}
            </p>
          </div>
          <div>
            <span className="detail-modal__label">Date</span>
            <p className="detail-modal__value">
              {formatExpenseDate(expense.expenseDate, 'long')}
            </p>
          </div>
          <div>
            <span className="detail-modal__label">Description</span>
            <p className="detail-modal__value">{expense.description}</p>
          </div>
          <div>
            <span className="detail-modal__label">Catégorie</span>
            <p className="detail-modal__value">
              {expense.category || '—'}
            </p>
          </div>
          <div>
            <span className="detail-modal__label">Payé par</span>
            <p className="detail-modal__value">
              {formatMemberName(expense.paidBy)}
            </p>
          </div>
        </div>

        <h3 className="expense-detail__shares-title">Parts</h3>
        <ul className="expense-detail__shares">
          {expense.shares.map((share) => (
            <li key={share.id} className="expense-detail__share">
              <div className="expense-detail__share-info">
                <span className="expense-detail__share-name">
                  {share.firstName} {share.lastName}
                </span>
                <span className="expense-detail__share-amount">
                  {formatAmount(share.amountOwed)}
                </span>
              </div>
              {share.isPaid ? (
                <div className="expense-detail__share-status">
                  <span className="badge badge--success">Remboursé</span>
                  {canManageRepayments && (
                    <button
                      type="button"
                      className="btn btn--neutral expense-detail__pay-btn"
                      disabled={isUpdatingShare === share.userId}
                      onClick={() =>
                        handleShareAction(share.userId, onMarkShareAsUnpaid)
                      }
                    >
                      {isUpdatingShare === share.userId ? '…' : 'Annuler'}
                    </button>
                  )}
                </div>
              ) : (
                canManageRepayments && (
                  <button
                    type="button"
                    className="btn btn--primary expense-detail__pay-btn"
                    disabled={isUpdatingShare === share.userId}
                    onClick={() =>
                      handleShareAction(share.userId, onMarkShareAsPaid)
                    }
                  >
                    {isUpdatingShare === share.userId
                      ? '…'
                      : 'Marquer remboursé'}
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      </div>

      {canDelete && (
        <footer className="modal__footer expense-detail__actions">
          <button
            type="button"
            className="btn btn--neutral"
            onClick={() => onDeleteRequest(expense)}
          >
            Supprimer
          </button>
        </footer>
      )}
    </Modal>
  )
}

export default ExpenseDetailModal
