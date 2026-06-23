import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const base: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  border: '1px solid transparent',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-primary-text)',
    borderColor: 'var(--color-primary)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    borderColor: 'var(--color-border)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-error)',
    borderColor: 'var(--color-error-border)',
  },
}

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--font-size-sm)' },
  md: { padding: '10px 20px', fontSize: 'var(--font-size-base)' },
  lg: { padding: '12px 24px', fontSize: 'var(--font-size-lg)' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      style={{
        ...base,
        ...variants[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : children}
    </button>
  )
}

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      style={{ animation: 'cm-spin 0.7s linear infinite' }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
