import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from '@/components/Alert'

describe('Alert', () => {
  describe('content', () => {
    it('should display title when provided', () => {
      render(<Alert variant="info" title="Whatever" />)

      expect(screen.getByRole('banner')).toHaveTextContent('Whatever')
    })

    it('should not display title when not provided', () => {
      render(<Alert variant="info" />)

      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })

    it('should display children when provided', () => {
      render(<Alert variant="info">Whatever</Alert>)

      expect(screen.getByTestId('alert-content')).toHaveTextContent('Whatever')
    })

    it('should not display children when not provided', () => {
      render(<Alert variant="info" />)

      expect(screen.queryByTestId('alert-content')).not.toBeInTheDocument()
    })
  })

  describe('variant', () => {
    test.each(['info', 'warning', 'error', 'success'] as const)(
      'should apply %s variant class to container',
      (variant) => {
        render(<Alert variant={variant} />)

        expect(screen.getByRole('alert')).toHaveClass(`alert-${variant}`)
      }
    )
  })

  describe('retry button', () => {
    it('should display retry button when variant is error and onRetry provided', () => {
      render(<Alert variant="error" onRetry={() => {}} />)

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    test.each(['info', 'warning', 'success'] as const)(
      'should not display retry button when variant is %s',
      (variant) => {
        render(<Alert variant={variant} />)

        expect(screen.queryByText('Retry')).not.toBeInTheDocument()
      }
    )

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      const mockRetry = jest.fn()

      render(<Alert variant="error" onRetry={mockRetry} />)

      await user.click(screen.getByText('Retry'))

      expect(mockRetry).toHaveBeenCalled()
    })
  })

  describe('native props', () => {
    it('should forward native div props', () => {
      render(<Alert variant="info" className="whatever" />)

      expect(screen.getByRole('alert')).toHaveClass('whatever')
    })
  })
})
