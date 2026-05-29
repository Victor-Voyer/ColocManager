import { useState } from 'react'
import CreateColocationModal from '../CreateColocationModal/CreateColocationModal.jsx'
import JoinColocationModal from '../JoinColocationModal/JoinColocationModal.jsx'
import './NoColocationActions.css'

function NoColocationActions({
  variant = 'page',
  defaultCreateOpen = false,
  defaultJoinOpen = false,
  onSuccess,
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(defaultCreateOpen)
  const [isJoinOpen, setIsJoinOpen] = useState(defaultJoinOpen)

  const isCompact = variant === 'compact'
  const isSidebar = variant === 'sidebar'

  return (
    <>
      <div
        className={`no-coloc-actions no-coloc-actions--${variant}`}
      >
        {!isCompact && !isSidebar && (
          <p className="no-coloc-actions__hint">
            Créez votre foyer ou rejoignez-en un avec un code d&apos;invitation.
          </p>
        )}
        {isSidebar && (
          <>
            <h3>Votre colocation</h3>
            <p>Créez ou rejoignez un foyer pour commencer.</p>
          </>
        )}
        <div className="no-coloc-actions__buttons">
          <button
            type="button"
            className={
              isSidebar
                ? 'dashboard-layout__btn dashboard-layout__btn--white'
                : 'btn btn--primary'
            }
            onClick={() => setIsCreateOpen(true)}
          >
            + Créer un foyer
          </button>
          <button
            type="button"
            className={
              isSidebar
                ? 'dashboard-layout__btn dashboard-layout__btn--outline'
                : 'btn btn--neutral'
            }
            onClick={() => setIsJoinOpen(true)}
          >
            Rejoindre
          </button>
        </div>
      </div>

      <CreateColocationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={onSuccess}
      />
      <JoinColocationModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  )
}

export default NoColocationActions
