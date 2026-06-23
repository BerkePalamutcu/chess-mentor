import type { CSSProperties } from 'react'

type SpinnerProps = {
  size?: number
  color?: string
}

export function Spinner({ size = 32, color = 'var(--color-primary)' }: SpinnerProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    animation: 'cm-spin 0.7s linear infinite',
    color,
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" style={style}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
