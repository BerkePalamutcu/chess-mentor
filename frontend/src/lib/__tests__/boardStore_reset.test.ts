import { describe, it, expect } from 'vitest'
import { useBoardSettings } from '../boardStore'

describe('boardStore', () => {
  it('reset restores every setting to its default', () => {
    const store = useBoardSettings.getState()
    store.setThemeId('purple')
    store.setShowNotation(false)
    store.setShowAnimations(false)

    useBoardSettings.getState().reset()

    const state = useBoardSettings.getState()
    expect(state.themeId).toBe('green')
    expect(state.showNotation).toBe(true)
    expect(state.showAnimations).toBe(true)
  })
})
