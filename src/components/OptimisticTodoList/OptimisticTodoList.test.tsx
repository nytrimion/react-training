// Note: React 19 async transitions trigger spurious "act(...)" warnings in Jest/jsdom.
// This is a known ecosystem issue — the tests are functionally correct.

import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptimisticTodoList, Todo } from '@/components/OptimisticTodoList'

function renderTodoList(initialTodos: Todo[] = []) {
  const addTodo = jest.fn()
  const toggleTodo = jest.fn()
  const deleteTodo = jest.fn()
  const { container } = render(
    <OptimisticTodoList
      initialTodos={initialTodos}
      addTodo={addTodo}
      toggleTodo={toggleTodo}
      deleteTodo={deleteTodo}
    />
  )

  return {
    addTodo,
    toggleTodo,
    deleteTodo,
    container,
    addInput: screen.getByRole('textbox', { name: 'New todo text' }),
    addButton: screen.getByRole('button', { name: 'Add' }),
    todoList: screen.getByRole('list'),
  }
}

describe('OptimisticTodolist', () => {
  describe('rendering', () => {
    it('should display no todos when none are given', () => {
      const { todoList } = renderTodoList()

      expect(todoList).toBeEmptyDOMElement()
    })

    it('should display given todos', () => {
      const { todoList } = renderTodoList([
        { id: '1', text: 'First', completed: true },
        { id: '2', text: 'Second', completed: false },
      ])

      expect(within(todoList).getAllByRole('checkbox')).toHaveLength(2)
      expect(within(todoList).getByRole('checkbox', { name: 'First' })).toBeChecked()
      expect(within(todoList).getByRole('checkbox', { name: 'Second' })).not.toBeChecked()
    })
  })

  describe('add', () => {
    it('should not submit when text is empty', async () => {
      const user = userEvent.setup()
      const { addTodo, addInput, addButton, todoList } = renderTodoList()

      expect(addInput).toHaveValue('')

      await user.click(addButton)

      expect(addTodo).not.toHaveBeenCalled()

      expect(todoList).toBeEmptyDOMElement()
    })

    it('should not submit when text is only spaces', async () => {
      const user = userEvent.setup()
      const { addTodo, addInput, addButton, todoList } = renderTodoList()

      await user.type(addInput, ' ')
      expect(addInput).toHaveValue(' ')
      await user.click(addButton)

      expect(addTodo).not.toHaveBeenCalled()
      expect(todoList).toBeEmptyDOMElement()
    })

    it('should display todo immediately before server confirms', async () => {
      const user = userEvent.setup()
      const { addTodo, addInput, addButton, todoList } = renderTodoList([
        { id: '1', text: 'First', completed: true },
      ])
      addTodo.mockResolvedValue({
        id: 'server-1',
        text: 'Second',
        completed: false,
      })

      await user.type(addInput, 'Second')
      await act(async () => {
        await user.click(addButton)
        expect(addButton).toHaveTextContent('Adding...')
        expect(within(todoList).getByRole('checkbox', { name: 'Second' })).not.toBeChecked()
      })

      await waitFor(() => {
        expect(addButton).toHaveTextContent('Add')
        expect(within(todoList).getAllByRole('checkbox')).toHaveLength(2)
        expect(within(todoList).getByRole('checkbox', { name: 'First' })).toBeChecked()
        expect(within(todoList).getByRole('checkbox', { name: 'Second' })).not.toBeChecked()
      })
      expect(addTodo).toHaveBeenCalledTimes(1)
      expect(addTodo).toHaveBeenCalledWith('Second')
    })

    it('should reset form when successful', async () => {
      const user = userEvent.setup()
      const { addTodo, addInput, addButton } = renderTodoList()
      addTodo.mockResolvedValue({
        id: 'server-1',
        text: 'Second',
        completed: false,
      })

      await user.type(addInput, 'Second')
      await user.click(addButton)

      await waitFor(() => {
        expect(addInput).toHaveValue('')
      })
    })

    it('should display error message when server action fails', async () => {
      const user = userEvent.setup()
      const { addTodo, addInput, addButton, todoList } = renderTodoList()
      addTodo.mockRejectedValue(new Error('Unexpected error'))

      await user.type(addInput, 'Whatever')
      await act(async () => {
        await user.click(addButton)
        expect(within(todoList).getByRole('checkbox', { name: 'Whatever' })).not.toBeChecked()
      })

      await waitFor(() => {
        expect(todoList).toBeEmptyDOMElement()
        expect(screen.getByText('Unexpected error')).toBeInTheDocument()
      })
      expect(addTodo).toHaveBeenCalledTimes(1)
    })
  })

  describe('toggle', () => {
    it('should toggle checkbox immediately before server confirms', async () => {
      const user = userEvent.setup()
      const todo = { id: '1', text: 'First', completed: true }
      const { toggleTodo, todoList } = renderTodoList([todo])
      const checkbox = within(todoList).getByRole('checkbox', { name: 'First' })
      toggleTodo.mockResolvedValue({ ...todo, completed: false })

      await user.click(checkbox)

      await waitFor(() => {
        expect(checkbox).not.toBeChecked()
      })
      expect(toggleTodo).toHaveBeenCalledTimes(1)
      expect(toggleTodo).toHaveBeenCalledWith('1')
    })

    it('should rollback optimistic toggle when server action fails', async () => {
      const user = userEvent.setup()
      const todo = { id: '1', text: 'First', completed: true }
      const { toggleTodo, todoList } = renderTodoList([todo])
      const checkbox = within(todoList).getByRole('checkbox', { name: 'First' })
      toggleTodo.mockRejectedValue(new Error('Unexpected error'))

      await act(async () => {
        await user.click(checkbox)
        expect(checkbox).not.toBeChecked()
      })

      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
      expect(toggleTodo).toHaveBeenCalledTimes(1)
      expect(toggleTodo).toHaveBeenCalledWith('1')
    })
  })

  describe('delete', () => {
    it('should remove todo', async () => {
      const user = userEvent.setup()
      const { deleteTodo, todoList } = renderTodoList([
        { id: '1', text: 'First', completed: true },
        { id: '2', text: 'Second', completed: false },
      ])

      await user.click(within(todoList).getByRole('button', { name: 'Delete First' }))

      await waitFor(() => {
        expect(
          within(todoList).queryByRole('button', { name: 'Delete First' })
        ).not.toBeInTheDocument()
        expect(within(todoList).getByRole('button', { name: 'Delete Second' })).toBeInTheDocument()
      })
      expect(deleteTodo).toHaveBeenCalledTimes(1)
      expect(deleteTodo).toHaveBeenCalledWith('1')
    })

    it('should rollback removed todo when server action fails', async () => {
      const user = userEvent.setup()
      const { deleteTodo, todoList } = renderTodoList([
        { id: '1', text: 'First', completed: true },
        { id: '2', text: 'Second', completed: false },
      ])
      deleteTodo.mockRejectedValue(new Error('Unexpected error'))

      await act(async () => {
        await user.click(within(todoList).getByRole('button', { name: 'Delete First' }))
        expect(
          within(todoList).queryByRole('button', { name: 'Delete First' })
        ).not.toBeInTheDocument()
        expect(within(todoList).getByRole('button', { name: 'Delete Second' })).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(within(todoList).getByRole('button', { name: 'Delete First' })).toBeInTheDocument()
        expect(within(todoList).getByRole('button', { name: 'Delete Second' })).toBeInTheDocument()
      })
      expect(deleteTodo).toHaveBeenCalledTimes(1)
      expect(deleteTodo).toHaveBeenCalledWith('1')
    })
  })

  describe('error handling', () => {
    it('should remove error message when any action is successful', async () => {
      const user = userEvent.setup()
      const { addTodo, addInput, addButton, todoList } = renderTodoList()
      addTodo.mockRejectedValueOnce(new Error('Unexpected error')).mockResolvedValueOnce({
        id: 'server-1',
        text: 'Whatever',
        completed: false,
      })

      await user.type(addInput, 'Whatever')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Unexpected error')).toBeInTheDocument()
      })

      await user.type(addInput, 'Whatever')
      await user.click(addButton)

      await waitFor(() => {
        expect(todoList).not.toBeEmptyDOMElement()
        expect(screen.queryByText('Unexpected error')).not.toBeInTheDocument()
      })
    })
  })

  describe('pending state', () => {
    it('should disable interactions while todo is pending', async () => {
      const user = userEvent.setup()
      const { addTodo, toggleTodo, deleteTodo, addInput, addButton, todoList } = renderTodoList()
      addTodo.mockResolvedValue({
        id: 'server-1',
        text: 'Whatever',
        completed: false,
      })

      await user.type(addInput, 'Whatever')
      await act(async () => {
        await user.click(addButton)

        const checkbox = within(todoList).getByRole('checkbox', { name: 'Whatever' })
        const deleteButton = within(todoList).getByRole('button', { name: 'Delete Whatever' })

        expect(checkbox).toBeDisabled()
        expect(deleteButton).toBeDisabled()
        await user.click(checkbox)
        await user.click(deleteButton)
      })

      expect(toggleTodo).not.toHaveBeenCalled()
      expect(deleteTodo).not.toHaveBeenCalled()
    })
  })
})
