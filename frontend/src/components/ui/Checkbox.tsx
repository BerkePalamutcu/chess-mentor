import type { ChangeEvent, CSSProperties, ReactNode } from 'react'

type CheckboxProps = {
  id: string
  checked: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
  error?: boolean
}

const wrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-3)',
  cursor: 'pointer',
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  lineHeight: '1.5',
  cursor: 'pointer',
}

export function Checkbox({ id, checked, onChange, children, error }: CheckboxProps) {
  return (
    <label htmlFor={id} style={wrapStyle}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: 16,
          height: 16,
          marginTop: 2,
          flexShrink: 0,
          accentColor: 'var(--color-primary)',
          cursor: 'pointer',
          outline: error ? '2px solid var(--color-error)' : undefined,
          borderRadius: 'var(--radius-sm)',
        }}
      />
      <span style={labelStyle}>{children}</span>
    </label>
  )
}
