import { Link, useLocation } from 'react-router'
import './Layout.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'expenses', label: 'Expenses', icon: '💸', path: '/expenses' },
  { id: 'tasks', label: 'Tasks', icon: '✅', path: '/tasks' },
  { id: 'shopping', label: 'Shopping List', icon: '🛒', path: '/shopping' },
  { id: 'messages', label: 'Messages', icon: '💬', path: '/messages' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
]

function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-layout__sidebar">
        <Link to="/" className="dashboard-layout__logo">
          <span className="dashboard-layout__logo-icon">🏠</span>
          <span className="dashboard-layout__logo-text">ColocManager</span>
        </Link>

        <nav className="dashboard-layout__nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
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

        <button className="dashboard-layout__logout">
          <span className="dashboard-layout__logout-icon">🚪</span>
          <span>Log out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-layout__main">
        {/* Top Bar */}
        <header className="dashboard-layout__topbar">
          <div className="dashboard-layout__search">
            <span className="dashboard-layout__search-icon">🔍</span>
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className="dashboard-layout__user-actions">
            <button className="dashboard-layout__notification-btn" aria-label="Notifications">
              🔔
              <span className="dashboard-layout__notification-badge" />
            </button>
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
