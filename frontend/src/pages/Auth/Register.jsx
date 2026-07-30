import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Logo from '../../components/Logo/Logo.jsx'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/apiError'
import {
  formatPasswordValidationError,
  getPasswordValidationErrors,
  PASSWORD_REQUIREMENTS_HINT,
} from '../../utils/passwordValidation'
import './Auth.css'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePasswordChange = (event) => {
    const nextPassword = event.target.value
    setPassword(nextPassword)

    if (passwordError) {
      const missingRequirements = getPasswordValidationErrors(nextPassword)
      setPasswordError(formatPasswordValidationError(missingRequirements))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const missingRequirements = getPasswordValidationErrors(password)
    if (missingRequirements.length > 0) {
      setPasswordError(formatPasswordValidationError(missingRequirements))
      return
    }

    setPasswordError('')
    setIsSubmitting(true)

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        getErrorMessage(err, 'Inscription impossible. Vérifiez vos informations.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <Logo className="auth-page__logo" variant="light" />
      </header>

      <main className="auth-page__main">
        <div className="auth-page__card">
          <h1 className="auth-page__title">Inscription</h1>
          <p className="auth-page__subtitle">
            Créez votre compte pour gérer votre colocation.
          </p>

          {error && (
            <p className="auth-page__error" role="alert">
              {error}
            </p>
          )}

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
              <div className="auth-page__field">
                <label htmlFor="register-firstName">Prénom</label>
                <input
                  id="register-firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>

              <div className="auth-page__field">
                <label htmlFor="register-lastName">Nom</label>
                <input
                  id="register-lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>

            <div className="auth-page__field">
              <label htmlFor="register-email">Adresse e-mail</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="auth-page__field">
              <label htmlFor="register-password">Mot de passe</label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                aria-describedby="register-password-hint register-password-error"
                aria-invalid={passwordError ? 'true' : undefined}
                value={password}
                onChange={handlePasswordChange}
              />
              <p
                id="register-password-hint"
                className="auth-page__hint"
              >
                {PASSWORD_REQUIREMENTS_HINT}
              </p>
              {passwordError && (
                <p
                  id="register-password-error"
                  className="auth-page__field-error"
                  role="alert"
                >
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="auth-page__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="auth-page__footer">
            Déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
          <p className="auth-page__footer">
            En créant un compte, vous acceptez nos{' '}
            <Link to="/cgu">Conditions Générales d&apos;Utilisation</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Register
