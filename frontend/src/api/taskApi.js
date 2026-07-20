import { apiRequest } from './client'

function buildQuery(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function listTasks(colocationId, filters = {}) {
  return apiRequest(`/colocations/${colocationId}/tasks${buildQuery(filters)}`)
}

export function listTaskHistory(colocationId) {
  return apiRequest(`/colocations/${colocationId}/tasks/history`)
}

export function getTask(colocationId, taskId) {
  return apiRequest(`/colocations/${colocationId}/tasks/${taskId}`)
}

export function createTask(colocationId, payload) {
  return apiRequest(`/colocations/${colocationId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(colocationId, taskId, payload) {
  return apiRequest(`/colocations/${colocationId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(colocationId, taskId) {
  return apiRequest(`/colocations/${colocationId}/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

export function updateTaskStatus(colocationId, taskId, status) {
  return apiRequest(`/colocations/${colocationId}/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
