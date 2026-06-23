import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContainer } from '../components/ui/Toast'
import { ToastContext } from './ToastContext'
import type { Toast, ToastKind } from './ToastContext'

const AUTO_DISMISS_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++idRef.current
      setToasts(prev => [...prev, { id, message, kind }])
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), AUTO_DISMISS_MS),
      )
      return id
    },
    [dismissToast],
  )

  return (
    <ToastContext value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext>
  )
}
