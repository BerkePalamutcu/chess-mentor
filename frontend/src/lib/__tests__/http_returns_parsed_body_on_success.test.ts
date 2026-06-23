import { describe, it, expect, vi } from 'vitest'
import { request } from '../http'

describe('request', () => {
  it('returns the parsed JSON body on a 2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, email: 'a@b.com' }), { status: 200 }),
      ),
    )

    const body = await request<{ id: number; email: string }>('/api/auth/me')
    expect(body).toEqual({ id: 1, email: 'a@b.com' })
  })
})
