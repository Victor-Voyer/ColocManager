import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { ApiError } from '../../../api/client'
import { useAuth } from '../../../context/AuthContext'

function PasswordForm() {
  const { updateProfile } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setIsSubmitting(true)

    try {
      await updateProfile({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Impossible de mettre à jour le mot de passe.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="settings-subsection">
      <div className="settings-subsection__header">
        <KeyRound size={20} aria-hidden="true" />
        <div>
          <h3>Mot de passe</h3>
          <p>Modifiez votre mot de passe de connexion.</p>
        </div>
      </div>

      {error && (
        <p className="settings-feedback settings-feedback--error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="settings-feedback settings-feedback--success" role="status">
          Mot de passe mis à jour.
        </p>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form__field">
          <label htmlFor="settings-currentPassword">Mot de passe actuel</label>
          <input
            id="settings-currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="form__row">
          <div className="form__field">
            <label htmlFor="settings-newPassword">Nouveau mot de passe</label>
            <input
              id="settings-newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="form__field">
            <label htmlFor="settings-confirmPassword">Confirmer</label>
            <input
              id="settings-confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn--neutral"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  )
}

export default PasswordForm
