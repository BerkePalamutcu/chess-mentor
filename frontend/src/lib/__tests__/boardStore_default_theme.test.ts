import { describe, it, expect } from 'vitest'
import { useBoardSettings } from '../boardStore'

describe('boardStore', () => {
  it('defaults to the green theme with notation and animations enabled', () => {
    const state = useBoardSettings.getState()
    expect(state.themeId).toBe('green')
    expect(state.showNotation).toBe(true)
    expect(state.showAnimations).toBe(true)
  })
})
