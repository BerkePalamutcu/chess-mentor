import { describe, it, expect, vi } from 'vitest'
import { request, setRefreshHandler, setSessionExpiredHandler } from '../http'

describe('request (authenticated 401)', () => {
  it('signals session expiry when the refresh cannot produce a new token', async () => {
    setRefreshHandler(vi.fn().mockResolvedValue(null)) // refresh impossible
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'expired' }), { status: 401 })),
    )

    await expect(request('/api/puzzles/next', { authToken: 'old-token' })).rejects.toMatchObject({
      status: 401,
      message: expect.stringMatching(/session has expired/i),
    })
    expect(onExpired).toHaveBeenCalledTimes(1)

    setRefreshHandler(null)
    setSessionExpiredHandler(null)
  })
})
