import { describe, it, expect, vi } from 'vitest'
import { request, setRefreshHandler } from '../http'

describe('request (authenticated 401)', () => {
  it('silently refreshes the token and retries the request once', async () => {
    const refresh = vi.fn().mockResolvedValue('new-token')
    setRefreshHandler(refresh)

    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      const auth = (init?.headers as Record<string, string>)?.Authorization
      // The retry carries the refreshed token and succeeds.
      if (auth === 'Bearer new-token') {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      }
      return Promise.resolve(new Response(JSON.stringify({ detail: 'expired' }), { status: 401 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await request<{ ok: boolean }>('/api/puzzles/next', { authToken: 'old-token' })

    expect(result).toEqual({ ok: true })
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    setRefreshHandler(null)
  })
})
