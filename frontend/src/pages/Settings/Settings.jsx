import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import DeleteAccountDialog from '../../components/DeleteAccountDialog/DeleteAccountDialog.jsx'
import { getErrorMessage } from '../../utils/apiError'
import './Settings.css'

function Settings() {
  const { user, updateProfile, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      })
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Mise à jour impossible. Vérifiez vos informations.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async (password) => {
    setDeleteError('')
    setIsDeleting(true)

    try {
      await deleteAccount(password)
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Suppression du compte impossible.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setDeleteError('')
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez votre profil et votre colocation.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <h2>Profil</h2>

          {error && (
            <p className="settings-feedback settings-feedback--error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="settings-feedback settings-feedback--success" role="status">
              Profil mis à jour.
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="settings-firstName">Prénom</label>
              <input
                id="settings-firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-lastName">Nom</label>
              <input
                id="settings-lastName"
                type="text"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="settings-email">Email</label>
              <input
                id="settings-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </div>
        <div className="card">
          <h2>Colocation</h2>
          <p>Nom : <strong>THE BIG FLATROOM</strong></p>
          <p>Code d&apos;invitation : <code>BF-2026-XYZ</code></p>
          <button className="btn btn--neutral">Modifier le foyer</button>
        </div>
        <div className="card settings-danger-zone">
          <h2>Zone dangereuse</h2>
          <p>
            La suppression de votre compte est définitive et irréversible.
            Elle est impossible si vous avez des dettes actives non réglées,
            ou si vous êtes le seul administrateur d&apos;une colocation avec
            d&apos;autres membres.
          </p>
          <button
            type="button"
            className="btn settings-danger-zone__btn"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  )
}

export default Settings
