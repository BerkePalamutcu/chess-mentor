import { createContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  message: string
  kind: ToastKind
}

export type ToastContextValue = {
  toasts: Toast[]
  /** Show a toast. Returns its id. Auto-dismisses after a few seconds. */
  showToast: (message: string, kind?: ToastKind) => number
  dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  showToast: () => 0,
  dismissToast: () => {},
})
