import { describe, it, expect, vi } from 'vitest'
import { request, setRefreshHandler } from '../http'

describe('request (concurrent 401s)', () => {
  it('collapses simultaneous refreshes into a single refresh call', async () => {
    // Resolve on a microtask so both requests hit 401 before either refresh settles.
    const refresh = vi.fn(() => Promise.resolve('new-token'))
    setRefreshHandler(refresh)

    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      const auth = (init?.headers as Record<string, string>)?.Authorization
      if (auth === 'Bearer new-token') {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      }
      return Promise.resolve(new Response(JSON.stringify({ detail: 'expired' }), { status: 401 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    const [a, b] = await Promise.all([
      request<{ ok: boolean }>('/api/puzzles/next', { authToken: 'old-token' }),
      request<{ ok: boolean }>('/api/puzzles/profile', { authToken: 'old-token' }),
    ])

    expect(a).toEqual({ ok: true })
    expect(b).toEqual({ ok: true })
    // Token rotation means a second refresh would fail — dedup must keep it to one.
    expect(refresh).toHaveBeenCalledTimes(1)

    setRefreshHandler(null)
  })
})
