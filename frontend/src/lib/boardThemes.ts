// Board color presets for the chessboard. Each theme defines the light/dark
// square fills used by react-chessboard. Kept separate from the store so the
// settings UI and the board itself share one source of truth.

export type BoardTheme = {
  id: string
  label: string
  light: string
  dark: string
}

export const boardThemes: BoardTheme[] = [
  { id: 'green', label: 'Tournament Green', light: '#edeed1', dark: '#779952' },
  { id: 'brown', label: 'Classic Brown', light: '#f0d9b5', dark: '#b58863' },
  { id: 'blue', label: 'Ocean Blue', light: '#dee3e6', dark: '#7c98b3' },
  { id: 'walnut', label: 'Walnut', light: '#e8d2ac', dark: '#9b6a42' },
  { id: 'slate', label: 'Slate Gray', light: '#dfe2e8', dark: '#6f7d92' },
  { id: 'purple', label: 'Royal Purple', light: '#e6e0f0', dark: '#8a6db1' },
  { id: 'coral', label: 'Coral Sunset', light: '#fbe9e1', dark: '#d08b72' },
  { id: 'midnight', label: 'Midnight', light: '#9aa7bd', dark: '#3d4a63' },
]

export const DEFAULT_THEME_ID = 'green'

export function resolveBoardTheme(id: string): BoardTheme {
  return boardThemes.find(t => t.id === id) ?? boardThemes[0]
}
