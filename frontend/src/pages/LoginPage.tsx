import type { CSSProperties } from 'react'
import { useState, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const footerStyle: CSSProperties = {
  marginTop: 'var(--space-4)',
  textAlign: 'center',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-muted)',
}

const linkStyle: CSSProperties = {
  color: 'var(--color-primary)',
  textDecoration: 'none',
  fontWeight: 500,
}

const errorBannerStyle: CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-error-bg)',
  border: '1px solid var(--color-error-border)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-error)',
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    setError(null)

    startTransition(async () => {
      try {
        await login(email, password)
        navigate('/', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
    })
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your training">
      <form action={handleAction} style={formStyle}>
        {error && <div style={errorBannerStyle}>{error}</div>}

        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={isPending}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={isPending}
          />
        </FormField>

        <Button type="submit" fullWidth loading={isPending}>
          Sign in
        </Button>
      </form>

      <p style={footerStyle}>
        Don't have an account?{' '}
        <Link to="/register" style={linkStyle}>
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
