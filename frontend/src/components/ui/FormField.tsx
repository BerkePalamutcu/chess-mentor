import type { CSSProperties, ReactNode } from 'react'

type FormFieldProps = {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 500,
  color: 'var(--color-text-primary)',
}

const errorStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-error)',
}

const hintStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-muted)',
}

export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div style={fieldStyle}>
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
      </label>
      {children}
      {error && <span style={errorStyle}>{error}</span>}
      {!error && hint && <span style={hintStyle}>{hint}</span>}
    </div>
  )
}
