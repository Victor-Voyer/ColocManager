import { useState } from 'react'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { formatDateTimeFr } from '../../../utils/dateUtils'

function InvitationCodeCard({
  invitationCode,
  invitationCodeExpiresAt,
  onRegenerate,
  isRegenerating = false,
  error = '',
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!invitationCode) {
      return
    }

    try {
      await navigator.clipboard.writeText(invitationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="settings-subsection">
      <div className="settings-subsection__header">
        <div>
          <h3>Code d&apos;invitation</h3>
          <p>Partagez ce code pour inviter de nouveaux colocataires.</p>
        </div>
      </div>

      {error && (
        <p className="settings-feedback settings-feedback--error" role="alert">
          {error}
        </p>
      )}

      <div className="invitation-code">
        <code className="invitation-code__value">
          {invitationCode || '…'}
        </code>
        <div className="invitation-code__actions">
          <button
            type="button"
            className="btn btn--neutral btn--with-icon"
            onClick={handleCopy}
            disabled={!invitationCode}
          >
            {copied ? (
              <>
                <Check size={16} aria-hidden="true" />
                Copié
              </>
            ) : (
              <>
                <Copy size={16} aria-hidden="true" />
                Copier
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn--neutral btn--with-icon"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {isRegenerating ? 'Régénération…' : 'Régénérer'}
          </button>
        </div>
      </div>

      {invitationCodeExpiresAt && (
        <p className="form__hint">
          Expire le {formatDateTimeFr(invitationCodeExpiresAt)}
        </p>
      )}
    </div>
  )
}

export default InvitationCodeCard
