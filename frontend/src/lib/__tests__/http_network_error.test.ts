import { describe, it, expect, vi } from 'vitest'
import { request } from '../http'

describe('request', () => {
  it('wraps a fetch/network failure in a friendly ApiError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(request('/api/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 0,
    })
    await expect(request('/api/auth/login')).rejects.toThrow(/network error/i)
  })
})
