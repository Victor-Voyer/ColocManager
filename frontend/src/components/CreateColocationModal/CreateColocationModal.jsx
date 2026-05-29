import { useState } from 'react'
import * as colocationApi from '../../api/colocationApi'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/apiError'
import ColocationForm from '../ColocationForm/ColocationForm.jsx'
import Modal from '../Modal/Modal.jsx'

function CreateColocationModal({ isOpen, onClose, onSuccess }) {
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
      const created = await colocationApi.createColocation(payload)
      await refreshProfile()
      onSuccess?.(created)
      handleClose()
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Impossible de créer la colocation.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nouvelle colocation"
    >
      <div className="modal__body">
        <ColocationForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          error={formError}
        />
      </div>
    </Modal>
  )
}

export default CreateColocationModal
