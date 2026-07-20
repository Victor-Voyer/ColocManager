import { useState } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { getErrorMessage } from '../../../utils/apiError'
import PasswordForm from '../components/PasswordForm.jsx'

function ProfileSection() {
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
        getErrorMessage(err, 'Mise à jour impossible. Vérifiez vos informations.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="settings-section card">
      <div className="settings-section__header">
        <User size={22} aria-hidden="true" />
        <div>
          <h2>Profil</h2>
          <p>Vos informations personnelles et identifiants.</p>
        </div>
      </div>

      <div className="settings-subsection">
        <div className="settings-subsection__header">
          <div>
            <h3>Identité</h3>
            <p>Modifiez votre nom et votre adresse email.</p>
          </div>
        </div>

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

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__row">
            <div className="form__field">
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
            <div className="form__field">
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
          </div>
          <div className="form__field">
            <label htmlFor="settings-email">Adresse e-mail</label>
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

      <PasswordForm />
    </div>
  )
}

export default ProfileSection
