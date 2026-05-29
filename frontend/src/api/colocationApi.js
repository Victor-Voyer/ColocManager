import { apiRequest } from './client'

export function createColocation(payload) {
  return apiRequest('/colocations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function joinColocation(payload) {
  return apiRequest('/colocations/join', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getColocation(colocationId) {
  return apiRequest(`/colocations/${colocationId}`)
}

export function updateColocation(colocationId, payload) {
  return apiRequest(`/colocations/${colocationId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function regenerateInvitationCode(colocationId) {
  return apiRequest(`/colocations/${colocationId}/invitation-code/regenerate`, {
    method: 'POST',
  })
}

export function getMembers(colocationId) {
  return apiRequest(`/colocations/${colocationId}/members`)
}
