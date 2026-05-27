import { ApiError } from '../api/client'

export function getErrorMessage(err, fallback) {
  return err instanceof ApiError ? err.message : fallback
}
