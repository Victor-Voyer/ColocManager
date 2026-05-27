const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8088/api'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let handleUnauthorized = () => {}

export function setOnUnauthorized(fn) {
  handleUnauthorized = fn
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

export async function apiRequest(path, { skipAuthHandler = false, ...options } = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  const data = await parseResponse(response)

  if (response.status === 401 && !skipAuthHandler) {
    handleUnauthorized()
  }

  if (!response.ok) {
    const message =
      data?.error ??
      data?.message ??
      (data?.errors && typeof data.errors === 'object'
        ? Object.values(data.errors)[0]
        : null) ??
      'Une erreur est survenue.'
    throw new ApiError(message, response.status, data)
  }

  return data
}
