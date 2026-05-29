import { useState } from 'react'
import '../ColocationForm/ColocationForm.css'

function JoinColocationForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = '',
}) {
  const [invitationCode, setInvitationCode] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({ invitationCode: invitationCode.trim().toUpperCase() })
  }

  return (
    <form className="colocation-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="colocation-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="colocation-form__field">
        <label htmlFor="invitation-code">Code d&apos;invitation</label>
        <input
          id="invitation-code"
          type="text"
          required
          maxLength={64}
          placeholder="COL-XXXXXXXX"
          value={invitationCode}
          onChange={(event) => setInvitationCode(event.target.value)}
          autoFocus
        />
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
          {isSubmitting ? 'Connexion…' : 'Rejoindre'}
        </button>
      </footer>
    </form>
  )
}

export default JoinColocationForm
