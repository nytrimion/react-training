import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoList } from '@/components/TodoList/TodoList'
import { Todo, TodoListFilter } from '@/components/TodoList/types'

function renderTodoList(props: { initialTodos?: Todo[]; initialFilter?: TodoListFilter } = {}) {
  const { container } = render(<TodoList {...props} />)

  return {
    container,
    filterSelect: screen.getByRole('combobox'),
    todoList: screen.getByRole('list'),
  }
}

describe('TodoList', () => {
  it('should display no todos with "all" filter by default', () => {
    const { todoList, filterSelect } = renderTodoList()

    expect(todoList).toBeEmptyDOMElement()
    expect(filterSelect).toHaveValue('all')
  })

  it('should display initial todos when provided as prop', () => {
    const { todoList } = renderTodoList({
      initialTodos: [
        { id: '1', text: 'First', completed: false },
        { id: '2', text: 'Second', completed: true },
      ],
    })
    const checkbox1 = within(todoList).getByRole('checkbox', { name: 'First' })
    const checkbox2 = within(todoList).getByRole('checkbox', { name: 'Second' })

    expect(checkbox1).toBeInTheDocument()
    expect(checkbox1).not.toBeChecked()
    expect(checkbox2).toBeInTheDocument()
    expect(checkbox2).toBeChecked()
  })

  it.each(['all', 'active', 'completed'] as const)(
    'should select initial filter "%s" when provided as prop',
    (initialFilter) => {
      const { filterSelect } = renderTodoList({ initialFilter })

      expect(filterSelect).toHaveValue(initialFilter)
    }
  )

  it('should not add todo when input is empty', async () => {
    const user = userEvent.setup()
    const { todoList } = renderTodoList()
    const addButton = screen.getByRole('button', { name: 'Add' })

    await user.click(addButton)

    expect(todoList).toBeEmptyDOMElement()
  })

  it('should add todo when add button is clicked', async () => {
    const user = userEvent.setup()
    const { todoList } = renderTodoList({
      initialTodos: [{ id: '1', text: 'First', completed: false }],
    })
    const addInput = screen.getByRole('textbox', { name: 'New todo text' })
    const addButton = screen.getByRole('button', { name: 'Add' })

    await user.type(addInput, 'Second')
    await user.click(addButton)

    const checkbox1 = within(todoList).getByRole('checkbox', { name: 'First' })
    const checkbox2 = within(todoList).getByRole('checkbox', { name: 'Second' })

    expect(checkbox1).toBeInTheDocument()
    expect(checkbox2).toBeInTheDocument()
    expect(checkbox2).not.toBeChecked()
    expect(addInput).toHaveValue('')
  })

  it('should toggle todo when checkbox or label are clicked', async () => {
    const user = userEvent.setup()
    const { todoList } = renderTodoList({
      initialTodos: [{ id: '1', text: 'Task', completed: false }],
    })
    const checkbox = within(todoList).getByRole('checkbox', { name: 'Task' })
    const label = within(todoList).getByText('Task')

    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    await user.click(label)
    expect(checkbox).not.toBeChecked()
  })

  it.each<{ filter: TodoListFilter; visible: string[]; hidden: string[] }>([
    { filter: 'all', visible: ['Active', 'Completed'], hidden: [] },
    { filter: 'active', visible: ['Active'], hidden: ['Completed'] },
    { filter: 'completed', visible: ['Completed'], hidden: ['Active'] },
  ])(
    'should display $filter todos and hide the others when filter is set to "$filter"',
    async ({ filter, visible, hidden }) => {
      const user = userEvent.setup()
      const { filterSelect, todoList } = renderTodoList({
        initialTodos: [
          { id: '1', text: 'Active', completed: false },
          { id: '2', text: 'Completed', completed: true },
        ],
      })
      await user.selectOptions(filterSelect, filter)

      expect(filterSelect).toHaveValue(filter)
      visible.forEach((text) => {
        expect(within(todoList).getByRole('checkbox', { name: text })).toBeInTheDocument()
      })
      hidden.forEach((text) => {
        expect(within(todoList).queryByRole('checkbox', { name: text })).not.toBeInTheDocument()
      })
    }
  )

  it('should delete todo when delete button is clicked', async () => {
    const user = userEvent.setup()
    const { todoList } = renderTodoList({
      initialTodos: [
        { id: '1', text: 'First', completed: false },
        { id: '2', text: 'Second', completed: false },
      ],
    })
    const deleteButton = within(todoList).getByRole('button', { name: 'Delete First' })

    await user.click(deleteButton)

    expect(within(todoList).queryByRole('checkbox', { name: 'First' })).not.toBeInTheDocument()
    expect(within(todoList).getByRole('checkbox', { name: 'Second' })).toBeInTheDocument()
  })

  it('should delete completed todos when clear completed button is clicked', async () => {
    const user = userEvent.setup()
    const { todoList } = renderTodoList({
      initialTodos: [
        { id: '1', text: 'First', completed: true },
        { id: '2', text: 'Second', completed: false },
      ],
    })
    const clearButton = screen.getByRole('button', { name: 'Clear completed' })
    const checkbox1 = within(todoList).getByRole('checkbox', { name: 'First' })
    const checkbox2 = within(todoList).getByRole('checkbox', { name: 'Second' })

    await user.click(clearButton)

    expect(checkbox1).not.toBeInTheDocument()
    expect(checkbox2).toBeInTheDocument()
  })

  it('should update remaining todos when todo is toggled', async () => {
    const user = userEvent.setup()
    const { todoList } = renderTodoList({
      initialTodos: [{ id: '1', text: 'Task', completed: false }],
    })
    const counter = screen.getByText(/remaining/i)
    const checkbox = within(todoList).getByRole('checkbox', { name: 'Task' })

    expect(counter).toHaveTextContent('1 remaining')
    await user.click(checkbox)
    expect(counter).toHaveTextContent('0 remaining')
    await user.click(checkbox)
    expect(counter).toHaveTextContent('1 remaining')
  })
})
