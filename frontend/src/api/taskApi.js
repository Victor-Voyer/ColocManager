import { apiRequest } from './client'
import { buildQuery } from '../utils/buildQuery'

export function listTasks(colocationId, filters = {}) {
  return apiRequest(`/colocations/${colocationId}/tasks${buildQuery(filters)}`)
}

export function listTaskHistory(colocationId) {
  return apiRequest(`/colocations/${colocationId}/tasks/history`)
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
