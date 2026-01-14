import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '@/components/Counter'

describe('Counter', () => {
  const expectCount = (count: number) => {
    expect(screen.getByRole('paragraph')).toHaveTextContent(`Count: ${count}`)
  }

  it('should display count=0 when initialized', () => {
    render(<Counter />)

    expectCount(0)
  })

  it('should increment count when button is clicked', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))

    expectCount(1)
  })

  it('should decrement count when button is clicked', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Decrement' }))

    expectCount(1)
  })

  it('should not decrement when button is clicked and count is 0', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Decrement' }))

    expectCount(0)
  })

  it('should reset count when button is clicked', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expectCount(0)
  })

  it('should double count when button is clicked', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Double' }))

    expectCount(2)
  })

  it('should keep 0 when doubling 0', async () => {
    const user = userEvent.setup()

    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Double' }))

    expectCount(0)
  })
})
