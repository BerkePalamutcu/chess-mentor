import type { CSSProperties, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { useViewport } from '../../hooks/useViewport'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  fontFamily: 'var(--font-sans)',
  display: 'flex',
  flexDirection: 'column',
}

const containerStyle: CSSProperties = {
  flex: 1,
  width: '100%',
  maxWidth: '760px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-6)',
}

const headingStyle: CSSProperties = {
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 800,
  color: 'var(--color-text-primary)',
  letterSpacing: '-0.02em',
}

const tabsStyle: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-2)',
  borderBottom: '1px solid var(--color-border)',
}

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: 'var(--space-3) var(--space-4)',
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
    marginBottom: '-1px',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    cursor: 'pointer',
  }
}

const TABS = [
  { label: 'Profile', path: '/settings/profile' },
  { label: 'Board', path: '/settings/board' },
]

export function SettingsLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobile } = useViewport()

  return (
    <div style={pageStyle}>
      <AppHeader />
      <main style={{ padding: isMobile ? 'var(--space-6) var(--space-4)' : 'var(--space-10) var(--space-6)' }}>
        <div style={containerStyle}>
          <h1 style={headingStyle}>{title}</h1>
          <div style={tabsStyle}>
            {TABS.map(tab => (
              <button
                key={tab.path}
                style={tabStyle(location.pathname === tab.path)}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
