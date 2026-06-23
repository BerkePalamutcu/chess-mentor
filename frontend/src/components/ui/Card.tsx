import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
}

const paddingMap = { sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' }

export function Card({ children, padding = 'md', style, ...rest }: CardProps) {
  const cardStyle: CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    padding: paddingMap[padding],
    ...style,
  }

  return (
    <div style={cardStyle} {...rest}>
      {children}
    </div>
  )
}
