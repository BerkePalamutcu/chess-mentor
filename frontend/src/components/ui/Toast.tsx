import type { CSSProperties } from 'react'
import type { Toast, ToastKind } from '../../contexts/ToastContext'

const containerStyle: CSSProperties = {
  position: 'fixed',
  top: 'var(--space-4)',
  right: 'var(--space-4)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  maxWidth: 'min(380px, calc(100vw - var(--space-8)))',
  pointerEvents: 'none',
}

const accent: Record<ToastKind, { border: string; bar: string; icon: string }> = {
  success: { border: 'var(--color-success)', bar: 'var(--color-success)', icon: 'var(--color-success)' },
  error: { border: 'var(--color-error-border)', bar: 'var(--color-error)', icon: 'var(--color-error)' },
  info: { border: 'var(--color-border)', bar: 'var(--color-primary)', icon: 'var(--color-primary)' },
}

function toastStyle(kind: ToastKind): CSSProperties {
  return {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-surface)',
    border: `1px solid ${accent[kind].border}`,
    borderLeft: `4px solid ${accent[kind].bar}`,
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    fontFamily: 'var(--font-sans)',
    animation: 'cm-toast-in var(--transition-normal)',
  }
}

const messageStyle: CSSProperties = {
  flex: 1,
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-primary)',
  lineHeight: 1.45,
}

const closeStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  padding: 0,
  display: 'inline-flex',
  flexShrink: 0,
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div style={containerStyle} role="region" aria-label="Notifications">
      {toasts.map(toast => (
        <div key={toast.id} style={toastStyle(toast.kind)} role={toast.kind === 'error' ? 'alert' : 'status'}>
          <span style={{ color: accent[toast.kind].icon, display: 'inline-flex', flexShrink: 0, marginTop: 1 }}>
            <KindIcon kind={toast.kind} />
          </span>
          <span style={messageStyle}>{toast.message}</span>
          <button style={closeStyle} onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

function KindIcon({ kind }: { kind: ToastKind }) {
  if (kind === 'success') {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m22 4-10 10.01-3-3" />
      </svg>
    )
  }
  if (kind === 'error') {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10} />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    )
  }
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10} />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}
