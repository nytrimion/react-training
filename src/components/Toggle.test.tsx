import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from '@/components/Toggle'

describe('Toggle', () => {
  it('should display label when provided', () => {
    render(<Toggle label="The label" />)

    expect(screen.getByText('The label')).toBeInTheDocument()
  })

  it('should display "Off" default status', () => {
    render(<Toggle />)

    expect(screen.getByRole('switch')).toHaveTextContent('Off')
  })

  test.each<{ defaultChecked: boolean; status: string }>([
    { defaultChecked: true, status: 'On' },
    { defaultChecked: false, status: 'Off' },
  ])(
    'should display "$status" default status when defaultChecked is $defaultChecked',
    ({ defaultChecked, status }) => {
      render(<Toggle defaultChecked={defaultChecked} />)

      expect(screen.getByRole('switch')).toHaveTextContent(status)
    }
  )

  it('should toggle status when button is clicked', async () => {
    const user = userEvent.setup()

    render(<Toggle />)

    const button = screen.getByRole('switch')

    expect(button).toHaveTextContent('Off')
    await user.click(button)
    expect(button).toHaveTextContent('On')
    await user.click(button)
    expect(button).toHaveTextContent('Off')
  })

  it('should toggle aria-checked attribute when button is clicked', async () => {
    const user = userEvent.setup()

    render(<Toggle />)

    const button = screen.getByRole('switch')

    expect(button).toHaveAttribute('aria-checked', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-checked', 'true')
    await user.click(button)
    expect(button).toHaveAttribute('aria-checked', 'false')
  })

  it('should call onChange callback with new state when button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<Toggle onChange={onChange} />)

    const button = screen.getByRole('switch')

    await user.click(button)
    expect(onChange).toHaveBeenCalledWith(true)
    await user.click(button)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  test.each<{ name: string; key: string }>([
    { name: 'space', key: ' ' },
    { name: 'enter', key: '{Enter}' },
  ])('should toggle status when $name key is pressed', async ({ key }) => {
    const user = userEvent.setup()

    render(<Toggle />)

    const button = screen.getByRole('switch')

    await user.tab()
    expect(button).toHaveTextContent('Off')
    await user.keyboard(key)
    expect(button).toHaveTextContent('On')
    await user.keyboard(key)
    expect(button).toHaveTextContent('Off')
  })
})
