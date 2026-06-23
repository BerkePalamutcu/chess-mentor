import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_THEME_ID } from './boardThemes'

// Board styling lives in global state (zustand) rather than React context so any
// screen rendering a board — and the settings page — reads the same preferences,
// persisted to localStorage across sessions.

export type BoardSettings = {
  themeId: string
  showNotation: boolean
  showAnimations: boolean
}

type BoardStore = BoardSettings & {
  setThemeId: (themeId: string) => void
  setShowNotation: (showNotation: boolean) => void
  setShowAnimations: (showAnimations: boolean) => void
  reset: () => void
}

const DEFAULTS: BoardSettings = {
  themeId: DEFAULT_THEME_ID,
  showNotation: true,
  showAnimations: true,
}

export const useBoardSettings = create<BoardStore>()(
  persist(
    set => ({
      ...DEFAULTS,
      setThemeId: themeId => set({ themeId }),
      setShowNotation: showNotation => set({ showNotation }),
      setShowAnimations: showAnimations => set({ showAnimations }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'cm-board-settings' },
  ),
)
