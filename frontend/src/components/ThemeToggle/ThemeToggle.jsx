import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import './ThemeToggle.css'

function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggle}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? (
        <Sun className="theme-toggle__icon" size={18} aria-hidden="true" />
      ) : (
        <Moon className="theme-toggle__icon" size={18} aria-hidden="true" />
      )}
    </button>
  )
}

export default ThemeToggle
