import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardBody, CardFooter } from './index'

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <CardHeader title="The title" />
        <CardBody>The body</CardBody>
        <CardFooter>The footer</CardFooter>
      </Card>
    )

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The title' })).toBeInTheDocument()
    expect(screen.getByText('The body')).toBeInTheDocument()
    expect(screen.getByText('The footer')).toBeInTheDocument()
  })

  it('should apply default variant class', () => {
    render(<Card>The card</Card>)

    expect(screen.getByText('The card')).toHaveClass('card card-default')
  })

  test.each(['default', 'outlined', 'elevated'] as const)(
    'should apply class when class %s is specified',
    (variant) => {
      render(<Card variant={variant}>The card</Card>)

      expect(screen.getByText('The card')).toHaveClass(`card card-${variant}`)
    }
  )
})

describe('CardHeader', () => {
  it('should render title', () => {
    render(<CardHeader title="The title" />)

    expect(screen.getByRole('heading', { name: 'The title' })).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(<CardHeader title="The title" subtitle="The subtitle" />)

    expect(screen.queryByTestId('card-header-subtitle')).toBeInTheDocument()
  })

  it('should not render subtitle when not provided', () => {
    render(<CardHeader title="The title" />)

    expect(screen.queryByTestId('card-header-subtitle')).not.toBeInTheDocument()
  })
})

describe('CardBody', () => {
  it('should render children', () => {
    render(<CardBody>The body</CardBody>)

    expect(screen.getByText('The body')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>The footer</CardFooter>)

    expect(screen.getByText('The footer')).toBeInTheDocument()
  })
})
