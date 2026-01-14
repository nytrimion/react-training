import { render, screen, within } from '@testing-library/react'
import { User, UserList, UserRow } from '@/components/UserList'

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    isActive: true,
    ...overrides,
  }
}

describe('UserList', () => {
  it('should display column headers', () => {
    render(<UserList users={[]} />)

    const headers = screen.getAllByRole('columnheader')

    expect(headers).toHaveLength(4)
    expect(headers[0]).toHaveTextContent('Name')
    expect(headers[1]).toHaveTextContent('Email')
    expect(headers[2]).toHaveTextContent('Role')
    expect(headers[3]).toHaveTextContent('Status')
  })

  it('should display message when users list is empty', () => {
    render(<UserList users={[]} />)

    expect(screen.getByRole('cell', { name: 'No users available' })).toBeInTheDocument()
  })

  it('should display all rows when users list is not empty', () => {
    const users: User[] = [
      createMockUser({ id: '1', name: 'John Doe' }),
      createMockUser({ id: '2', name: 'Jane Doe' }),
    ]
    render(<UserList users={users} />)

    const tbody = screen.getByRole('table').querySelector('tbody')
    expect(tbody).not.toBeNull()
    const rows = within(tbody!).getAllByRole('row')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('John Doe')
    expect(rows[1]).toHaveTextContent('Jane Doe')
  })
})

describe('UserRow', () => {
  const renderUserRow = (user: User) =>
    render(
      <table>
        <tbody>
          <UserRow user={user} />
        </tbody>
      </table>
    )

  const roles = ['admin', 'user', 'guest'] as const

  it('should display user name', () => {
    renderUserRow(createMockUser({ name: 'Jane Doe' }))

    expect(screen.getByRole('cell', { name: 'Jane Doe' })).toBeInTheDocument()
  })

  it('should display user email', () => {
    renderUserRow(createMockUser({ email: 'jane.doe@example.com' }))

    expect(screen.getByRole('cell', { name: 'jane.doe@example.com' })).toBeInTheDocument()
  })

  test.each(roles)('should display %s user role', (role) => {
    renderUserRow(createMockUser({ role }))

    expect(screen.getByRole('cell', { name: role })).toBeInTheDocument()
  })

  test.each(roles)('should have %s user role class', (role) => {
    renderUserRow(createMockUser({ role }))

    expect(screen.getByRole('row')).toHaveClass('user', role)
  })

  test.each<{ isActive: boolean; label: string }>([
    { isActive: true, label: 'Active' },
    { isActive: false, label: 'Disabled' },
  ])('should display $label status when user is active=$isActive', ({ isActive, label }) => {
    renderUserRow(createMockUser({ isActive }))

    expect(screen.getByRole('cell', { name: label })).toBeInTheDocument()
  })

  test.each<{ isActive: boolean; className: string }>([
    { isActive: true, className: 'active' },
    { isActive: false, className: 'disabled' },
  ])('should have $className class when user is active=$isActive', ({ isActive, className }) => {
    renderUserRow(createMockUser({ isActive }))

    expect(screen.getByRole('row')).toHaveClass('user', className)
  })
})
