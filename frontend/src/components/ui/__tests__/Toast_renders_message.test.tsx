import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToastContainer } from '../Toast'

describe('ToastContainer', () => {
  it('renders the toast message with an alert role for errors', () => {
    render(
      <ToastContainer
        toasts={[{ id: 1, message: 'Your session has expired. Please sign in again.', kind: 'error' }]}
        onDismiss={() => {}}
      />,
    )
    expect(screen.getByText(/your session has expired/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
