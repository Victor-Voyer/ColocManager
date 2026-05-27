import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authApi from '../api/authApi'
import { setOnUnauthorized } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const clearSession = useCallback(() => {
    setUser(null)
  }, [])

  useEffect(() => {
    setOnUnauthorized(clearSession)
  }, [clearSession])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const profile = await authApi.getMe({ skipAuthHandler: true })
        if (!cancelled) {
          setUser(profile)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    await authApi.login(email, password)
    const profile = await authApi.getMe()
    setUser(profile)
    return profile
  }, [])

  const register = useCallback(async (payload) => {
    await authApi.register(payload)
    const profile = await authApi.getMe()
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [user, isBootstrapping, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook couplé au provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider.')
  }
  return context
}
