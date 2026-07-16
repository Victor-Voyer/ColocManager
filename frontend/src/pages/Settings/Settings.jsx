import { useState } from 'react'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import './Settings.css'

function Settings() {
  const { user, updateProfile } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      })
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Mise à jour impossible. Vérifiez vos informations.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez votre profil et votre colocation.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <h2>Profil</h2>

          {error && (
            <p className="settings-feedback settings-feedback--error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="settings-feedback settings-feedback--success" role="status">
              Profil mis à jour.
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="settings-firstName">Prénom</label>
              <input
                id="settings-firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-lastName">Nom</label>
              <input
                id="settings-lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-email">Email</label>
              <input
                id="settings-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </div>
        <div className="card">
          <h2>Colocation</h2>
          <p>Nom : <strong>THE BIG FLATROOM</strong></p>
          <p>Code d&apos;invitation : <code>BF-2026-XYZ</code></p>
          <button className="btn btn--neutral">Modifier le foyer</button>
        </div>
      </div>
    </div>
  )
}

export default Settings
