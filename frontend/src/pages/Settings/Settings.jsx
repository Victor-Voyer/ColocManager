import { useEffect, useState } from 'react'
import * as colocationApi from '../../api/colocationApi'
import * as userApi from '../../api/userApi'
import EditColocationModal from '../../components/EditColocationModal/EditColocationModal.jsx'
import NoColocationActions from '../../components/NoColocationActions/NoColocationActions.jsx'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/apiError'
import './Settings.css'

function Settings() {
  const { user, refreshProfile } = useAuth()
  const colocationId = user?.colocations?.[0]?.id
  const membership = user?.colocations?.[0]

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [colocationName, setColocationName] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isEditColocationOpen, setIsEditColocationOpen] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setEmail(user.email ?? '')
    setColocationName(membership?.name ?? '')
  }, [user, membership?.name])

  useEffect(() => {
    if (!colocationId) {
      setInvitationCode('')
      setIsAdmin(false)
      return undefined
    }

    let cancelled = false

    colocationApi
      .getColocation(colocationId)
      .then((data) => {
        if (!cancelled) {
          setColocationName(data.name)
          setInvitationCode(data.invitationCode ?? '')
          setIsAdmin(data.role === 'admin')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvitationCode('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [colocationId])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setIsSavingProfile(true)

    try {
      await userApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      })
      await refreshProfile()
      setProfileSuccess('Profil enregistré.')
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Impossible de mettre à jour le profil.'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleColocationUpdated = (updated) => {
    setColocationName(updated.name)
    refreshProfile()
  }

  const handleCopyCode = async () => {
    if (!invitationCode) {
      return
    }

    try {
      await navigator.clipboard.writeText(invitationCode)
      setCopyFeedback('Code copié !')
    } catch {
      setCopyFeedback('Copie impossible')
    }

    window.setTimeout(() => setCopyFeedback(''), 2000)
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
          <form onSubmit={handleProfileSubmit}>
            {profileError && (
              <p className="settings-message settings-message--error" role="alert">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="settings-message settings-message--success" role="status">
                {profileSuccess}
              </p>
            )}
            <div className="form-group">
              <label htmlFor="settings-firstName">Prénom</label>
              <input
                id="settings-firstName"
                type="text"
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
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Colocation</h2>
          {colocationId ? (
            <>
              <p>
                Nom : <strong>{colocationName}</strong>
              </p>
              {isAdmin && invitationCode && (
                <p className="settings-invite">
                  Code d&apos;invitation : <code>{invitationCode}</code>
                  <button
                    type="button"
                    className="btn btn--neutral settings-copy-btn"
                    onClick={handleCopyCode}
                  >
                    {copyFeedback || 'Copier'}
                  </button>
                </p>
              )}
              <button
                type="button"
                className="btn btn--neutral"
                onClick={() => setIsEditColocationOpen(true)}
              >
                Modifier le foyer
              </button>
              <EditColocationModal
                isOpen={isEditColocationOpen}
                onClose={() => setIsEditColocationOpen(false)}
                colocationId={colocationId}
                initialName={colocationName}
                onSuccess={handleColocationUpdated}
              />
            </>
          ) : (
            <NoColocationActions variant="compact" />
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
