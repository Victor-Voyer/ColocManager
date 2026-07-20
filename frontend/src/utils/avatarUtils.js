export function getAvatarUrl(name, { background = '3B82F6', color = 'fff' } = {}) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}`
}
