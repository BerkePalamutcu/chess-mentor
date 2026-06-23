import { request } from './http'

const BASE = '/api'

export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type UserOut = {
  id: number
  name: string
  email: string
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function apiRegister(name: string, email: string, password: string): Promise<AuthTokens> {
  return request<AuthTokens>(`${BASE}/auth/register`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ name, email, password }),
  })
}

export async function apiLogin(email: string, password: string): Promise<AuthTokens> {
  return request<AuthTokens>(`${BASE}/auth/login`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  })
}

export async function apiRefresh(refreshToken: string): Promise<AuthTokens> {
  // Never run the 401 refresh/retry loop on the refresh call itself.
  return request<AuthTokens>(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ refresh_token: refreshToken }),
    retryOnUnauthorized: false,
  })
}

export async function apiLogout(refreshToken: string, accessToken: string): Promise<void> {
  // Best-effort: a failed logout (e.g. already-expired token) shouldn't surface
  // to the user or trigger the session-expiry flow.
  await request<void>(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: JSON_HEADERS,
    authToken: accessToken,
    retryOnUnauthorized: false,
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).catch(() => {})
}

export async function apiMe(accessToken: string): Promise<UserOut> {
  return request<UserOut>(`${BASE}/auth/me`, { authToken: accessToken })
}

export async function apiChangeEmail(accessToken: string, email: string, password: string): Promise<UserOut> {
  return request<UserOut>(`${BASE}/auth/email`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    authToken: accessToken,
    body: JSON.stringify({ email, password }),
  })
}

export async function apiChangePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await request<void>(`${BASE}/auth/password`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    authToken: accessToken,
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}

export async function apiDeleteAccount(accessToken: string, password: string): Promise<void> {
  await request<void>(`${BASE}/auth/account`, {
    method: 'DELETE',
    headers: JSON_HEADERS,
    authToken: accessToken,
    body: JSON.stringify({ password }),
  })
}
