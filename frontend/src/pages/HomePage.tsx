import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { useAuth } from '../hooks/useAuth'
import { useViewport } from '../hooks/useViewport'

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  fontFamily: 'var(--font-sans)',
  display: 'flex',
  flexDirection: 'column',
}

const mainStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-12) var(--space-6)',
  gap: 'var(--space-8)',
}

const greetingStyle: CSSProperties = {
  textAlign: 'center',
}

const headingStyle: CSSProperties = {
  fontSize: 'var(--font-size-3xl)',
  fontWeight: 800,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-2)',
  lineHeight: 1.2,
}

const subStyle: CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  color: 'var(--color-text-secondary)',
}

const cardsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  width: '100%',
  maxWidth: '440px',
}

function featureCardStyle(hovering: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-5)',
    background: 'var(--color-surface)',
    border: `2px solid ${hovering ? 'var(--color-primary)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-xl)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    boxShadow: hovering ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    transform: hovering ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast)',
  }
}

const iconWrapStyle: CSSProperties = {
  width: '52px',
  height: '52px',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--color-primary-subtle)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.6rem',
  flexShrink: 0,
}

const cardBodyStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
}

const cardTitleStyle: CSSProperties = {
  fontSize: 'var(--font-size-base)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: '2px',
}

const cardDescStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.5,
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function PuzzleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M17 14v3m0 0v3m0-3h3m-3 0h-3" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isMobile } = useViewport()
  const [hoveringPuzzles, setHoveringPuzzles] = useState(false)
  const [hoveringHistory, setHoveringHistory] = useState(false)

  return (
    <div style={pageStyle}>
      <AppHeader />

      <main style={{ ...mainStyle, padding: isMobile ? 'var(--space-8) var(--space-4)' : 'var(--space-12) var(--space-6)', gap: isMobile ? 'var(--space-6)' : 'var(--space-8)' }}>
        <div style={greetingStyle}>
          <div style={{ ...headingStyle, fontSize: isMobile ? 'var(--font-size-2xl)' : 'var(--font-size-3xl)' }}>
            {user ? `Welcome back, ${user.name}!` : 'Welcome!'}
          </div>
          <div style={{ ...subStyle, fontSize: isMobile ? 'var(--font-size-base)' : 'var(--font-size-lg)' }}>What would you like to practice today?</div>
        </div>

        <div style={cardsStyle}>
          <button
            style={featureCardStyle(hoveringPuzzles)}
            onMouseEnter={() => setHoveringPuzzles(true)}
            onMouseLeave={() => setHoveringPuzzles(false)}
            onClick={() => navigate('/puzzles')}
          >
            <div style={iconWrapStyle}>
              <PuzzleIcon />
            </div>
            <div style={cardBodyStyle}>
              <div style={cardTitleStyle}>Puzzle Trainer</div>
              <div style={cardDescStyle}>Sharpen your tactics with rated puzzles</div>
            </div>
            <ChevronRight />
          </button>

          <button
            style={featureCardStyle(hoveringHistory)}
            onMouseEnter={() => setHoveringHistory(true)}
            onMouseLeave={() => setHoveringHistory(false)}
            onClick={() => navigate('/puzzles/history')}
          >
            <div style={iconWrapStyle}>
              <HistoryIcon />
            </div>
            <div style={cardBodyStyle}>
              <div style={cardTitleStyle}>Puzzle History</div>
              <div style={cardDescStyle}>Review past puzzles, your moves &amp; replay them</div>
            </div>
            <ChevronRight />
          </button>
        </div>
      </main>
    </div>
  )
}
