import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'
import Logo from '../../components/Logo/Logo.jsx'
import { useAuth } from '../../context/AuthContext'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="not-found">
      <header className="not-found__header">
        <Logo className="not-found__logo" variant="light" />
      </header>

      <main className="not-found__main">
        <div className="not-found__card" aria-labelledby="not-found-title">
          <div className="not-found__visual" aria-hidden="true">
            <span className="not-found__code">404</span>
            <span className="not-found__orb not-found__orb--blue" />
            <span className="not-found__orb not-found__orb--green" />
            <span className="not-found__orb not-found__orb--warm" />
          </div>

          <p className="not-found__eyebrow">Page introuvable</p>
          <h1 id="not-found-title" className="not-found__title">
            Cette pièce n&apos;existe pas dans la coloc
          </h1>
          <p className="not-found__text">
            L&apos;adresse que vous avez saisie est incorrecte, ou la page a
            déménagé. Revenez à l&apos;accueil ou reprenez votre navigation.
          </p>

          <div className="not-found__actions">
            <Link to="/" className="not-found__btn not-found__btn--primary">
              <Home size={18} aria-hidden="true" />
              Retour à l&apos;accueil
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="not-found__btn not-found__btn--secondary"
              >
                <LayoutDashboard size={18} aria-hidden="true" />
                Mon tableau de bord
              </Link>
            ) : (
              <Link to="/login" className="not-found__btn not-found__btn--secondary">
                Se connecter
              </Link>
            )}

            <button
              type="button"
              className="not-found__btn not-found__btn--ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Page précédente
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NotFound
