import { useState } from 'react'
import Modal from '../Modal/Modal.jsx'
import './DeleteAccountDialog.css'

function DeleteAccountDialog({ isOpen, onClose, onConfirm, isLoading = false, error = '' }) {
  const [password, setPassword] = useState('')

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onConfirm(password)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Supprimer mon compte">
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal__body">
          <p className="delete-account-dialog__message">
            Cette action est irréversible : toutes vos données (dépenses, tâches,
            appartenance à une colocation) seront définitivement supprimées.
            Saisissez votre mot de passe pour confirmer.
          </p>

          {error && (
            <p className="delete-account-dialog__error" role="alert">
              {error}
            </p>
          )}

          <div className="delete-account-dialog__field">
            <label htmlFor="delete-account-password">Mot de passe</label>
            <input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>
        <footer className="modal__footer">
          <button
            type="button"
            className="btn btn--neutral"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn delete-account-dialog__danger"
            disabled={isLoading || !password}
          >
            {isLoading ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}

export default DeleteAccountDialog
