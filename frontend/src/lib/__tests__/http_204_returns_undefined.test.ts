import { describe, it, expect, vi } from 'vitest'
import { request } from '../http'

describe('request', () => {
  it('resolves to undefined for a 204 No Content response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    const result = await request<void>('/api/auth/logout', { method: 'POST' })
    expect(result).toBeUndefined()
  })
})
