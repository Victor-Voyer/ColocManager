import { apiRequest } from './client'

export function getMembers(colocationId) {
  return apiRequest(`/colocations/${colocationId}/members`)
}
