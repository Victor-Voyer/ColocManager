import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import BurgerButton from './BurgerButton'
import './BurgerButton.css'
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
  const [menuOpen, setMenuOpen] = useState(false)

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

        <button className="dashboard-layout__logout" type="button">
          <span className="dashboard-layout__logout-icon">🚪</span>
          <span>Log out</span>
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
                <span className="dashboard-layout__user-name">Alex Rivera</span>
                <span className="dashboard-layout__flat-name">THE BIG FLATROOM</span>
              </div>
              <img
                src="https://ui-avatars.com/api/?name=Alex+Rivera&background=3B82F6&color=fff"
                alt="Alex Rivera"
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
