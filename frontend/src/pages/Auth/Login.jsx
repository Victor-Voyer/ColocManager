import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import './Auth.css'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Connexion impossible. Vérifiez vos identifiants.',
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
          <h1 className="auth-page__title">Connexion</h1>
          <p className="auth-page__subtitle">
            Accédez à votre espace colocation.
          </p>

          {error && (
            <p className="auth-page__error" role="alert">
              {error}
            </p>
          )}

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
            <div className="auth-page__field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="auth-page__field">
              <label htmlFor="login-password">Mot de passe</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
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
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-page__footer">
            Pas encore de compte ?{' '}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login
