export function formatRelativeTime(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffH < 1) {
    return "À l'instant"
  }
  if (diffH < 24) {
    return `Il y a ${diffH}h`
  }

  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) {
    return 'Hier'
  }

  return `Il y a ${diffD}j`
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function localMonthKey(date = new Date()) {
  return localDateKey(date).slice(0, 7)
}
