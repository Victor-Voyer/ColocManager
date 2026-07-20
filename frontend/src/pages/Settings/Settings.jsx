import { useAuth } from '../../context/AuthContext'
import ColocationAdminPanel from './ColocationAdminPanel.jsx'
import DangerZone from './DangerZone.jsx'
import MembersSection from './MembersSection.jsx'
import ProfileSettings from './ProfileSettings.jsx'
import './Settings.css'

function Settings() {
  const { user } = useAuth()
  const colocationId = user?.colocation?.id
  const isAdmin = user?.colocation?.role === 'admin'

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez votre profil et votre colocation.</p>
        </div>
      </div>

      <div className="settings-grid">
        <ProfileSettings />

        {colocationId && isAdmin && (
          <ColocationAdminPanel
            colocationId={colocationId}
            colocationName={user?.colocation?.name}
          />
        )}

        {colocationId && (
          <MembersSection
            colocationId={colocationId}
            colocationName={user?.colocation?.name}
            isAdmin={isAdmin}
          />
        )}

        {!colocationId && (
          <div className="card">
            <h2>Colocation</h2>
            <p>Vous n&apos;appartenez à aucune colocation pour le moment.</p>
          </div>
        )}

        <DangerZone />
      </div>
    </div>
  )
}

export default Settings
