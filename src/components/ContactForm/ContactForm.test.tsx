import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/ContactForm'

function getSubmitButton() {
  return screen.getByRole('button', { name: 'Submit' })
}

describe('ContactForm', () => {
  it('should submit when data are valid', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<ContactForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'john.doe@example.com')
    await user.type(screen.getByLabelText('Message'), 'The message')
    await user.click(getSubmitButton())

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      message: 'The message',
    })
  })

  it('should not call onSubmit when form is invalid', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<ContactForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Name'), 'x')
    await user.click(getSubmitButton())

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should display error when name loses focus and value is empty', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.click(screen.getByLabelText('Name'))
    await user.tab()

    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })

  it('should display error when name loses focus and value is too short', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.type(screen.getByLabelText('Name'), 'x')
    await user.tab()

    expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
  })

  it('should display error when email loses focus and value is empty', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.click(screen.getByLabelText('Email'))
    await user.tab()

    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('should display error when email loses focus and value is invalid', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.type(screen.getByLabelText('Email'), 'whatever')
    await user.tab()

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
  })

  it('should display error when message loses focus and value is empty', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.click(screen.getByLabelText('Message'))
    await user.tab()

    expect(screen.getByText('Message is required')).toBeInTheDocument()
  })

  it('should display error when message loses focus and value is too short', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.type(screen.getByLabelText('Message'), 'too short')
    await user.tab()

    expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument()
  })

  it('should toggle submit button based on form validity', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)

    const submit = getSubmitButton()

    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Name'), 'John Doe')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Email'), 'john.doe@example.com')
    expect(submit).toBeDisabled()
    await user.type(screen.getByLabelText('Message'), 'The message')
    expect(submit).toBeEnabled()
    await user.clear(screen.getByLabelText('Name'))
    expect(submit).toBeDisabled()
  })

  it('should remove errors when errors are fixed', async () => {
    const user = userEvent.setup()

    render(<ContactForm onSubmit={jest.fn()} />)
    await user.click(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Email'), 'whatever')
    await user.type(screen.getByLabelText('Message'), 'too short')
    await user.tab()

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'john.doe@example.com')
    await user.clear(screen.getByLabelText('Message'))
    await user.type(screen.getByLabelText('Message'), 'The message')
    await user.tab()

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    expect(screen.queryByText('Please enter a valid email')).not.toBeInTheDocument()
    expect(screen.queryByText('Message must be at least 10 characters')).not.toBeInTheDocument()
  })
})
