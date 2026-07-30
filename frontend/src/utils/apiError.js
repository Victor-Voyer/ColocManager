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
  'Ressource introuvable.': 'Ressource introuvable.',
  'Accès refusé.': 'Accès refusé.',
  'Données invalides.': 'Données invalides.',
  'Impossible de créer le compte. Vérifiez vos informations.':
    'Impossible de créer le compte. Vérifiez vos informations.',
  'Impossible de mettre à jour le profil. Vérifiez vos informations.':
    'Impossible de mettre à jour le profil. Vérifiez vos informations.',
  'Informations incorrectes.': 'Informations incorrectes.',
  'Impossible de rejoindre la colocation.': 'Impossible de rejoindre la colocation.',
}

const LEGACY_SENSITIVE_MESSAGES = {
  'Cet email est déjà utilisé.': 'Impossible de créer le compte. Vérifiez vos informations.',
  'Mot de passe actuel incorrect.': 'Informations incorrectes.',
  'Mot de passe incorrect.': 'Informations incorrectes.',
  'Colocation introuvable.': 'Accès refusé.',
  'Accès refusé : vous n\'êtes pas membre de cette colocation.': 'Accès refusé.',
  'Utilisateur introuvable.': 'Ressource introuvable.',
  'Tâche introuvable.': 'Ressource introuvable.',
  'Dépense introuvable.': 'Ressource introuvable.',
  'Membre introuvable.': 'Ressource introuvable.',
  'Payeur introuvable.': 'Ressource introuvable.',
  'Part de dépense introuvable.': 'Ressource introuvable.',
  'Cet utilisateur ne fait pas partie de la colocation.': 'Ressource introuvable.',
  'Code d\'invitation invalide.': 'Impossible de rejoindre la colocation.',
  'Le code d\'invitation a expiré.': 'Impossible de rejoindre la colocation.',
  'Utilisez POST /leave pour quitter la colocation.': 'Action impossible.',
  'Impossible d\'exclure ce membre : il a des dettes actives non réglées.':
    'Impossible d\'exclure ce membre.',
}

export const STATUS_FALLBACKS = {
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  409: 'Action impossible.',
  422: 'Données invalides.',
  500: 'Une erreur est survenue.',
}

export function translateErrorMessage(message) {
  if (!message || typeof message !== 'string') {
    return message
  }

  const trimmed = message.trim()
  return ERROR_TRANSLATIONS[trimmed] ?? ERROR_TRANSLATIONS[message] ?? message
}

export function sanitizeErrorMessage(message, status) {
  if (!message || typeof message !== 'string') {
    return STATUS_FALLBACKS[status] ?? 'Une erreur est survenue.'
  }

  const trimmed = message.trim()

  if (LEGACY_SENSITIVE_MESSAGES[trimmed]) {
    return LEGACY_SENSITIVE_MESSAGES[trimmed]
  }

  if (/L'utilisateur \d+ n'est pas membre/.test(trimmed)) {
    return STATUS_FALLBACKS[404] ?? 'Ressource introuvable.'
  }

  if (/Format de date invalide pour "/.test(trimmed)) {
    return 'Date invalide.'
  }

  return translateErrorMessage(trimmed)
}

export function getErrorMessage(err, fallback) {
  if (err instanceof ApiError) {
    return sanitizeErrorMessage(err.message, err.status) ?? fallback
  }

  return fallback
}
