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

export function listExpenses(colocationId, filters = {}) {
  return apiRequest(
    `/colocations/${colocationId}/expenses${buildQuery(filters)}`,
  )
}

export function getExpenseHistory(colocationId) {
  return apiRequest(`/colocations/${colocationId}/expenses/history`)
}

export function getExpense(colocationId, expenseId) {
  return apiRequest(`/colocations/${colocationId}/expenses/${expenseId}`)
}

export function createExpense(colocationId, payload) {
  return apiRequest(`/colocations/${colocationId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteExpense(colocationId, expenseId) {
  return apiRequest(`/colocations/${colocationId}/expenses/${expenseId}`, {
    method: 'DELETE',
  })
}

export function markShareAsPaid(expenseId, userId) {
  return apiRequest(`/expenses/${expenseId}/shares/${userId}/pay`, {
    method: 'PATCH',
  })
}

export function markShareAsUnpaid(expenseId, userId) {
  return apiRequest(`/expenses/${expenseId}/shares/${userId}/unpay`, {
    method: 'PATCH',
  })
}
