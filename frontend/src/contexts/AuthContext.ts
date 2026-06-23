import { createContext } from 'react'
import type { UserOut } from '../lib/api'

export type AuthContextValue = {
  user: UserOut | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Replace the cached user (e.g. after changing email). */
  updateUser: (user: UserOut) => void
  /** Clear local session without calling the logout endpoint (e.g. after account deletion). */
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessToken: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
  clearSession: () => {},
})
