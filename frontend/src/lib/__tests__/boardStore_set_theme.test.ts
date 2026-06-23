import { describe, it, expect } from 'vitest'
import { useBoardSettings } from '../boardStore'

describe('boardStore', () => {
  it('updates the selected theme and toggles', () => {
    useBoardSettings.getState().setThemeId('brown')
    useBoardSettings.getState().setShowNotation(false)
    useBoardSettings.getState().setShowAnimations(false)

    const state = useBoardSettings.getState()
    expect(state.themeId).toBe('brown')
    expect(state.showNotation).toBe(false)
    expect(state.showAnimations).toBe(false)
  })
})
