import { useEffect, useState } from 'react'
import * as colocationApi from '../api/colocationApi'

export function useColocationMembers(colocationId) {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(colocationId))

  useEffect(() => {
    if (!colocationId) {
      setMembers([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

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
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [colocationId])

  return { members, setMembers, isLoading }
}
