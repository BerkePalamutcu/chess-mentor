import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const wrapStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
}

function triggerStyle(open: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    height: 36,
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
    background: open ? 'var(--color-surface-2)' : 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    whiteSpace: 'nowrap',
  }
}

const menuStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  minWidth: 188,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  padding: 'var(--space-2)',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  zIndex: 50,
}

function itemStyle(hovering: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-md)',
    background: hovering ? 'var(--color-primary-subtle)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    transition: 'background var(--transition-fast)',
  }
}

const itemTitleStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
}

const itemDescStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-muted)',
}

export function SettingsMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  function go(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <div
      style={wrapStyle}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false)
        setHovered(null)
      }}
    >
      <button
        type="button"
        style={triggerStyle(open)}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <GearIcon />
        Settings
        <Chevron open={open} />
      </button>

      {open && (
        <div style={menuStyle} role="menu">
          <MenuItem
            icon={<UserIcon />}
            title="Profile"
            desc="Email, password & account"
            hovering={hovered === 'profile'}
            onHover={() => setHovered('profile')}
            onSelect={() => go('/settings/profile')}
          />
          <MenuItem
            icon={<BoardIcon />}
            title="Board"
            desc="Colors & board styling"
            hovering={hovered === 'board'}
            onHover={() => setHovered('board')}
            onSelect={() => go('/settings/board')}
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon,
  title,
  desc,
  hovering,
  onHover,
  onSelect,
}: {
  icon: ReactNode
  title: string
  desc: string
  hovering: boolean
  onHover: () => void
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      style={itemStyle(hovering)}
      onMouseEnter={onHover}
      onClick={onSelect}
    >
      <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span style={itemTitleStyle}>{title}</span>
        <span style={itemDescStyle}>{desc}</span>
      </span>
    </button>
  )
}

function GearIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={3} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition-fast)' }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx={12} cy={7} r={4} />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={3} width={18} height={18} rx={2} />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  )
}
