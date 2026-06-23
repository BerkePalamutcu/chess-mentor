import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuth } from '../../hooks/useAuth'
import { useViewport } from '../../hooks/useViewport'
import { SettingsMenu } from './SettingsMenu'

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
}

const logoStyle: CSSProperties = {
  fontSize: 'var(--font-size-xl)',
  fontWeight: 800,
  color: 'var(--color-text-primary)',
  letterSpacing: '-0.02em',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontFamily: 'var(--font-sans)',
  padding: 0,
}

const navRightStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
}

export function AppHeader() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { isMobile } = useViewport()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav style={{ ...navStyle, padding: isMobile ? 'var(--space-3) var(--space-4)' : 'var(--space-4) var(--space-6)' }}>
      <button style={logoStyle} onClick={() => navigate('/')}>♟ Chess Mentor</button>
      <div style={navRightStyle}>
        <ThemeToggle />
        <SettingsMenu />
        <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
      </div>
    </nav>
  )
}
