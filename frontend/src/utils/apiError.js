import { ApiError } from '../api/client'

const ERROR_TRANSLATIONS = {
  'Invalid credentials.': 'Email ou mot de passe incorrect.',
  'Bad credentials': 'Email ou mot de passe incorrect.',
  'Identifiants invalides.': 'Email ou mot de passe incorrect.',
  'Authentication credentials could not be found.':
    'Veuillez saisir votre adresse e-mail et votre mot de passe.',
  'Full authentication is required to access this resource.':
    'Vous devez être connecté pour accéder à cette ressource.',
  'Access Denied.': 'Accès refusé.',
  'An authentication exception occurred.':
    'Une erreur d\'authentification est survenue.',
  'JWT Token not found': 'Vous devez être connecté pour accéder à cette ressource.',
  'Expired JWT Token': 'Votre session a expiré. Veuillez vous reconnecter.',
  'Invalid JWT Token': 'Session invalide. Veuillez vous reconnecter.',
  'This value should not be blank.': 'Ce champ est obligatoire.',
  'This value is not a valid email address.':
    'Cette adresse e-mail n\'est pas valide.',
  'This value is too short. It should have 8 characters or more.':
    'Cette valeur doit contenir au moins 8 caractères.',
  'This value is too short. It should have 1 character or more.':
    'Cette valeur doit contenir au moins 1 caractère.',
  'This value is too long. It should have 255 characters or less.':
    'Cette valeur ne doit pas dépasser 255 caractères.',
  'This value is too long. It should have 100 characters or less.':
    'Cette valeur ne doit pas dépasser 100 caractères.',
  'This value is too long. It should have 500 characters or less.':
    'Cette valeur ne doit pas dépasser 500 caractères.',
  'Une erreur est survenue.': 'Une erreur est survenue.',
}

export function translateErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return message
  }

  const trimmed = message.trim()
  return ERROR_TRANSLATIONS[trimmed] ?? ERROR_TRANSLATIONS[message] ?? message
}

export function getErrorMessage(err, fallback) {
  if (err instanceof ApiError) {
    return translateErrorMessage(err.message)
  }

  return fallback
}
