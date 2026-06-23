import type { CSSProperties } from 'react'
import { useState, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Checkbox'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

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

const termsErrorStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-error)',
}

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  terms: boolean,
): FieldErrors {
  const errs: FieldErrors = {}
  if (!name.trim()) errs.name = 'Name is required'
  if (!email.trim()) errs.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address'
  if (!password) errs.password = 'Password is required'
  else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
  if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
  else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
  if (!terms) errs.terms = 'You must accept the terms and conditions'
  return errs
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [apiError, setApiError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [terms, setTerms] = useState(false)

  function handleAction(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    const errs = validate(name, email, password, confirmPassword, terms)
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setApiError(null)

    startTransition(async () => {
      try {
        await register(name, email, password)
        navigate('/', { replace: true })
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Registration failed')
      }
    })
  }

  return (
    <AuthLayout title="Create account" subtitle="Start your chess journey today">
      <form action={handleAction} style={formStyle}>
        {apiError && <div style={errorBannerStyle}>{apiError}</div>}

        <FormField label="Full name" htmlFor="name" error={fieldErrors.name}>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Magnus Carlsen"
            required
            disabled={isPending}
            error={!!fieldErrors.name}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={isPending}
            error={!!fieldErrors.email}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            disabled={isPending}
            error={!!fieldErrors.password}
          />
        </FormField>

        <FormField label="Re-enter password" htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            disabled={isPending}
            error={!!fieldErrors.confirmPassword}
          />
        </FormField>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <Checkbox
            id="terms"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            error={!!fieldErrors.terms}
          >
            I agree to the{' '}
            <a href="#" style={linkStyle}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={linkStyle}>Privacy Policy</a>
          </Checkbox>
          {fieldErrors.terms && <span style={termsErrorStyle}>{fieldErrors.terms}</span>}
        </div>

        <Button type="submit" fullWidth loading={isPending}>
          Create account
        </Button>
      </form>

      <p style={footerStyle}>
        Already have an account?{' '}
        <Link to="/login" style={linkStyle}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
