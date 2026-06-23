import { defineConfig } from 'vitest/config'

// Lightweight test config: esbuild handles TSX with the automatic JSX runtime
// (no need for the react-compiler Babel pass in unit tests).
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
