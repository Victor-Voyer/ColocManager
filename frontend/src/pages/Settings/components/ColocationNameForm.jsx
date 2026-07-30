import { useEffect, useState } from 'react'
import { updateColocation } from '../../../api/colocationApi'
import { getErrorMessage } from '../../../utils/apiError'

function ColocationNameForm({ colocationId, initialName, onUpdated }) {
  const [name, setName] = useState(initialName ?? '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setName(initialName ?? '')
  }, [initialName])

  const trimmedName = name.trim()
  const isUnchanged = trimmedName === (initialName ?? '').trim()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess(false)

    if (!trimmedName) {
      setError('Le nom de la colocation est obligatoire.')
      return
    }

    if (isUnchanged) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateColocation(colocationId, { name: trimmedName })
      await onUpdated()
      setSuccess(true)
    } catch (err) {
      setError(
        getErrorMessage(err, 'Impossible de mettre à jour le nom de la colocation.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="settings-feedback settings-feedback--error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="settings-feedback settings-feedback--success" role="status">
          Nom de la colocation mis à jour.
        </p>
      )}

      <div className="form__field">
        <label htmlFor="settings-colocation-name">Nom du foyer</label>
        <input
          id="settings-colocation-name"
          type="text"
          required
          maxLength={255}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setSuccess(false)
          }}
        />
      </div>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={isSubmitting || isUnchanged || !trimmedName}
      >
        {isSubmitting ? 'Enregistrement…' : 'Enregistrer le nom'}
      </button>
    </form>
  )
}

export default ColocationNameForm
