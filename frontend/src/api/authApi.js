import { apiRequest } from './client'

export function login(email, password) {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuthHandler: true,
  })
}

export function register({ firstName, lastName, email, password }) {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
    skipAuthHandler: true,
  })
}

export function logout() {
  return apiRequest('/logout', {
    method: 'POST',
    skipAuthHandler: true,
  })
}

export function getMe(options = {}) {
  return apiRequest('/me', options)
}

export function updateProfile({ firstName, lastName, email, currentPassword, newPassword }) {
  const payload = {}

  if (firstName !== undefined) {
    payload.firstName = firstName
  }
  if (lastName !== undefined) {
    payload.lastName = lastName
  }
  if (email !== undefined) {
    payload.email = email
  }
  if (currentPassword !== undefined) {
    payload.currentPassword = currentPassword
  }
  if (newPassword !== undefined) {
    payload.newPassword = newPassword
  }

  return apiRequest('/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAccount(password) {
  return apiRequest('/me', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  })
}
