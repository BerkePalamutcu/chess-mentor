import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { apiLogin, apiLogout, apiMe, apiRefresh, apiRegister } from '../lib/api'
import type { UserOut } from '../lib/api'
import { setRefreshHandler } from '../lib/http'
import { AuthContext } from './AuthContext'

const REFRESH_KEY = 'cm-refresh-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  // Initialize to true only when there is a token to restore — avoids synchronous setState in effect
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(REFRESH_KEY))

  // Register the silent-refresh handler used by the http layer on authenticated 401s.
  // It mints a fresh access token from the stored refresh token (rotating it), or
  // returns null when refresh is impossible — which the http layer treats as expiry.
  useEffect(() => {
    setRefreshHandler(async () => {
      const stored = localStorage.getItem(REFRESH_KEY)
      if (!stored) return null
      try {
        const tokens = await apiRefresh(stored)
        localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
        setAccessToken(tokens.access_token)
        return tokens.access_token
      } catch {
        return null
      }
    })
    return () => setRefreshHandler(null)
  }, [])

  useEffect(() => {
    const storedRefresh = localStorage.getItem(REFRESH_KEY)
    if (!storedRefresh) return
    apiRefresh(storedRefresh)
      .then(async tokens => {
        localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
        setAccessToken(tokens.access_token)
        const me = await apiMe(tokens.access_token)
        setUser(me)
      })
      .catch(() => {
        localStorage.removeItem(REFRESH_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const tokens = await apiLogin(email, password)
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    setAccessToken(tokens.access_token)
    const me = await apiMe(tokens.access_token)
    setUser(me)
  }

  async function register(name: string, email: string, password: string) {
    const tokens = await apiRegister(name, email, password)
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
    setAccessToken(tokens.access_token)
    const me = await apiMe(tokens.access_token)
    setUser(me)
  }

  async function logout() {
    const storedRefresh = localStorage.getItem(REFRESH_KEY)
    if (storedRefresh && accessToken) {
      await apiLogout(storedRefresh, accessToken).catch(() => {})
    }
    clearSession()
  }

  function clearSession() {
    localStorage.removeItem(REFRESH_KEY)
    setAccessToken(null)
    setUser(null)
  }

  function updateUser(next: UserOut) {
    setUser(next)
  }

  return (
    <AuthContext value={{ user, accessToken, isLoading, login, register, logout, updateUser, clearSession }}>
      {children}
    </AuthContext>
  )
}
