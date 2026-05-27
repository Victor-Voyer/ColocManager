import { useCallback, useEffect, useState } from 'react'
import * as colocationApi from '../api/colocationApi'
import * as expenseApi from '../api/expenseApi'
import { getErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 20

export function useExpenses(colocationId) {
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(colocationId))
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const refresh = useCallback(async () => {
    if (!colocationId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await expenseApi.listExpenses(colocationId, {
        page,
        limit: PAGE_SIZE,
      })
      setExpenses(data.items)
      setPagination(data.pagination)
    } catch (err) {
      setError(
        getErrorMessage(err, 'Impossible de charger les dépenses.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [colocationId, page])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!colocationId) {
      setMembers([])
      return
    }

    let cancelled = false

    colocationApi
      .getMembers(colocationId)
      .then((data) => {
        if (!cancelled) {
          setMembers(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMembers([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [colocationId])

  const upsertExpense = useCallback((updated) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    )
  }, [])

  const createExpense = useCallback(
    async (payload) => {
      setFormError('')
      setIsSubmitting(true)

      try {
        await expenseApi.createExpense(colocationId, payload)
        if (page !== 1) {
          setPage(1)
        } else {
          await refresh()
        }
        return true
      } catch (err) {
        setFormError(
          getErrorMessage(err, 'Impossible de créer la dépense.'),
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [colocationId, page, refresh],
  )

  const deleteExpense = useCallback(
    async (expenseId) => {
      setIsDeleting(true)

      try {
        await expenseApi.deleteExpense(colocationId, expenseId)
        await refresh()
        return true
      } catch (err) {
        setError(
          getErrorMessage(err, 'Impossible de supprimer la dépense.'),
        )
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [colocationId, refresh],
  )

  return {
    expenses,
    members,
    pagination,
    page,
    setPage,
    isLoading,
    error,
    formError,
    isSubmitting,
    isDeleting,
    createExpense,
    deleteExpense,
    upsertExpense,
    clearFormError: () => setFormError(''),
  }
}
