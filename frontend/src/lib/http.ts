// ── Centralized HTTP layer ──────────────────────────────────────────────────
// Every API call goes through `request()`, which guarantees:
//   • a typed ApiError (with .status) on any non-2xx response
//   • friendly handling of network failures and non-JSON bodies
//   • normalization of FastAPI's validation-error shape ({detail: [...]}) to a string
//   • on an authenticated 401: one silent token refresh + retry, and if that fails,
//     a session-expired signal so the UI can toast + redirect to /login.

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Registered by AuthProvider. Returns a fresh access token, or null if refresh
// is impossible (no/invalid refresh token).
type RefreshHandler = () => Promise<string | null>
let refreshHandler: RefreshHandler | null = null
export function setRefreshHandler(fn: RefreshHandler | null) {
  refreshHandler = fn
}

// Registered by the in-router SessionGuard. Invoked once when the session is
// definitively expired (refresh failed). Should clear state, toast, and redirect.
type SessionExpiredHandler = () => void
let sessionExpiredHandler: SessionExpiredHandler | null = null
export function setSessionExpiredHandler(fn: SessionExpiredHandler | null) {
  sessionExpiredHandler = fn
}

// Collapse concurrent 401s into a single refresh call. Token rotation on the
// backend means a second refresh with the same token would 401 — so all callers
// that hit 401 at once must await the *same* refresh promise.
let inFlightRefresh: Promise<string | null> | null = null
function refreshOnce(): Promise<string | null> {
  if (!refreshHandler) return Promise.resolve(null)
  if (!inFlightRefresh) {
    inFlightRefresh = refreshHandler().finally(() => {
      inFlightRefresh = null
    })
  }
  return inFlightRefresh
}

const NETWORK_ERROR = 'Network error — please check your connection and try again.'

function extractDetail(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const detail = (data as { detail?: unknown }).detail
    if (typeof detail === 'string' && detail) return detail
    // FastAPI validation errors arrive as detail: [{ msg, loc }, ...]
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string }
      if (first?.msg) return first.msg.replace(/^Value error,\s*/, '')
      return 'Invalid request.'
    }
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return `Request failed (${status}).`
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }
  if (!res.ok) {
    throw new ApiError(extractDetail(data, res.status), res.status)
  }
  return (data as T) ?? (undefined as T)
}

export type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
  /** When set, sent as `Authorization: Bearer <token>` and enables 401 refresh-and-retry. */
  authToken?: string | null
  /** Opt out of the silent refresh/retry (used by logout and the refresh call itself). */
  retryOnUnauthorized?: boolean
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { authToken, retryOnUnauthorized = true, headers, ...init } = options

  const buildHeaders = (token: string | null | undefined): Record<string, string> => {
    const h: Record<string, string> = { ...headers }
    if (token) h.Authorization = `Bearer ${token}`
    return h
  }

  const send = async (token: string | null | undefined): Promise<Response> => {
    try {
      return await fetch(url, { ...init, headers: buildHeaders(token) })
    } catch {
      throw new ApiError(NETWORK_ERROR, 0)
    }
  }

  let res = await send(authToken)

  if (res.status === 401 && authToken && retryOnUnauthorized) {
    const newToken = await refreshOnce()
    if (newToken) {
      res = await send(newToken)
    } else {
      sessionExpiredHandler?.()
      throw new ApiError('Your session has expired. Please sign in again.', 401)
    }
    // If the retried request still 401s, the session is no longer valid.
    if (res.status === 401) {
      sessionExpiredHandler?.()
      throw new ApiError('Your session has expired. Please sign in again.', 401)
    }
  }

  return parseBody<T>(res)
}
