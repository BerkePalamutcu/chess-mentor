import { describe, it, expect, vi } from 'vitest'
import { request } from '../http'

describe('request', () => {
  it('flattens FastAPI validation array detail into a readable string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ detail: [{ msg: 'Value error, Password must be at least 8 characters', loc: ['body', 'password'] }] }),
          { status: 422 },
        ),
      ),
    )

    await expect(request('/api/auth/register', { method: 'POST' })).rejects.toMatchObject({
      message: 'Password must be at least 8 characters',
      status: 422,
    })
  })
})
