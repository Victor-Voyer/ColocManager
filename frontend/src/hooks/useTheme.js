import { useEffect, useState } from 'react'
import { getTheme, toggleTheme } from '../utils/theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => getTheme())

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'coloc-theme') {
        setTheme(getTheme())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const toggle = () => {
    setTheme(toggleTheme())
  }

  return { theme, toggle, isDark: theme === 'dark' }
}
