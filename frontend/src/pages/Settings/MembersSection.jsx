import { useState } from 'react'
import { useNavigate } from 'react-router'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import { useAuth } from '../../context/AuthContext'
import {
  getMembers,
  leaveColocation,
  removeMember,
  updateMemberRole,
} from '../../api/colocationApi'
import { useColocationMembers } from '../../hooks/useColocationMembers'
import { getErrorMessage } from '../../utils/apiError'

function MembersSection({ colocationId, colocationName, isAdmin }) {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { members, setMembers } = useColocationMembers(colocationId)
  const [colocationError, setColocationError] = useState('')
  const [memberToPromote, setMemberToPromote] = useState(null)
  const [transferringMemberId, setTransferringMemberId] = useState(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [removeError, setRemoveError] = useState('')

  const handleTransferAdmin = async (memberId) => {
    setTransferringMemberId(memberId)
    setColocationError('')

    try {
      await updateMemberRole(colocationId, memberId, { role: 'admin' })
      setMemberToPromote(null)
      await refreshUser()
      const updatedMembers = await getMembers(colocationId)
      setMembers(updatedMembers)
    } catch (err) {
      setColocationError(getErrorMessage(err, 'Transfert impossible.'))
    } finally {
      setTransferringMemberId(null)
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
    } catch (err) {
      setLeaveError(getErrorMessage(err, 'Impossible de quitter la colocation.'))
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
        currentMembers.filter((member) => member.id !== memberToRemove.id),
      )
      setMemberToRemove(null)
    } catch (err) {
      setRemoveError(getErrorMessage(err, 'Impossible de retirer ce membre.'))
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (!colocationId) {
    return null
  }

  return (
    <div className="card">
      <h2>Membres</h2>
      <p>
        <strong>{colocationName}</strong>
      </p>

      {colocationError && (
        <p className="settings-feedback settings-feedback--error" role="alert">
          {colocationError}
        </p>
      )}

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
                  <td>
                    {member.firstName} {member.lastName}
                  </td>
                  <td>
                    {member.role === 'admin' ? 'Administrateur' : 'Membre'}
                  </td>
                  {isAdmin && (
                    <td>
                      {member.id === user?.id ? (
                        <span>Vous</span>
                      ) : (
                        <div className="member-actions">
                          <button
                            type="button"
                            className="btn btn--neutral"
                            onClick={() => setMemberToPromote(member)}
                            disabled={transferringMemberId === member.id}
                          >
                            {transferringMemberId === member.id
                              ? 'Transfert…'
                              : 'Nommer administrateur'}
                          </button>
                          <button
                            type="button"
                            className="btn btn--neutral remove-member-button"
                            onClick={() => {
                              setRemoveError('')
                              setMemberToRemove(member)
                            }}
                            disabled={removingMemberId === member.id}
                          >
                            {removingMemberId === member.id
                              ? 'Retrait…'
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
      )}

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
        loadingLabel="Transfert…"
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
          leaveError || 'Voulez-vous vraiment quitter cette colocation ?'
        }
        confirmLabel="Quitter"
        loadingLabel="Départ…"
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
        loadingLabel="Retrait…"
        isLoading={Boolean(removingMemberId)}
      />
    </div>
  )
}

export default MembersSection
