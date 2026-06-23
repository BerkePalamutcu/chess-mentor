import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastContainer } from '../Toast'

describe('ToastContainer', () => {
  it('invokes onDismiss with the toast id when the close button is clicked', async () => {
    const onDismiss = vi.fn()
    render(
      <ToastContainer toasts={[{ id: 42, message: 'Saved', kind: 'success' }]} onDismiss={onDismiss} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /dismiss notification/i }))
    expect(onDismiss).toHaveBeenCalledWith(42)
  })
})
