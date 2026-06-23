import type { CSSProperties, FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsLayout } from '../components/layout/SettingsLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { apiChangeEmail, apiChangePassword, apiDeleteAccount } from '../lib/api'

const sectionTitleStyle: CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-1)',
}

const sectionDescStyle: CSSProperties = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-5)',
}

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}

const messageStyle = (kind: 'error' | 'success'): CSSProperties => ({
  fontSize: 'var(--font-size-sm)',
  color: kind === 'error' ? 'var(--color-error)' : 'var(--color-success)',
})

const actionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-3)',
}

export function ProfilePage() {
  return (
    <SettingsLayout title="Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <ChangeEmailSection />
        <ChangePasswordSection />
        <DeleteAccountSection />
      </div>
    </SettingsLayout>
  )
}

function ChangeEmailSection() {
  const { user, accessToken, updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const updated = await apiChangeEmail(accessToken, email.trim(), password)
      updateUser(updated)
      setSuccess('Email updated successfully.')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div style={sectionTitleStyle}>Change email</div>
      <div style={sectionDescStyle}>
        Current email: <strong>{user?.email}</strong>
      </div>
      <form style={formStyle} onSubmit={onSubmit}>
        <FormField label="New email" htmlFor="new-email">
          <Input
            id="new-email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </FormField>
        <FormField label="Current password" htmlFor="email-password" hint="Confirm your identity to change the login email.">
          <Input
            id="email-password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
            required
          />
        </FormField>
        {error && <span style={messageStyle('error')}>{error}</span>}
        {success && <span style={messageStyle('success')}>{success}</span>}
        <div style={actionsStyle}>
          <Button type="submit" loading={loading} disabled={!email || !password}>
            Update email
          </Button>
        </div>
      </form>
    </Card>
  )
}

function ChangePasswordSection() {
  const { accessToken } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError('')
    setSuccess('')
    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await apiChangePassword(accessToken, current, next)
      setSuccess('Password changed. Your other sessions have been signed out.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div style={sectionTitleStyle}>Change password</div>
      <div style={sectionDescStyle}>Choose a strong password of at least 8 characters.</div>
      <form style={formStyle} onSubmit={onSubmit}>
        <FormField label="Current password" htmlFor="current-password">
          <Input
            id="current-password"
            type="password"
            value={current}
            autoComplete="current-password"
            onChange={e => setCurrent(e.target.value)}
            required
          />
        </FormField>
        <FormField label="New password" htmlFor="new-password">
          <Input
            id="new-password"
            type="password"
            value={next}
            autoComplete="new-password"
            onChange={e => setNext(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirm-password">
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            autoComplete="new-password"
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </FormField>
        {error && <span style={messageStyle('error')}>{error}</span>}
        {success && <span style={messageStyle('success')}>{success}</span>}
        <div style={actionsStyle}>
          <Button type="submit" loading={loading} disabled={!current || !next || !confirm}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  )
}

function DeleteAccountSection() {
  const { accessToken, clearSession } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onDelete(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError('')
    setLoading(true)
    try {
      await apiDeleteAccount(accessToken, password)
      clearSession()
      navigate('/register', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete account')
      setLoading(false)
    }
  }

  return (
    <Card style={{ borderColor: 'var(--color-error-border)' }}>
      <div style={{ ...sectionTitleStyle, color: 'var(--color-error)' }}>Delete account</div>
      <div style={sectionDescStyle}>
        Permanently delete your account and all puzzle history. This cannot be undone.
      </div>
      {!confirming ? (
        <div style={actionsStyle}>
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Delete my account
          </Button>
        </div>
      ) : (
        <form style={formStyle} onSubmit={onDelete}>
          <FormField label="Enter your password to confirm" htmlFor="delete-password">
            <Input
              id="delete-password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FormField>
          {error && <span style={messageStyle('error')}>{error}</span>}
          <div style={actionsStyle}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setConfirming(false)
                setPassword('')
                setError('')
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" type="submit" loading={loading} disabled={!password}>
              Permanently delete
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
