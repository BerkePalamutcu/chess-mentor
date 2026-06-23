import { use } from 'react'
import { ToastContext } from '../contexts/ToastContext'

export function useToast() {
  return use(ToastContext)
}
