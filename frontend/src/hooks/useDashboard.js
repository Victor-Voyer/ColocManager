import { useCallback, useEffect, useState } from 'react'
import * as expenseApi from '../api/expenseApi'
import * as taskApi from '../api/taskApi'
import { getErrorMessage } from '../utils/apiError'

export function useDashboard(colocationId) {
  const [expenses, setExpenses] = useState([])
  const [tasks, setTasks] = useState([])
  const [taskHistory, setTaskHistory] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(colocationId))
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!colocationId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const [expenseData, taskData, taskHistoryData] = await Promise.all([
        expenseApi.getExpenseHistory(colocationId),
        taskApi.listTasks(colocationId),
        taskApi.listTaskHistory(colocationId),
      ])
      setExpenses(Array.isArray(expenseData.items) ? expenseData.items : [])
      setTasks(Array.isArray(taskData.items) ? taskData.items : [])
      setTaskHistory(
        Array.isArray(taskHistoryData.items) ? taskHistoryData.items : [],
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger le tableau de bord.'))
    } finally {
      setIsLoading(false)
    }
  }, [colocationId])

  useEffect(() => {
    void Promise.resolve().then(() => refresh())
  }, [refresh])

  return { expenses, tasks, taskHistory, isLoading, error, refresh }
}
