import { Todo, TodoListFilter, TodoListState } from '@/components/TodoList/types'
import { todoReducer } from '@/components/TodoList/todoReducer'

function createTodo(overrides?: Partial<Todo>): Todo {
  return {
    id: crypto.randomUUID(),
    text: 'Default text',
    completed: false,
    ...overrides,
  }
}

function createState(overrides?: Partial<TodoListState>): TodoListState {
  return {
    todos: [],
    filter: 'all',
    ...overrides,
  }
}

describe('todoReducer', () => {
  it('should add todo with given text at last position', () => {
    const state = createState({
      todos: [createTodo({ text: 'first' })],
    })
    const newState = todoReducer(state, { type: 'ADD_TODO', text: 'second' })

    expect(newState).not.toBe(state)
    expect(newState.todos).toHaveLength(2)
    expect(newState.todos[0]?.text).toBe('first')
    expect(newState.todos[1]?.text).toBe('second')
    expect(newState.todos[1]?.id).not.toBe('')
    expect(newState.todos[1]?.completed).toBe(false)
  })

  it.each<{ initial: boolean; expected: boolean }>([
    { initial: false, expected: true },
    { initial: true, expected: false },
  ])(
    `should toggle completed from $initial to $expected for todo with given id`,
    ({ initial, expected }) => {
      const todo = createTodo({ completed: initial })
      const state = createState({
        todos: [todo],
      })
      const newState = todoReducer(state, { type: 'TOGGLE_TODO', id: todo.id })

      expect(newState).not.toBe(state)
      expect(newState.todos).toHaveLength(1)
      expect(newState.todos[0]?.id).toBe(todo.id)
      expect(newState.todos[0]?.text).toBe(todo.text)
      expect(newState.todos[0]?.completed).toBe(expected)
    }
  )

  it('should return unchanged todos when toggling non-existent id', () => {
    const state = createState({
      todos: [createTodo()],
    })
    const newState = todoReducer(state, { type: 'TOGGLE_TODO', id: 'non-existent' })

    expect(newState.todos).toEqual(state.todos)
  })

  it('should remove todo with given id', () => {
    const todoToRemove = createTodo()
    const todoToKeep = createTodo()
    const state = createState({
      todos: [todoToRemove, todoToKeep],
    })
    const newState = todoReducer(state, { type: 'DELETE_TODO', id: todoToRemove.id })

    expect(newState).not.toBe(state)
    expect(newState.todos).toHaveLength(1)
    expect(newState.todos[0]).toBe(todoToKeep)
  })

  it.each<TodoListFilter>(['all', 'active', 'completed'])(`should set filter to "%s"`, (filter) => {
    const state = createState()
    const newState = todoReducer(state, { type: 'SET_FILTER', filter: filter })

    expect(newState).not.toBe(state)
    expect(newState.filter).toBe(filter)
  })

  it('should remove all completed todos', () => {
    const todoToRemove = createTodo({ completed: true })
    const todoToKeep = createTodo({ completed: false })
    const state = createState({
      todos: [todoToRemove, todoToKeep],
    })
    const newState = todoReducer(state, { type: 'CLEAR_COMPLETED' })

    expect(newState).not.toBe(state)
    expect(newState.todos).toHaveLength(1)
    expect(newState.todos[0]).toBe(todoToKeep)
  })

  it('should return same todos when clearing with no completed todos', () => {
    const state = createState({
      todos: [createTodo({ completed: false })],
    })
    const newState = todoReducer(state, { type: 'CLEAR_COMPLETED' })

    expect(newState.todos).toEqual(state.todos)
  })
})
