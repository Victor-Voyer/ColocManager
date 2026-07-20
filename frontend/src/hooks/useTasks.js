import { useCallback, useEffect, useState } from 'react'
import * as taskApi from '../api/taskApi'
import { useColocationMembers } from './useColocationMembers'
import { getErrorMessage } from '../utils/apiError'

export function useTasks(colocationId) {
  const [tasks, setTasks] = useState([])
  const [history, setHistory] = useState([])
  const [filters, setFilters] = useState({ assignedTo: '' })
  const [isLoading, setIsLoading] = useState(Boolean(colocationId))
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { members } = useColocationMembers(colocationId)

  const refresh = useCallback(async () => {
    if (!colocationId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await taskApi.listTasks(colocationId, filters)
      setTasks(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les taches.'))
    } finally {
      setIsLoading(false)
    }
  }, [colocationId, filters])

  const refreshHistory = useCallback(async () => {
    if (!colocationId) {
      setHistory([])
      return
    }

    setIsHistoryLoading(true)

    try {
      const data = await taskApi.listTaskHistory(colocationId)
      setHistory(Array.isArray(data.items) ? data.items : [])
    } catch {
      setHistory([])
    } finally {
      setIsHistoryLoading(false)
    }
  }, [colocationId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const upsertTask = useCallback((updated) => {
    setTasks((prev) => {
      if (prev.some((task) => task.id === updated.id)) {
        return prev.map((task) => (task.id === updated.id ? updated : task))
      }

      return [updated, ...prev]
    })
  }, [])

  const createTask = useCallback(
    async (payload) => {
      setFormError('')
      setIsSubmitting(true)

      try {
        await taskApi.createTask(colocationId, payload)
        await refresh()
        await refreshHistory()
        return true
      } catch (err) {
        setFormError(getErrorMessage(err, 'Impossible de creer la tache.'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [colocationId, refresh, refreshHistory],
  )

  const updateTask = useCallback(
    async (taskId, payload) => {
      setFormError('')
      setIsSubmitting(true)

      try {
        const updated = await taskApi.updateTask(colocationId, taskId, payload)
        upsertTask(updated)
        await refreshHistory()
        return updated
      } catch (err) {
        setFormError(getErrorMessage(err, 'Impossible de modifier la tache.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [colocationId, refreshHistory, upsertTask],
  )

  const updateTaskStatus = useCallback(
    async (taskId, status) => {
      setError('')

      try {
        const updated = await taskApi.updateTaskStatus(
          colocationId,
          taskId,
          status,
        )
        upsertTask(updated)
        await refresh()
        await refreshHistory()
        return updated
      } catch (err) {
        setError(
          getErrorMessage(err, 'Impossible de modifier le statut de la tache.'),
        )
        return null
      }
    },
    [colocationId, refresh, refreshHistory, upsertTask],
  )

  const deleteTask = useCallback(
    async (taskId) => {
      setIsDeleting(true)

      try {
        await taskApi.deleteTask(colocationId, taskId)
        setTasks((prev) => prev.filter((task) => task.id !== taskId))
        await refreshHistory()
        return true
      } catch (err) {
        setError(getErrorMessage(err, 'Impossible de supprimer la tache.'))
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [colocationId, refreshHistory],
  )

  return {
    tasks,
    history,
    members,
    filters,
    setFilters,
    isLoading,
    isHistoryLoading,
    error,
    formError,
    isSubmitting,
    isDeleting,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    upsertTask,
    clearFormError: () => setFormError(''),
  }
}
