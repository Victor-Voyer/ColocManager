import { useState } from 'react'
import './ColocationForm.css'

function ColocationForm({
  initialName = '',
  submitLabel = 'Créer',
  submittingLabel = 'Création…',
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = '',
}) {
  const [name, setName] = useState(initialName)

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({ name: name.trim() })
  }

  return (
    <form className="colocation-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="colocation-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="colocation-form__field">
        <label htmlFor="colocation-name">Nom de la colocation</label>
        <input
          id="colocation-name"
          type="text"
          required
          maxLength={255}
          placeholder="THE BIG FLATROOM"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </div>

      <footer className="modal__footer">
        <button
          type="button"
          className="btn btn--neutral"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </footer>
    </form>
  )
}

export default ColocationForm
