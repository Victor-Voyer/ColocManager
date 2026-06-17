import { Menu, X } from 'lucide-react'
import './BurgerButton.css'

function BurgerButton({ isOpen, onClick, className = '', label = 'Ouvrir le menu' }) {
  return (
    <button
      type="button"
      className={`burger-btn ${className}`.trim()}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Fermer le menu' : label}
    >
      {isOpen ? (
        <X size={24} aria-hidden="true" />
      ) : (
        <Menu size={24} aria-hidden="true" />
      )}
    </button>
  )
}

export default BurgerButton
