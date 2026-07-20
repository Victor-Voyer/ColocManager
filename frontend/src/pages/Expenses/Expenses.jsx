import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ActionButton from '../../components/ActionButton/ActionButton.jsx'
import ColocationRequired from '../../components/ColocationRequired/ColocationRequired.jsx'
import CreateExpenseModal from '../../components/CreateExpenseModal/CreateExpenseModal.jsx'
import ExpenseDetailModal from '../../components/ExpenseDetailModal/ExpenseDetailModal.jsx'
import ExpensesTable from '../../components/ExpensesTable/ExpensesTable.jsx'
import { useAuth } from '../../context/AuthContext'
import { useCrudPageState } from '../../hooks/useCrudPageState'
import { useExpenses } from '../../hooks/useExpenses'
import './Expenses.css'

function Expenses() {
  const { user } = useAuth()
  const colocationId = user?.colocation?.id

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
    isUpdatingShare,
    createExpense,
    deleteExpense,
    upsertExpense,
    markShareAsPaid,
    markShareAsUnpaid,
    clearFormError,
  } = useExpenses(colocationId)

  const {
    isCreateOpen,
    openCreate,
    closeCreate,
    selectedItem: selectedExpense,
    setSelectedItem: setSelectedExpense,
    itemToDelete: expenseToDelete,
    requestDelete: setExpenseToDelete,
    cancelDelete,
    completeDelete,
  } = useCrudPageState()

  const handleCreate = async (payload) => {
    const success = await createExpense(payload)
    if (success) {
      closeCreate()
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
      completeDelete()
    }
  }

  if (!colocationId) {
    return (
      <ColocationRequired
        title="Dépenses"
        message="Rejoignez ou créez une colocation pour gérer les dépenses."
      />
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Dépenses</h1>
          <p>Gérez les finances de votre colocation.</p>
        </div>
        <ActionButton
          variant="expense"
          label="Ajouter une dépense"
          onClick={() => {
            clearFormError()
            openCreate()
          }}
        />
      </div>

      {error && (
        <p className="alert--error" role="alert">
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

      <CreateExpenseModal
        isOpen={isCreateOpen}
        onClose={closeCreate}
        members={members}
        currentUserId={user?.id}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        error={formError}
      />

      <ExpenseDetailModal
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        user={user}
        isUpdatingShare={isUpdatingShare}
        onMarkShareAsPaid={markShareAsPaid}
        onMarkShareAsUnpaid={markShareAsUnpaid}
        onUpdated={handleExpenseUpdated}
        onDeleteRequest={setExpenseToDelete}
      />

      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={cancelDelete}
        onConfirm={handleDelete}
        title="Supprimer la dépense"
        message={`Supprimer « ${expenseToDelete?.description} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loadingLabel="Suppression…"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Expenses
