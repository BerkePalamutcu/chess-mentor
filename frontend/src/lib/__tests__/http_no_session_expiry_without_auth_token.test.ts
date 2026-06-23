import { describe, it, expect, vi } from 'vitest'
import { request, setSessionExpiredHandler } from '../http'

describe('request (unauthenticated 401)', () => {
  it('does not treat a 401 on an unauthenticated request (e.g. bad login) as session expiry', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Invalid credentials' }), { status: 401 })),
    )

    await expect(request('/api/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    })
    expect(onExpired).not.toHaveBeenCalled()

    setSessionExpiredHandler(null)
  })
})
