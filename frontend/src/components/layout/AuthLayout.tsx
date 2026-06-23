import type { CSSProperties, ReactNode } from 'react'
import { Card } from '../ui/Card'
import { ThemeToggle } from '../ui/ThemeToggle'

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-6)',
  position: 'relative',
}

const topBarStyle: CSSProperties = {
  position: 'fixed',
  top: 'var(--space-4)',
  right: 'var(--space-6)',
}

const logoStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: 'var(--space-6)',
}

const logoTextStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  display: 'block',
}

const taglineStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-primary)',
  fontWeight: 500,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-xl)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-1)',
}

const subtitleStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-6)',
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <ThemeToggle />
      </div>

      <Card style={{ width: '100%', maxWidth: 420 }}>
        <div style={logoStyle}>
          <span style={logoTextStyle}>♟ Chess Mentor</span>
          <span style={taglineStyle}>Master your game</span>
        </div>

        <h1 style={titleStyle}>{title}</h1>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}

        {children}
      </Card>
    </div>
  )
}
