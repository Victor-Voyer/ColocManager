import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import BurgerButton from '../BurgerButton/BurgerButton'
import './Layout.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'expenses', label: 'Expenses', icon: '💸', path: '/expenses' },
  { id: 'tasks', label: 'Tasks', icon: '✅', path: '/tasks' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
]

function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Utilisateur'
  const colocationName = user?.colocations?.[0]?.name ?? 'Aucune colocation'
  const avatarSrc =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff`

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
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
        <Link to="/" className="dashboard-layout__logo" onClick={closeMenu}>
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
          <h3>Invite Roommates</h3>
          <p>Manage your flat together.</p>
          <button className="dashboard-layout__btn dashboard-layout__btn--white">+ Invite Member</button>
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
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>

          <div className="dashboard-layout__topbar-right">
            <div className="dashboard-layout__user-profile">
              <div className="dashboard-layout__user-info">
                <span className="dashboard-layout__user-name">{displayName}</span>
                <span className="dashboard-layout__flat-name">{colocationName.toUpperCase()}</span>
              </div>
              <img
                src={avatarSrc}
                alt={displayName}
                className="dashboard-layout__user-avatar"
              />
            </div>
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
