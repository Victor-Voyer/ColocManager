import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import * as colocationApi from '../../api/colocationApi'
import * as expenseApi from '../../api/expenseApi'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ExpenseDetailModal from '../../components/ExpenseDetailModal/ExpenseDetailModal.jsx'
import ExpenseForm from '../../components/ExpenseForm/ExpenseForm.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import { useAuth } from '../../context/AuthContext'
import './Expenses.css'

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatAmount(amount) {
  return `${Number(amount).toFixed(2)} €`
}

function formatMemberName(person) {
  return `${person.firstName} ${person.lastName}`
}

function getExpenseStatus(expense) {
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

function Expenses() {
  const { user } = useAuth()
  const colocationId = user?.colocations?.[0]?.id

  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [members, setMembers] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [expenseToDelete, setExpenseToDelete] = useState(null)

  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadExpenses = useCallback(async () => {
    if (!colocationId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await expenseApi.listExpenses(colocationId, { page, limit: 20 })
      setExpenses(data.items)
      setPagination(data.pagination)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de charger les dépenses.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [colocationId, page])

  const loadMembers = useCallback(async () => {
    if (!colocationId) {
      return
    }

    try {
      const data = await colocationApi.getMembers(colocationId)
      setMembers(Array.isArray(data) ? data : [])
    } catch {
      setMembers([])
    }
  }, [colocationId])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleCreate = async (payload) => {
    setFormError('')
    setIsSubmitting(true)

    try {
      await expenseApi.createExpense(colocationId, payload)
      setIsCreateOpen(false)
      if (page !== 1) {
        setPage(1)
      } else {
        await loadExpenses()
      }
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de créer la dépense.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExpenseUpdated = (updated) => {
    setSelectedExpense(updated)
    setExpenses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  const handleDelete = async () => {
    if (!expenseToDelete) {
      return
    }

    setIsDeleting(true)
    try {
      await expenseApi.deleteExpense(colocationId, expenseToDelete.id)
      setExpenseToDelete(null)
      setSelectedExpense(null)
      await loadExpenses()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de supprimer la dépense.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!colocationId) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Dépenses</h1>
            <p>Rejoignez ou créez une colocation pour gérer les dépenses.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dépenses</h1>
          <p>Gérez les finances de votre colocation.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setFormError('')
            setIsCreateOpen(true)
          }}
        >
          + Ajouter une dépense
        </button>
      </div>

      {error && (
        <p className="expenses-page__error" role="alert">
          {error}
        </p>
      )}

      <div className="card">
        {isLoading ? (
          <p className="expenses-page__status">Chargement…</p>
        ) : expenses.length === 0 ? (
          <p className="expenses-page__status">
            Aucune dépense pour le moment. Ajoutez-en une !
          </p>
        ) : (
          <div className="table-container">
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
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <td>{formatDate(expense.expenseDate)}</td>
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
        )}

        {pagination.pages > 1 && (
          <div className="expenses-page__pagination">
            <button
              type="button"
              className="btn btn--neutral"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouvelle dépense"
      >
        <div className="modal__body">
          <ExpenseForm
            members={members}
            currentUserId={user?.id}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </div>
      </Modal>

      <ExpenseDetailModal
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        colocationId={colocationId}
        members={members}
        currentUserId={user?.id}
        onUpdated={handleExpenseUpdated}
        onDeleteRequest={setExpenseToDelete}
      />

      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la dépense"
        message={`Supprimer « ${expenseToDelete?.description} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Expenses
