export function formatMemberName(member, fallback = 'Non assigné') {
  if (!member) {
    return fallback
  }

  return `${member.firstName} ${member.lastName}`.trim()
}
