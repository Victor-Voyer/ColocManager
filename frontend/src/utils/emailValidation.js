const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getEmailValidationError(email) {
  const trimmed = email.trim()

  if (!trimmed) {
    return 'Ce champ est obligatoire.'
  }

  if (!EMAIL_FORMAT_REGEX.test(trimmed)) {
    return 'Cette adresse e-mail n\'est pas valide.'
  }

  return ''
}
