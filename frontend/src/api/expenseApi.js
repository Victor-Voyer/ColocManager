import { apiRequest } from './client'
import { buildQuery } from '../utils/buildQuery'

export function listExpenses(colocationId, filters = {}) {
  return apiRequest(
    `/colocations/${colocationId}/expenses${buildQuery(filters)}`,
  )
}

export function getBalances(colocationId) {
  return apiRequest(`/colocations/${colocationId}/balances`)
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
