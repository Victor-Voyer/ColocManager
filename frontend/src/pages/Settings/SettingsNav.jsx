import { AlertTriangle, Home, User } from 'lucide-react'

const SECTIONS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'colocation', label: 'Colocation', icon: Home },
  { id: 'account', label: 'Compte', icon: AlertTriangle },
]

function SettingsNav({ activeSection, onSectionChange }) {
  return (
    <nav className="settings-nav" aria-label="Sections des paramètres">
      <ul className="settings-nav__list">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <li key={section.id}>
              <button
                type="button"
                className={`settings-nav__item${isActive ? ' settings-nav__item--active' : ''}`}
                onClick={() => onSectionChange(section.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                {section.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default SettingsNav
