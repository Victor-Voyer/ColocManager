import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle } from 'lucide-react'
import DeleteAccountDialog from '../../../components/DeleteAccountDialog/DeleteAccountDialog.jsx'
import { useAuth } from '../../../context/AuthContext'
import { getErrorMessage } from '../../../utils/apiError'

function AccountSection() {
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <div className="settings-section card settings-danger-zone">
      <div className="settings-section__header">
        <AlertTriangle size={22} aria-hidden="true" />
        <div>
          <h2>Compte</h2>
          <p>Actions sensibles liées à votre compte.</p>
        </div>
      </div>

      <div className="settings-subsection">
        <div className="settings-subsection__header">
          <div>
            <h3>Supprimer mon compte</h3>
            <p>
              La suppression est définitive et irréversible. Elle est impossible
              si vous avez des dettes actives non réglées, ou si vous êtes le seul
              administrateur d&apos;une colocation avec d&apos;autres membres.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn settings-danger-zone__btn"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Supprimer mon compte
        </button>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeleteError('')
        }}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  )
}

export default AccountSection
