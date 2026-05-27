import { useState } from 'react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ExpenseDetailModal from '../../components/ExpenseDetailModal/ExpenseDetailModal.jsx'
import ExpenseForm from '../../components/ExpenseForm/ExpenseForm.jsx'
import ExpensesTable from '../../components/ExpensesTable/ExpensesTable.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import { useAuth } from '../../context/AuthContext'
import { useExpenses } from '../../hooks/useExpenses'
import './Expenses.css'

function Expenses() {
  const { user } = useAuth()
  const colocationId = user?.colocations?.[0]?.id

  const {
    expenses,
    members,
    pagination,
    page,
    setPage,
    isLoading,
    error,
    formError,
    isSubmitting,
    isDeleting,
    createExpense,
    deleteExpense,
    upsertExpense,
    clearFormError,
  } = useExpenses(colocationId)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [expenseToDelete, setExpenseToDelete] = useState(null)

  const handleCreate = async (payload) => {
    const success = await createExpense(payload)
    if (success) {
      setIsCreateOpen(false)
    }
  }

  const handleExpenseUpdated = (updated) => {
    setSelectedExpense(updated)
    upsertExpense(updated)
  }

  const handleDelete = async () => {
    if (!expenseToDelete) {
      return
    }

    const success = await deleteExpense(expenseToDelete.id)
    if (success) {
      setExpenseToDelete(null)
      setSelectedExpense(null)
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
            clearFormError()
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
        <ExpensesTable
          expenses={expenses}
          isLoading={isLoading}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          onSelectExpense={setSelectedExpense}
        />
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
