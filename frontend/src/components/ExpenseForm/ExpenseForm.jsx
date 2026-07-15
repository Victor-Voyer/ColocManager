import { useState } from 'react'
import './ExpenseForm.css'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function buildInitialShares(members, currentUserId) {
  return members.map((member) => ({
    userId: member.id,
    included: member.id === currentUserId,
    amountOwed: '',
  }))
}

function ExpenseForm({
  members = [],
  currentUserId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = '',
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [expenseDate, setExpenseDate] = useState(todayIso())
  const [paidByUserId, setPaidByUserId] = useState(
    currentUserId ? String(currentUserId) : '',
  )
  const [shares, setShares] = useState(() =>
    buildInitialShares(members, currentUserId),
  )

  const toggleShare = (userId) => {
    setShares((prev) =>
      prev.map((share) =>
        share.userId === userId
          ? { ...share, included: !share.included }
          : share,
      ),
    )
  }

  const updateShareAmount = (userId, value) => {
    setShares((prev) =>
      prev.map((share) =>
        share.userId === userId ? { ...share, amountOwed: value } : share,
      ),
    )
  }

  const includedShares = shares.filter((share) => share.included)
  const sharesTotal = includedShares.reduce(
    (sum, share) => sum + (Number(share.amountOwed.replace(',', '.')) || 0),
    0,
  )
  const targetAmount = Number(amount.replace(',', '.')) || 0
  const totalsMatch =
    includedShares.length > 0 &&
    Math.abs(sharesTotal - targetAmount) < 0.005

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit({
      amount: amount.trim().replace(',', '.'),
      description: description.trim(),
      category: category.trim() || null,
      expenseDate,
      paidByUserId: paidByUserId ? Number(paidByUserId) : null,
      shares: includedShares.map((share) => ({
        userId: share.userId,
        amountOwed: share.amountOwed.trim().replace(',', '.'),
      })),
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
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <div className="expense-form__field">
          <label htmlFor="expense-date">Date</label>
          <input
            id="expense-date"
            type="date"
            required
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
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
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>
        <div className="expense-form__field">
          <label htmlFor="expense-paid-by">Payé par</label>
          <select
            id="expense-paid-by"
            required
            value={paidByUserId}
            onChange={(event) => setPaidByUserId(event.target.value)}
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
        <label>Répartition (saisie manuelle)</label>
        <p className="expense-form__hint">
          Cochez les membres concernés et indiquez le montant dû par chacun.
          La somme doit être égale au montant total.
        </p>
        <div className="expense-form__participants">
          {shares.map((share) => {
            const member = members.find((m) => m.id === share.userId)
            if (!member) {
              return null
            }

            return (
              <div key={share.userId} className="expense-form__share-row">
                <label className="expense-form__participant">
                  <input
                    type="checkbox"
                    checked={share.included}
                    onChange={() => toggleShare(share.userId)}
                  />
                  {member.firstName} {member.lastName}
                </label>
                {share.included && (
                  <input
                    type="text"
                    inputMode="decimal"
                    className="expense-form__share-amount"
                    placeholder="0.00"
                    value={share.amountOwed}
                    onChange={(event) =>
                      updateShareAmount(share.userId, event.target.value)
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
        <p
          className={
            totalsMatch
              ? 'expense-form__total expense-form__total--ok'
              : 'expense-form__total expense-form__total--mismatch'
          }
        >
          Total saisi : {sharesTotal.toFixed(2)} € / {targetAmount.toFixed(2)} €
        </p>
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
          disabled={isSubmitting || !totalsMatch}
        >
          {isSubmitting ? 'Enregistrement…' : 'Ajouter'}
        </button>
      </footer>
    </form>
  )
}

export default ExpenseForm
