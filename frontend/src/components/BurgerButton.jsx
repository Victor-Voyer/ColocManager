function BurgerButton({ isOpen, onClick, className = '', label = 'Ouvrir le menu' }) {
  return (
    <button
      type="button"
      className={`burger-btn ${isOpen ? 'burger-btn--open' : ''} ${className}`.trim()}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Fermer le menu' : label}
    >
      <span className="burger-btn__line" />
      <span className="burger-btn__line" />
      <span className="burger-btn__line" />
    </button>
  )
}

export default BurgerButton
