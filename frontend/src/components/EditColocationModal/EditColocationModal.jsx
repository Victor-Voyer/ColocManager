import { useEffect, useState } from 'react'
import * as colocationApi from '../../api/colocationApi'
import { getErrorMessage } from '../../utils/apiError'
import ColocationForm from '../ColocationForm/ColocationForm.jsx'
import Modal from '../Modal/Modal.jsx'

function EditColocationModal({
  isOpen,
  onClose,
  colocationId,
  initialName = '',
  onSuccess,
}) {
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormError('')
    }
  }, [isOpen])

  const handleClose = () => {
    setFormError('')
    onClose()
  }

  const handleSubmit = async (payload) => {
    setFormError('')
    setIsSubmitting(true)

    try {
      const updated = await colocationApi.updateColocation(colocationId, payload)
      onSuccess?.(updated)
      handleClose()
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Impossible de modifier la colocation.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Modifier le foyer">
      <div className="modal__body">
        <ColocationForm
          key={initialName}
          initialName={initialName}
          submitLabel="Enregistrer"
          submittingLabel="Enregistrement…"
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          error={formError}
        />
      </div>
    </Modal>
  )
}

export default EditColocationModal
