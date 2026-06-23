import { use } from 'react'
import { ThemeContext } from './ThemeContext'

export function useTheme() {
  return use(ThemeContext)
}
