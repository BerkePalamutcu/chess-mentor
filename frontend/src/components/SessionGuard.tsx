import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { setSessionExpiredHandler } from '../lib/http'

/**
 * Bridges the http layer's "session expired" signal (an authenticated request that
 * 401s and cannot be refreshed) to user-facing behavior: clear the session, show a
 * toast, and redirect to the login screen. Renders nothing.
 *
 * Lives inside the Router and below ToastProvider so it has access to navigation
 * and toasts. A guard prevents duplicate toasts when several requests 401 at once.
 */
export function SessionGuard() {
  const { clearSession, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    let handled = false
    setSessionExpiredHandler(() => {
      if (handled) return
      handled = true
      // Only surface the message if there was actually a session to lose.
      const hadSession = user != null
      clearSession()
      if (hadSession) {
        showToast('Your session has expired. Please sign in again.', 'error')
      }
      navigate('/login', { replace: true })
    })
    return () => setSessionExpiredHandler(null)
  }, [clearSession, showToast, navigate, user])

  return null
}
