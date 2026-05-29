import { apiRequest } from './client'

export function updateProfile(payload) {
  return apiRequest('/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
