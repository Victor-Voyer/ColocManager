import { useState, useEffect } from 'react'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { getColocation, regenerateInvitationCode, updateMemberRole, getMembers, leaveColocation, removeMember } from '../../api/colocationApi'
import { useNavigate } from 'react-router'
import DeleteAccountDialog from '../../components/DeleteAccountDialog/DeleteAccountDialog.jsx'
import { getErrorMessage } from '../../utils/apiError'
import './Settings.css'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'

function Settings() {
  const { user, updateProfile, deleteAccount,refreshUser } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [memberToPromote, setMemberToPromote] = useState(null)
  const [transferringMemberId, setTransferringMemberId] = useState(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [removeError, setRemoveError] = useState('')

  const colocationId = user?.colocation?.id
  const isAdmin = user?.colocation?.role === 'admin'

  useEffect(() => {
    if (!colocationId || !isAdmin) {
      return
    }

    const loadColocation = async () => {
      const colocation = await getColocation(colocationId)
      setInvitationCode(colocation.invitationCode)
    }

    loadColocation()
  }, [colocationId, isAdmin])

  useEffect(() => {
    if (!colocationId) {
      return
    }

    const loadMembers = async () => {
      const result = await getMembers(colocationId)
      setMembers(result)
    }

    loadMembers()
  }, [colocationId])


  const handleTransferAdmin = async (memberId) => {
    setTransferringMemberId(memberId)
    setError('')

    try {
      const payload = {
        role: 'admin',
      }

      await updateMemberRole(colocationId, memberId, payload)
       setMemberToPromote(null)
      await refreshUser()

      const updatedMembers = await getMembers(colocationId)
      setMembers(updatedMembers)
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setTransferringMemberId(null)
    }
  }

  const handleRegenerateCode = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await regenerateInvitationCode(colocationId)
      setInvitationCode(result.invitationCode)
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleLeaveColocation = async () => {
    setIsLeaving(true)
    setLeaveError('')

    try {
      await leaveColocation(colocationId)
      setIsLeaveDialogOpen(false)
      await refreshUser()
      navigate('/dashboard')
    } catch (error) {
      setLeaveError(
        getErrorMessage(error, 'Impossible de quitter la colocation.'),
      )
    } finally {
      setIsLeaving(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) {
      return
    }

    setRemovingMemberId(memberToRemove.id)
    setRemoveError('')

    try {
      await removeMember(colocationId, memberToRemove.id)

      setMembers((currentMembers) =>
        currentMembers.filter(
          (member) => member.id !== memberToRemove.id,
        ),
      )

      setMemberToRemove(null)
    } catch (error) {
      setRemoveError(
        getErrorMessage(error, 'Impossible de retirer ce membre.'),
      )
    } finally {
      setRemovingMemberId(null)
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
          <p>
            <strong>{user?.colocation?.name ?? 'Aucune colocation'}</strong>
          </p>
          {isAdmin && (
            <div>
              <p>
                Code d'invitation : <strong>{invitationCode}</strong>
              </p>

              <button
                type="button"
                className="btn btn--neutral"
                onClick={handleRegenerateCode}
                disabled={loading}
              >
                {loading ? 'Régénération...' : 'Régénérer le code'}
              </button>
            </div>
          )}
          <h3>Membres</h3>
          {members.length === 0 ? (
            <p>Aucun membre dans cette colocation.</p>
          ) : (
            <div className="members-table-container">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Rôle</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.firstName} {member.lastName}</td>
                      <td>
                        {member.role === 'admin' ? 'Administrateur' : 'Membre'}
                      </td>
                      {isAdmin && (
                        <td>
                          {member.id === user?.id ? (
                            <span>Vous</span>
                          ) : (
                            <div className='member-actions'>
                              <button
                                type="button"
                                className="btn btn--neutral"
                                onClick={() => setMemberToPromote(member)}
                                disabled={transferringMemberId === member.id}>
                                {transferringMemberId === member.id
                                  ? 'Transfert...'
                                  : 'Nommer administrateur'}
                              </button>

                              <button
                                type="button"
                                className="btn remove-member-button"
                                onClick={() => {
                                  setRemoveError('')
                                  setMemberToRemove(member)
                                }}
                                disabled={removingMemberId === member.id}>
                                {removingMemberId === member.id
                                  ? 'Retrait...'
                                  : 'Retirer de la colocation'}
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <button
                  type="button"
                  className="btn settings-leave-button"
                  onClick={() => {
                    setLeaveError('')
                    setIsLeaveDialogOpen(true)
                  }}
                >
                  Quitter la colocation
                </button>
              </div>

            </div>
          )}
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

      <ConfirmDialog
        isOpen={Boolean(memberToPromote)}
        onClose={() => setMemberToPromote(null)}
        onConfirm={() => handleTransferAdmin(memberToPromote.id)}
        title="Transférer le rôle administrateur"
        message={
          `Confirmer le transfert à ${memberToPromote?.firstName} ` +
          `${memberToPromote?.lastName} ? Vous deviendrez membre.`
        }
        confirmLabel="Transférer"
        loadingLabel="Transfert..."
        isLoading={Boolean(transferringMemberId)}
      />

      <ConfirmDialog
        isOpen={isLeaveDialogOpen}
        onClose={() => {
          setIsLeaveDialogOpen(false)
          setLeaveError('')
        }}
        onConfirm={handleLeaveColocation}
        title="Quitter la colocation"
        message={
          leaveError ||
          'Voulez-vous vraiment quitter cette colocation ?'
        }
        confirmLabel="Quitter"
        loadingLabel="Départ..."
        isLoading={isLeaving}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => {
          setMemberToRemove(null)
          setRemoveError('')
        }}
        onConfirm={handleRemoveMember}
        title="Retirer un membre"
        message={
          removeError ||
          `Retirer ${memberToRemove?.firstName} ${memberToRemove?.lastName} de la colocation ?`
        }
        confirmLabel="Retirer"
        loadingLabel="Retrait..."
        isLoading={Boolean(removingMemberId)}
      />

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
