import type { CSSProperties, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

const centerStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <Spinner size={40} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
