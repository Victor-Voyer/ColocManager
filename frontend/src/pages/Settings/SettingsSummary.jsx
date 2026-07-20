import { Home, Shield, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getAvatarUrl } from '../../utils/avatarUtils'

function SettingsSummary() {
  const { user } = useAuth()

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Utilisateur'
  const avatarSrc = getAvatarUrl(displayName)
  const isAdmin = user?.colocation?.role === 'admin'
  const colocationName = user?.colocation?.name

  return (
    <div className="settings-summary card">
      <img
        src={avatarSrc}
        alt={displayName}
        className="settings-summary__avatar"
      />
      <div className="settings-summary__info">
        <h2 className="settings-summary__name">{displayName}</h2>
        <p className="settings-summary__email">{user?.email}</p>
        <div className="settings-summary__badges">
          {user?.colocation ? (
            <>
              <span className={`settings-summary__badge settings-summary__badge--${isAdmin ? 'admin' : 'member'}`}>
                <Shield size={14} aria-hidden="true" />
                {isAdmin ? 'Administrateur' : 'Membre'}
              </span>
              <span className="settings-summary__badge settings-summary__badge--coloc">
                <Home size={14} aria-hidden="true" />
                {colocationName}
              </span>
            </>
          ) : (
            <span className="settings-summary__badge settings-summary__badge--none">
              <User size={14} aria-hidden="true" />
              Aucune colocation
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsSummary
