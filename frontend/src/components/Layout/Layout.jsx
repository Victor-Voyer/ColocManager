import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Wallet,
  ListChecks,
  ShoppingCart,
  Settings,
  LogOut,
  Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BurgerButton from '../BurgerButton/BurgerButton'
import Logo from '../Logo/Logo'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import './Layout.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'expenses', label: 'Expenses', icon: Wallet, path: '/expenses' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, path: '/tasks' },
  { id: 'shopping', label: 'Shopping List', icon: ShoppingCart, path: '/shopping' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
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
          <Logo
            iconSize={24}
            iconClassName="dashboard-layout__logo-icon"
            textClassName="dashboard-layout__logo-text"
          />
        </Link>

        <nav className="dashboard-layout__nav" aria-label="Navigation principale">
          {navItems.map((item) => {
            const NavIcon = item.icon
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={closeMenu}
                className={`dashboard-layout__nav-item ${
                  location.pathname === item.path ? 'dashboard-layout__nav-item--active' : ''
                }`}
              >
                <NavIcon className="dashboard-layout__nav-icon" size={20} aria-hidden="true" />
                <span className="dashboard-layout__nav-label">{item.label}</span>
              </Link>
            )
          })}
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
          <LogOut className="dashboard-layout__logout-icon" size={20} aria-hidden="true" />
          <span>Déconnexion</span>
        </button>
      </aside>

      <main className="dashboard-layout__main">
        <header className="dashboard-layout__topbar">
          <div className="dashboard-layout__topbar-center">
            <div className="dashboard-layout__search">
              <Search className="dashboard-layout__search-icon" size={18} aria-hidden="true" />
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>

          <div className="dashboard-layout__topbar-right">
            <ThemeToggle />
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
