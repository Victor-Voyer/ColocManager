import { useState } from 'react'
import './ExpenseForm.css'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function buildInitialState(expense, currentUserId) {
  if (expense) {
    return {
      amount: expense.amount,
      description: expense.description,
      category: expense.category ?? '',
      expenseDate: expense.expenseDate,
      paidByUserId: String(expense.paidBy.id),
      splitMode: expense.splitMode,
      participantUserIds: expense.shares.map((share) => share.userId),
    }
  }

  return {
    amount: '',
    description: '',
    category: '',
    expenseDate: todayIso(),
    paidByUserId: currentUserId ? String(currentUserId) : '',
    splitMode: 'equal',
    participantUserIds: [],
  }
}

function ExpenseForm({
  expense = null,
  members = [],
  currentUserId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = '',
}) {
  const [form, setForm] = useState(() =>
    buildInitialState(expense, currentUserId),
  )

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleParticipant = (userId) => {
    setForm((prev) => {
      const ids = prev.participantUserIds
      const next = ids.includes(userId)
        ? ids.filter((id) => id !== userId)
        : [...ids, userId]
      return { ...prev, participantUserIds: next }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({
      amount: form.amount.trim(),
      description: form.description.trim(),
      category: form.category.trim() || null,
      expenseDate: form.expenseDate,
      paidByUserId: Number(form.paidByUserId),
      splitMode: form.splitMode,
      participantUserIds: form.participantUserIds,
      shares: [],
    })
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="expense-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="expense-form__row">
        <div className="expense-form__field">
          <label htmlFor="expense-amount">Montant (€)</label>
          <input
            id="expense-amount"
            type="text"
            inputMode="decimal"
            required
            placeholder="84.50"
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
          />
        </div>
        <div className="expense-form__field">
          <label htmlFor="expense-date">Date</label>
          <input
            id="expense-date"
            type="date"
            required
            value={form.expenseDate}
            onChange={(event) => updateField('expenseDate', event.target.value)}
          />
        </div>
      </div>

      <div className="expense-form__field">
        <label htmlFor="expense-description">Description</label>
        <input
          id="expense-description"
          type="text"
          required
          maxLength={500}
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </div>

      <div className="expense-form__row">
        <div className="expense-form__field">
          <label htmlFor="expense-category">Catégorie</label>
          <input
            id="expense-category"
            type="text"
            maxLength={100}
            placeholder="Alimentation"
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
          />
        </div>
        <div className="expense-form__field">
          <label htmlFor="expense-paid-by">Payé par</label>
          <select
            id="expense-paid-by"
            required
            value={form.paidByUserId}
            onChange={(event) =>
              updateField('paidByUserId', event.target.value)
            }
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="expense-form__field">
        <label>Participants (répartition égale)</label>
        <p className="expense-form__hint">
          Aucune sélection = tous les membres de la colocation.
        </p>
        <div className="expense-form__participants">
          {members.map((member) => (
            <label key={member.id} className="expense-form__participant">
              <input
                type="checkbox"
                checked={form.participantUserIds.includes(member.id)}
                onChange={() => toggleParticipant(member.id)}
              />
              {member.firstName} {member.lastName}
            </label>
          ))}
        </div>
      </div>

      <footer className="modal__footer">
        <button
          type="button"
          className="btn btn--neutral"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Enregistrement…'
            : expense
              ? 'Enregistrer'
              : 'Ajouter'}
        </button>
      </footer>
    </form>
  )
}

export default ExpenseForm
