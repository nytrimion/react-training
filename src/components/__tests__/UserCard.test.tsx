import { render, screen } from '@testing-library/react'
import { UserCard } from '@/components/UserCard'

describe('UserCard', () => {
  it('should display the full name', () => {
    render(<UserCard firstName="John" lastName="Doe" isPremium={false} roles={[]} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should display premium badge when is premium', () => {
    render(<UserCard firstName="" lastName="" isPremium={true} roles={[]} />)

    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('should not display premium badge when is not premium', () => {
    render(<UserCard firstName="" lastName="" isPremium={false} roles={[]} />)

    expect(screen.queryByText('Premium')).not.toBeInTheDocument()
  })

  it('should display roles', () => {
    render(<UserCard firstName="" lastName="" isPremium={false} roles={['foo', 'bar']} />)

    const roles = screen.getAllByRole('listitem')

    expect(roles).toHaveLength(2)
    expect(roles[0]).toHaveTextContent('foo')
    expect(roles[1]).toHaveTextContent('bar')
  })
})
