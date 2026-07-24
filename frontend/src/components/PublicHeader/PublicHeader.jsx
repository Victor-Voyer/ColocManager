import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import BurgerButton from '../BurgerButton/BurgerButton'
import Logo from '../Logo/Logo.jsx'
import { useAuth } from '../../context/AuthContext'
import { getAvatarUrl } from '../../utils/avatarUtils'
import './PublicHeader.css'

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Utilisateur'
  const avatarSrc = getAvatarUrl(displayName)
  const isHome = location.pathname === '/'
  const featuresHref = isHome ? '#features' : '/#features'
  const benefitsHref = isHome ? '#benefits' : '/#benefits'

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div
        className={`public-header__overlay${menuOpen ? ' public-header__overlay--open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <header className="public-header">
        <div className="public-header__inner">
          <Logo className="public-header__logo" variant="light" onClick={closeMenu} />

          <nav
            className={`public-header__nav${menuOpen ? ' public-header__nav--open' : ''}`}
            aria-label="Navigation principale"
          >
            <a href={featuresHref} className="public-header__nav-link" onClick={closeMenu}>
              Fonctionnalités
            </a>
            <a href={benefitsHref} className="public-header__nav-link" onClick={closeMenu}>
              Avantages
            </a>
            {!isBootstrapping && (
              isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="public-header__profile-btn"
                  onClick={closeMenu}
                >
                  <img
                    src={avatarSrc}
                    alt=""
                    className="public-header__profile-btn-avatar"
                    aria-hidden="true"
                  />
                  <span className="public-header__profile-btn-name">{displayName}</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="public-header__btn public-header__btn--neutral"
                    onClick={closeMenu}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="public-header__btn public-header__btn--primary"
                    onClick={closeMenu}
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )
            )}
          </nav>

          <BurgerButton
            isOpen={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="public-header__burger"
          />
        </div>
      </header>
    </>
  )
}

export default PublicHeader
