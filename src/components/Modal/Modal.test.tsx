import { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

function renderModal({
  isOpen = true,
  title = 'Test Modal',
  children = 'Modal content',
}: Partial<{ isOpen: boolean; title: string; children: ReactNode }> = {}) {
  const user = userEvent.setup()
  const onClose = jest.fn()
  const modal = render(
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {children}
    </Modal>
  )

  return {
    user,
    onClose,
    ...modal,
  }
}

describe('Modal', () => {
  describe('rendering', () => {
    it('should render the modal with title and children when open', () => {
      renderModal()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('should not render dialog when closed', () => {
      renderModal({ isOpen: false })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render in a portal outside the parent container', () => {
      const { container } = renderModal()

      expect(container.querySelector('[role="dialog"]')).toBeNull()
      expect(document.body.querySelector('[role="dialog"]')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have aria-modal attribute', () => {
      renderModal()

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('should have aria-labelledby pointing to the title', () => {
      renderModal()

      const dialog = screen.getByRole('dialog')
      const labelId = dialog.getAttribute('aria-labelledby')

      expect(labelId).toBeTruthy()
      expect(document.getElementById(labelId!)).toHaveTextContent('Test Modal')
    })

    it('should have a close button with aria-label', () => {
      renderModal()

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  describe('closing behavior', () => {
    it('should call onClose when close button is clicked', async () => {
      const { onClose, user } = renderModal()

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', async () => {
      const { onClose, user } = renderModal()

      const backdrop = screen.getByRole('dialog').parentElement!
      await user.click(backdrop)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when dialog content is clicked', async () => {
      const { onClose, user } = renderModal()

      await user.click(screen.getByText('Modal content'))

      expect(onClose).not.toHaveBeenCalled()
    })

    it('should call onClose when Escape key is pressed', async () => {
      const { onClose, user } = renderModal()

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not respond to Escape when closed', async () => {
      const { onClose, user } = renderModal({ isOpen: false })

      await user.keyboard('{Escape}')

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('focus trap', () => {
    it('should move focus to first focusable element when opened', () => {
      renderModal()

      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    })

    it('should trap Tab at last focusable element', async () => {
      const { user } = renderModal({
        children: (
          <>
            <input data-testid="input" />
            <button>Submit</button>
          </>
        ),
      })
      const closeButton = screen.getByRole('button', { name: 'Close' })
      const input = screen.getByTestId('input')
      const submitButton = screen.getByRole('button', { name: 'Submit' })

      expect(closeButton).toHaveFocus()

      await user.tab()
      expect(input).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()

      await user.tab()
      expect(closeButton).toHaveFocus()
    })

    it('should trap Shift+Tab at first focusable element', async () => {
      const { user } = renderModal({
        children: <input data-testid="input" />,
      })

      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()

      await user.tab({ shift: true })
      expect(screen.getByTestId('input')).toHaveFocus()
    })

    it('should restore focus to previously focused element on close', () => {
      const trigger = document.createElement('button')
      trigger.textContent = 'Open'
      document.body.appendChild(trigger)
      trigger.focus()

      const { rerender } = renderModal()

      expect(trigger).not.toHaveFocus()

      rerender(
        <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
          Content
        </Modal>
      )

      expect(trigger).toHaveFocus()
      document.body.removeChild(trigger)
    })
  })

  describe('scroll lock', () => {
    beforeEach(() => {
      document.body.style.overflow = 'auto'
    })

    it('should set body overflow to hidden when open', () => {
      renderModal()

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body overflow on close', () => {
      const { rerender } = renderModal()

      expect(document.body.style.overflow).toBe('hidden')

      rerender(
        <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
          Content
        </Modal>
      )

      expect(document.body.style.overflow).toBe('auto')
    })

    it('should restore body overflow on unmount', () => {
      const { unmount } = renderModal()

      expect(document.body.style.overflow).toBe('hidden')

      unmount()

      expect(document.body.style.overflow).toBe('auto')
    })
  })
})
