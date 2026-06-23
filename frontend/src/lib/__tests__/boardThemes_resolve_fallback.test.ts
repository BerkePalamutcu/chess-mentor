import { describe, it, expect } from 'vitest'
import { resolveBoardTheme, boardThemes } from '../boardThemes'

describe('resolveBoardTheme', () => {
  it('returns the matching theme, and falls back to the first for an unknown id', () => {
    expect(resolveBoardTheme('brown').id).toBe('brown')
    // Unknown id falls back to the default (first) theme rather than crashing.
    expect(resolveBoardTheme('does-not-exist')).toBe(boardThemes[0])
  })
})
