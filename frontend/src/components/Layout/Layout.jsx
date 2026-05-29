import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import * as colocationApi from '../../api/colocationApi'
import { useAuth } from '../../context/AuthContext'
import BurgerButton from '../BurgerButton/BurgerButton'
import NoColocationActions from '../NoColocationActions/NoColocationActions.jsx'
import './Layout.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'expenses', label: 'Expenses', icon: '💸', path: '/expenses' },
  { id: 'tasks', label: 'Tasks', icon: '✅', path: '/tasks' },
  { id: 'shopping', label: 'Shopping List', icon: '🛒', path: '/shopping' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
]

function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')

  const colocationId = user?.colocations?.[0]?.id
  const isAdmin = user?.colocations?.[0]?.role === 'admin'

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Utilisateur'
  const colocationName = user?.colocations?.[0]?.name ?? 'Aucune colocation'
  const avatarSrc =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff`

  useEffect(() => {
    if (!colocationId || !isAdmin) {
      setInvitationCode('')
      return undefined
    }

    let cancelled = false

    colocationApi
      .getColocation(colocationId)
      .then((data) => {
        if (!cancelled) {
          setInvitationCode(data.invitationCode ?? '')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvitationCode('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [colocationId, isAdmin])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleCopyInvitationCode = async () => {
    if (!invitationCode) {
      return
    }

    try {
      await navigator.clipboard.writeText(invitationCode)
      setCopyFeedback('Code copié !')
    } catch {
      setCopyFeedback('Copie impossible')
    }

    window.setTimeout(() => setCopyFeedback(''), 2000)
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
    <div className={`dashboard-layout ${menuOpen ? 'dashboard-layout--menu-open' : ''}`}>
      <div
        className="dashboard-layout__overlay"
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside className="dashboard-layout__sidebar">
        <Link to="/dashboard" className="dashboard-layout__logo" onClick={closeMenu}>
          <span className="dashboard-layout__logo-icon">🏠</span>
          <span className="dashboard-layout__logo-text">ColocManager</span>
        </Link>

        <nav className="dashboard-layout__nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={closeMenu}
              className={`dashboard-layout__nav-item ${
                location.pathname === item.path ? 'dashboard-layout__nav-item--active' : ''
              }`}
            >
              <span className="dashboard-layout__nav-icon">{item.icon}</span>
              <span className="dashboard-layout__nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="dashboard-layout__invite-card">
          {colocationId ? (
            <>
              <h3>Invite Roommates</h3>
              <p>
                {isAdmin && invitationCode
                  ? `Code : ${invitationCode}`
                  : 'Invitez vos colocataires à rejoindre le foyer.'}
              </p>
              {isAdmin && invitationCode && (
                <button
                  type="button"
                  className="dashboard-layout__btn dashboard-layout__btn--white"
                  onClick={handleCopyInvitationCode}
                >
                  {copyFeedback || '+ Copier le code'}
                </button>
              )}
            </>
          ) : (
            <NoColocationActions variant="sidebar" />
          )}
        </div>

        <button
          className="dashboard-layout__logout"
          type="button"
          onClick={handleLogout}
        >
          <span className="dashboard-layout__logout-icon">🚪</span>
          <span>Déconnexion</span>
        </button>
      </aside>

      <main className="dashboard-layout__main">
        <header className="dashboard-layout__topbar">
          <div className="dashboard-layout__topbar-center">
            <div className="dashboard-layout__search">
              <span className="dashboard-layout__search-icon">🔍</span>
              <input type="text" placeholder="Search anything..." disabled />
            </div>
          </div>

          <div className="dashboard-layout__topbar-right">
            <Link
              to="/settings"
              className="dashboard-layout__user-profile"
              onClick={closeMenu}
            >
              <div className="dashboard-layout__user-info">
                <span className="dashboard-layout__user-name">{displayName}</span>
                <span className="dashboard-layout__flat-name">{colocationName.toUpperCase()}</span>
              </div>
              <img
                src={avatarSrc}
                alt={displayName}
                className="dashboard-layout__user-avatar"
              />
            </Link>
            <BurgerButton
              isOpen={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="dashboard-layout__burger"
            />
          </div>
        </header>

        <div className="dashboard-layout__content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
