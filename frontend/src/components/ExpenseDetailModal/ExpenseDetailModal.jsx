import { useState } from 'react'
import * as expenseApi from '../../api/expenseApi'
import { getErrorMessage } from '../../utils/apiError'
import {
  formatAmount,
  formatExpenseDate,
  formatMemberName,
  mergeShareIntoExpense,
} from '../../utils/expenseUtils'
import Modal from '../Modal/Modal.jsx'
import ExpenseForm from '../ExpenseForm/ExpenseForm.jsx'
import './ExpenseDetailModal.css'

function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  colocationId,
  members,
  currentUserId,
  onUpdated,
  onDeleteRequest,
}) {
  const [mode, setMode] = useState('view')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingShare, setIsUpdatingShare] = useState(null)
  const [error, setError] = useState('')

  const handleClose = () => {
    setMode('view')
    setError('')
    onClose()
  }

  const handleUpdate = async (payload) => {
    setError('')
    setIsSubmitting(true)
    try {
      const updated = await expenseApi.updateExpense(
        colocationId,
        expense.id,
        payload,
      )
      onUpdated(updated)
      setMode('view')
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de modifier la dépense.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareStatusChange = async (userId, apiCall, fallbackMessage) => {
    setIsUpdatingShare(userId)
    setError('')
    try {
      const updatedShare = await apiCall(expense.id, userId)
      onUpdated(mergeShareIntoExpense(expense, userId, updatedShare))
    } catch (err) {
      setError(getErrorMessage(err, fallbackMessage))
    } finally {
      setIsUpdatingShare(null)
    }
  }

  if (!expense) {
    return null
  }

  const title = mode === 'edit' ? 'Modifier la dépense' : 'Détail de la dépense'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} wide>
      {mode === 'edit' ? (
        <div className="modal__body">
          <ExpenseForm
            expense={expense}
            members={members}
            currentUserId={currentUserId}
            onSubmit={handleUpdate}
            onCancel={() => {
              setMode('view')
              setError('')
            }}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      ) : (
        <>
          <div className="modal__body">
            {error && (
              <p className="expense-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="expense-detail__meta">
              <div>
                <span className="expense-detail__label">Montant</span>
                <p className="expense-detail__value expense-detail__amount">
                  {formatAmount(expense.amount)}
                </p>
              </div>
              <div>
                <span className="expense-detail__label">Date</span>
                <p className="expense-detail__value">
                  {formatExpenseDate(expense.expenseDate, 'long')}
                </p>
              </div>
              <div>
                <span className="expense-detail__label">Description</span>
                <p className="expense-detail__value">{expense.description}</p>
              </div>
              <div>
                <span className="expense-detail__label">Catégorie</span>
                <p className="expense-detail__value">
                  {expense.category || '—'}
                </p>
              </div>
              <div>
                <span className="expense-detail__label">Payé par</span>
                <p className="expense-detail__value">
                  {formatMemberName(expense.paidBy)}
                </p>
              </div>
              <div>
                <span className="expense-detail__label">Répartition</span>
                <p className="expense-detail__value">{expense.splitMode}</p>
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
                      <button
                        type="button"
                        className="btn btn--neutral expense-detail__pay-btn"
                        disabled={isUpdatingShare === share.userId}
                        onClick={() =>
                          handleShareStatusChange(
                            share.userId,
                            expenseApi.markShareAsUnpaid,
                            'Impossible d\'annuler le remboursement.',
                          )
                        }
                      >
                        {isUpdatingShare === share.userId ? '…' : 'Annuler'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--primary expense-detail__pay-btn"
                      disabled={isUpdatingShare === share.userId}
                      onClick={() =>
                        handleShareStatusChange(
                          share.userId,
                          expenseApi.markShareAsPaid,
                          'Impossible de marquer la part comme remboursée.',
                        )
                      }
                    >
                      {isUpdatingShare === share.userId
                        ? '…'
                        : 'Marquer remboursé'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <footer className="modal__footer expense-detail__actions">
            <button
              type="button"
              className="btn btn--neutral"
              onClick={() => onDeleteRequest(expense)}
            >
              Supprimer
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setMode('edit')}
            >
              Modifier
            </button>
          </footer>
        </>
      )}
    </Modal>
  )
}

export default ExpenseDetailModal
