import { useEffect } from 'react'
import './Modal.css'

function Modal({ isOpen, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`modal${wide ? ' modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Fermer"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}

export default Modal
