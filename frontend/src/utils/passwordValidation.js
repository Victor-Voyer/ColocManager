const PASSWORD_RULES = [
  {
    test: (password) => password.length >= 8,
    label: 'au moins 8 caractères',
  },
  {
    test: (password) => /[A-Z]/.test(password),
    label: 'une majuscule',
  },
  {
    test: (password) => /[a-z]/.test(password),
    label: 'une minuscule',
  },
  {
    test: (password) => /\d/.test(password),
    label: 'un chiffre',
  },
  {
    test: (password) => /[^A-Za-z0-9]/.test(password),
    label: 'un caractère spécial',
  },
]

export const PASSWORD_REQUIREMENTS_HINT =
  'Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'

export function getPasswordValidationErrors(password) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.label,
  )
}

export function formatPasswordValidationError(missingRequirements) {
  if (missingRequirements.length === 0) {
    return ''
  }

  return `Il manque : ${missingRequirements.join(', ')}.`
}
