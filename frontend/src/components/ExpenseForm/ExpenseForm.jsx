import { useState } from 'react'
import { Pencil, Undo2 } from 'lucide-react'
import {
  computeShareAmounts,
  isShareSplitValid,
} from '../../utils/expenseUtils'
import { todayIso } from '../../utils/dateUtils'
import './ExpenseForm.css'

function buildInitialShares(members, currentUserId) {
  return members.map((member) => ({
    userId: member.id,
    included: member.id === currentUserId,
    isManual: false,
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

  const toggleManual = (userId, prefillAmount) => {
    setShares((prev) =>
      prev.map((share) => {
        if (share.userId !== userId) {
          return share
        }
        return share.isManual
          ? { ...share, isManual: false, amountOwed: '' }
          : { ...share, isManual: true, amountOwed: prefillAmount }
      }),
    )
  }

  const includedShares = shares.filter((share) => share.included)
  const previewAmounts = computeShareAmounts(amount, includedShares)
  const sharesTotal = previewAmounts.reduce((sum, value) => sum + Number(value), 0)
  const targetAmount = Number(amount.replace(',', '.')) || 0
  const totalsMatch = isShareSplitValid(amount, includedShares)

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
        amountOwed: share.isManual
          ? share.amountOwed.trim().replace(',', '.')
          : null,
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

      <div className="expense-form__field expense-form__field--shares">
        <span className="expense-form__field-label">Répartition</span>
        <p className="expense-form__hint">
          Cochez les membres concernés : le montant total est réparti à parts
          égales entre eux. Utilisez l'icône crayon pour ajuster le montant
          d'un membre — le reste continue d'être réparti entre les autres. Le
          payeur n'est pas obligé d'être coché : décochez-le s'il a avancé la
          totalité pour quelqu'un d'autre.
        </p>
        <ul className="expense-form__participants">
          {shares.map((share) => {
            const member = members.find((m) => m.id === share.userId)
            if (!member) {
              return null
            }

            const previewIndex = includedShares.findIndex(
              (s) => s.userId === share.userId,
            )
            const previewAmount =
              previewIndex >= 0 ? previewAmounts[previewIndex] : '0.00'

            return (
              <li
                key={share.userId}
                className={
                  share.included
                    ? 'expense-form__share-row expense-form__share-row--active'
                    : 'expense-form__share-row'
                }
              >
                <label className="expense-form__participant">
                  <input
                    type="checkbox"
                    className="expense-form__participant-checkbox"
                    checked={share.included}
                    onChange={() => toggleShare(share.userId)}
                  />
                  <span className="expense-form__participant-name">
                    {member.firstName} {member.lastName}
                  </span>
                </label>
                {share.included && (
                  <div className="expense-form__share-controls">
                    {share.isManual ? (
                      <input
                        type="text"
                        inputMode="decimal"
                        className="expense-form__share-amount"
                        placeholder="0.00"
                        value={share.amountOwed}
                        onChange={(event) =>
                          updateShareAmount(share.userId, event.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      <span className="expense-form__share-auto">
                        {previewAmount} €
                      </span>
                    )}
                    <button
                      type="button"
                      className={
                        share.isManual
                          ? 'expense-form__share-action expense-form__share-action--revert'
                          : 'expense-form__share-action expense-form__share-action--edit'
                      }
                      onClick={() => toggleManual(share.userId, previewAmount)}
                      title={
                        share.isManual
                          ? 'Revenir au calcul automatique'
                          : 'Modifier le montant'
                      }
                      aria-label={
                        share.isManual
                          ? `Annuler la modification du montant de ${member.firstName} ${member.lastName}`
                          : `Modifier le montant de ${member.firstName} ${member.lastName}`
                      }
                    >
                      {share.isManual ? (
                        <Undo2 size={15} aria-hidden="true" />
                      ) : (
                        <Pencil size={15} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <p
          className={
            totalsMatch
              ? 'expense-form__total expense-form__total--ok'
              : 'expense-form__total expense-form__total--mismatch'
          }
        >
          Total réparti : {sharesTotal.toFixed(2)} € / {targetAmount.toFixed(2)} €
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
