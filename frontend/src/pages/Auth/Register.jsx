import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import './Auth.css'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
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
        err instanceof ApiError
          ? err.message
          : 'Inscription impossible. Vérifiez vos informations.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <Link to="/" className="auth-page__logo">
          <span aria-hidden="true">🏠</span>
          ColocManager
        </Link>
        <ThemeToggle className="theme-toggle--on-dark" />
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
            <div className="auth-page__row">
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
            </div>

            <div className="auth-page__field">
              <label htmlFor="register-email">Email</label>
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
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
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
        </div>
      </main>
    </div>
  )
}

export default Register
