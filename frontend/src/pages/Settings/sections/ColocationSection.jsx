import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Home, LogOut, Users } from 'lucide-react'
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog.jsx'
import {
  getColocation,
  getMembers,
  leaveColocation,
  regenerateInvitationCode,
  removeMember,
  updateMemberRole,
} from '../../../api/colocationApi'
import { useAuth } from '../../../context/AuthContext'
import { useColocationMembers } from '../../../hooks/useColocationMembers'
import { getErrorMessage } from '../../../utils/apiError'
import InvitationCodeCard from '../components/InvitationCodeCard.jsx'
import MemberListItem from '../components/MemberListItem.jsx'

function ColocationSection({ colocationId, colocationName, isAdmin }) {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { members, setMembers } = useColocationMembers(colocationId)

  const [invitationCode, setInvitationCode] = useState('')
  const [invitationCodeExpiresAt, setInvitationCodeExpiresAt] = useState(null)
  const [invitationError, setInvitationError] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [colocationError, setColocationError] = useState('')
  const [memberToPromote, setMemberToPromote] = useState(null)
  const [transferringMemberId, setTransferringMemberId] = useState(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [removeError, setRemoveError] = useState('')

  useEffect(() => {
    if (!colocationId || !isAdmin) {
      return
    }

    getColocation(colocationId)
      .then((colocation) => {
        setInvitationCode(colocation.invitationCode ?? '')
        setInvitationCodeExpiresAt(colocation.invitationCodeExpiresAt ?? null)
      })
      .catch(() => setInvitationError('Impossible de charger le code d\'invitation.'))
  }, [colocationId, isAdmin])

  const handleRegenerateCode = async () => {
    setIsRegenerating(true)
    setInvitationError('')

    try {
      const result = await regenerateInvitationCode(colocationId)
      setInvitationCode(result.invitationCode)
      setInvitationCodeExpiresAt(result.invitationCodeExpiresAt ?? null)
    } catch (err) {
      setInvitationError(getErrorMessage(err, 'Impossible de régénérer le code.'))
    } finally {
      setIsRegenerating(false)
    }
  }

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
    return (
      <div className="settings-section card settings-empty-coloc">
        <div className="settings-section__header">
          <Home size={22} aria-hidden="true" />
          <div>
            <h2>Colocation</h2>
            <p>Vous n&apos;appartenez à aucune colocation pour le moment.</p>
          </div>
        </div>
        <p className="settings-empty-coloc__text">
          Créez un nouveau foyer ou rejoignez-en un avec un code d&apos;invitation
          pour accéder aux dépenses, tâches et paramètres de colocation.
        </p>
        <Link to="/collocations" className="btn btn--primary">
          Créer ou rejoindre une colocation
        </Link>
      </div>
    )
  }

  return (
    <div className="settings-section card">
      <div className="settings-section__header">
        <Home size={22} aria-hidden="true" />
        <div>
          <h2>Ma colocation</h2>
          <p>Gérez votre foyer et ses membres.</p>
        </div>
      </div>

      <div className="settings-subsection">
        <div className="settings-subsection__header">
          <div>
            <h3>Informations</h3>
            <p>Détails de votre colocation actuelle.</p>
          </div>
        </div>
        <dl className="settings-info-list">
          <div className="settings-info-list__item">
            <dt>Nom du foyer</dt>
            <dd>{colocationName}</dd>
          </div>
          <div className="settings-info-list__item">
            <dt>Votre rôle</dt>
            <dd>{isAdmin ? 'Administrateur' : 'Membre'}</dd>
          </div>
        </dl>
      </div>

      {isAdmin && (
        <InvitationCodeCard
          invitationCode={invitationCode}
          invitationCodeExpiresAt={invitationCodeExpiresAt}
          onRegenerate={handleRegenerateCode}
          isRegenerating={isRegenerating}
          error={invitationError}
        />
      )}

      <div className="settings-subsection">
        <div className="settings-subsection__header">
          <Users size={20} aria-hidden="true" />
          <div>
            <h3>Membres</h3>
            <p>{members.length} membre{members.length > 1 ? 's' : ''} dans la colocation.</p>
          </div>
        </div>

        {colocationError && (
          <p className="settings-feedback settings-feedback--error" role="alert">
            {colocationError}
          </p>
        )}

        {members.length === 0 ? (
          <p className="form__hint">Aucun membre dans cette colocation.</p>
        ) : (
          <ul className="member-list">
            {members.map((member) => (
              <li key={member.id}>
                <MemberListItem
                  member={member}
                  isCurrentUser={member.id === user?.id}
                  isAdmin={isAdmin}
                  onPromote={() => setMemberToPromote(member)}
                  onRemove={() => {
                    setRemoveError('')
                    setMemberToRemove(member)
                  }}
                  isPromoting={transferringMemberId === member.id}
                  isRemoving={removingMemberId === member.id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="settings-subsection settings-leave-block">
        <div className="settings-subsection__header">
          <LogOut size={20} aria-hidden="true" />
          <div>
            <h3>Quitter la colocation</h3>
            <p>Vous ne pourrez plus accéder aux dépenses et tâches de ce foyer.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn settings-leave-block__button"
          onClick={() => {
            setLeaveError('')
            setIsLeaveDialogOpen(true)
          }}
        >
          Quitter la colocation
        </button>
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

export default ColocationSection
