import { Shield, UserMinus } from 'lucide-react'
import { getAvatarUrl } from '../../../utils/avatarUtils'
import { formatMemberName } from '../../../utils/memberUtils'

function MemberListItem({
  member,
  isCurrentUser,
  isAdmin,
  onPromote,
  onRemove,
  isPromoting = false,
  isRemoving = false,
}) {
  const displayName = formatMemberName(member)
  const avatarSrc = getAvatarUrl(displayName, {
    background: 'E5E7EB',
    color: '374151',
  })
  const isMemberAdmin = member.role === 'admin'

  return (
    <div className="member-item">
      <img
        src={avatarSrc}
        alt=""
        className="member-item__avatar"
        aria-hidden="true"
      />
      <div className="member-item__info">
        <span className="member-item__name">
          {displayName}
          {isCurrentUser && <span className="member-item__you"> (vous)</span>}
        </span>
        <span className={`member-item__role member-item__role--${isMemberAdmin ? 'admin' : 'member'}`}>
          {isMemberAdmin ? 'Administrateur' : 'Membre'}
        </span>
      </div>

      {isAdmin && !isCurrentUser && (
        <div className="member-item__actions">
          {!isMemberAdmin && (
            <button
              type="button"
              className="member-item__action"
              onClick={onPromote}
              disabled={isPromoting}
              aria-label={`Nommer ${displayName} administrateur`}
              title="Nommer administrateur"
            >
              <Shield size={18} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="member-item__action member-item__action--danger"
            onClick={onRemove}
            disabled={isRemoving}
            aria-label={`Retirer ${displayName}`}
            title="Retirer de la colocation"
          >
            <UserMinus size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

export default MemberListItem
