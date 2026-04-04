'use client'

import { createContext, ReactNode, useContext, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type Theme = 'light' | 'dark'

const sanitizeTheme = (theme: string): Theme =>
  theme === 'light' || theme === 'dark' ? theme : 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useLocalStorage<Theme>('prefers-color-scheme', () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  )
  const sanitized = sanitizeTheme(theme)

  if (theme !== sanitized) {
    setTheme(sanitized)
  }

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)

  if (context === null) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
