import type { CSSProperties, InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string | boolean
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-base)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-input-bg)',
  border: '1px solid var(--color-input-border)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  boxSizing: 'border-box',
}

export function Input({ error, style, ...props }: InputProps) {
  return (
    <input
      style={{
        ...inputStyle,
        borderColor: error ? 'var(--color-error)' : 'var(--color-input-border)',
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = error
          ? 'var(--color-error)'
          : 'var(--color-border-focus)'
        e.currentTarget.style.boxShadow = error
          ? '0 0 0 3px var(--color-error-bg)'
          : '0 0 0 3px var(--color-primary-subtle)'
        props.onFocus?.(e)
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error
          ? 'var(--color-error)'
          : 'var(--color-input-border)'
        e.currentTarget.style.boxShadow = 'none'
        props.onBlur?.(e)
      }}
      {...props}
    />
  )
}
