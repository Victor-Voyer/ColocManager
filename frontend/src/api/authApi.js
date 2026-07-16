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

export function updateProfile({ firstName, lastName, email }) {
  return apiRequest('/me', {
    method: 'PUT',
    body: JSON.stringify({ firstName, lastName, email }),
  })
}
