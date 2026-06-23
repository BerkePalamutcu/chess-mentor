import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees after each test to keep the jsdom DOM isolated.
afterEach(() => {
  cleanup()
})
