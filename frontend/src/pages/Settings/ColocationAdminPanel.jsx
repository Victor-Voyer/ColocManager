import { useEffect, useState } from 'react'
import {
  getColocation,
  regenerateInvitationCode,
} from '../../api/colocationApi'

function ColocationAdminPanel({ colocationId, colocationName }) {
  const [invitationCode, setInvitationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!colocationId) {
      return
    }

    getColocation(colocationId)
      .then((colocation) => setInvitationCode(colocation.invitationCode))
      .catch(() => setError('Impossible de charger le code d\'invitation.'))
  }, [colocationId])

  const handleRegenerateCode = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await regenerateInvitationCode(colocationId)
      setInvitationCode(result.invitationCode)
    } catch (err) {
      setError(err.message ?? 'Impossible de régénérer le code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Colocation</h2>
      <p>
        <strong>{colocationName ?? 'Aucune colocation'}</strong>
      </p>

      {error && (
        <p className="settings-feedback settings-feedback--error" role="alert">
          {error}
        </p>
      )}

      <p>
        Code d&apos;invitation : <strong>{invitationCode || '…'}</strong>
      </p>

      <button
        type="button"
        className="btn btn--neutral"
        onClick={handleRegenerateCode}
        disabled={loading}
      >
        {loading ? 'Régénération…' : 'Régénérer le code'}
      </button>
    </div>
  )
}

export default ColocationAdminPanel
