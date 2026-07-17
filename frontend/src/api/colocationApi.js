import { apiRequest } from './client'

export function getMembers(colocationId) {
  return apiRequest(`/colocations/${colocationId}/members`)
}

export function getColocation(colocationId) {
  return apiRequest(`/colocations/${colocationId}`)
}

export function createColocation(payload) {
  return apiRequest(`/colocations`,{
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function joinColocation(payload) {
  return apiRequest(`/colocations/join`,{
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function regenerateInvitationCode(colocationId) {
  return apiRequest(`/colocations/${colocationId}/invitation-code/regenerate`,
    {
      method: 'POST',
    },
  )
}

export function updateMemberRole(colocationId, userId, payload) {
  return apiRequest(`/colocations/${colocationId}/members/${userId}/role`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export function leaveColocation(colocationId) {
  return apiRequest(`/colocations/${colocationId}/leave`,
    {
      method: 'POST',
    })
}
