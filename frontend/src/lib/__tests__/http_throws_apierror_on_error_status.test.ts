import { describe, it, expect, vi } from 'vitest'
import { request, ApiError } from '../http'

describe('request', () => {
  it('throws an ApiError carrying the status and detail message', async () => {
    // Fresh Response per call — a Response body can only be read once.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ detail: 'Email already registered' }), { status: 409 }))),
    )

    await expect(request('/api/auth/register', { method: 'POST' })).rejects.toMatchObject({
      message: 'Email already registered',
      status: 409,
    })
    await expect(request('/api/auth/register')).rejects.toBeInstanceOf(ApiError)
  })
})
