export function formatDateFr(value, style = 'short', fallback = null) {
  if (!value) {
    return fallback
  }

  const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`)
  const options =
    style === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' }

  return date.toLocaleDateString('fr-FR', options)
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
