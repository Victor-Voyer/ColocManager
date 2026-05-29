import { useState } from 'react'
import * as colocationApi from '../../api/colocationApi'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/apiError'
import JoinColocationForm from '../JoinColocationForm/JoinColocationForm.jsx'
import Modal from '../Modal/Modal.jsx'

function JoinColocationModal({ isOpen, onClose, onSuccess }) {
  const { refreshProfile } = useAuth()
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setFormError('')
    onClose()
  }

  const handleSubmit = async (payload) => {
    setFormError('')
    setIsSubmitting(true)

    try {
      const joined = await colocationApi.joinColocation(payload)
      await refreshProfile()
      onSuccess?.(joined)
      handleClose()
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Impossible de rejoindre la colocation.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rejoindre un foyer">
      <div className="modal__body">
        <JoinColocationForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          error={formError}
        />
      </div>
    </Modal>
  )
}

export default JoinColocationModal
