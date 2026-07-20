import { useState } from 'react'
import { useNavigate } from 'react-router'
import DeleteAccountDialog from '../../components/DeleteAccountDialog/DeleteAccountDialog.jsx'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/apiError'

function DangerZone() {
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

export default DangerZone
