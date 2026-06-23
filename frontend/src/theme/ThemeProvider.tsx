import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ThemeMode } from './tokens'
import { themeTokens } from './tokens'
import { ThemeContext } from './ThemeContext'

function applyTokens(mode: ThemeMode) {
  const root = document.documentElement
  const tokens = themeTokens[mode]
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value)
  }
  root.setAttribute('data-theme', mode)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cm-theme') as ThemeMode | null
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    applyTokens(theme)
    localStorage.setItem('cm-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext>
  )
}
