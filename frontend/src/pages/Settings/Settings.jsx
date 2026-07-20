import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import SettingsNav from './SettingsNav.jsx'
import SettingsSummary from './SettingsSummary.jsx'
import AccountSection from './sections/AccountSection.jsx'
import ColocationSection from './sections/ColocationSection.jsx'
import ProfileSection from './sections/ProfileSection.jsx'
import './Settings.css'

const VALID_SECTIONS = ['profile', 'colocation', 'account']

function Settings() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const colocationId = user?.colocation?.id
  const isAdmin = user?.colocation?.role === 'admin'

  const sectionParam = searchParams.get('section')
  const activeSection = VALID_SECTIONS.includes(sectionParam)
    ? sectionParam
    : 'profile'

  useEffect(() => {
    if (sectionParam && !VALID_SECTIONS.includes(sectionParam)) {
      setSearchParams({ section: 'profile' }, { replace: true })
    }
  }, [sectionParam, setSearchParams])

  const handleSectionChange = (section) => {
    setSearchParams({ section }, { replace: true })
  }

  return (
    <div className="page-content settings-page">
      <div className="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez votre profil et votre colocation.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-layout__sidebar">
          <SettingsNav
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </aside>

        <div className="settings-layout__content">
          <SettingsSummary />

          {activeSection === 'profile' && <ProfileSection />}

          {activeSection === 'colocation' && (
            <ColocationSection
              colocationId={colocationId}
              colocationName={user?.colocation?.name}
              isAdmin={isAdmin}
            />
          )}

          {activeSection === 'account' && <AccountSection />}
        </div>
      </div>
    </div>
  )
}

export default Settings
