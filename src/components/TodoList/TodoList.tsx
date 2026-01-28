import { FormEvent, useReducer, useRef } from 'react'
import { TodoFilters } from './TodoFilters'
import { TodoItem } from './TodoItem'
import { todoReducer } from './todoReducer'
import { Todo, TodoListFilter } from './types'

type TodoListProps = {
  initialTodos?: Todo[]
  initialFilter?: TodoListFilter
}

function createStateFromProps({ initialTodos, initialFilter }: TodoListProps) {
  return {
    todos: initialTodos ?? [],
    filter: initialFilter ?? ('all' as const),
  }
}

export function TodoList({ initialTodos, initialFilter }: TodoListProps) {
  const [state, dispatch] = useReducer(
    todoReducer,
    { initialTodos, initialFilter },
    createStateFromProps
  )
  const newTodoText = useRef<HTMLInputElement>(null)

  const filtered = state.todos.filter((todo) => {
    switch (state.filter) {
      case 'completed':
        return todo.completed
      case 'active':
        return !todo.completed
      case 'all':
        return true
    }
  })
  const activeCount = state.todos.filter((todo) => !todo.completed).length

  function handleAddTodo(e: FormEvent) {
    e.preventDefault()
    const input = newTodoText.current

    if (!input) throw new Error('New todo text is unreachable')
    if (input.value !== '') {
      dispatch({ type: 'ADD_TODO', text: input.value })
      input.value = ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <TodoFilters
          value={state.filter}
          onChange={(filter: TodoListFilter) => dispatch({ type: 'SET_FILTER', filter })}
        />
        <span>{activeCount} remaining</span>
        <button
          onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}
          className="text-sm text-red-600 hover:text-red-800 hover:underline"
        >
          Clear completed
        </button>
      </div>
      <ul className="space-y-2 mb-4">
        {filtered.map((todo) => (
          <li key={todo.id}>
            <TodoItem
              todo={todo}
              onToggle={() => dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
              onDelete={() => dispatch({ type: 'DELETE_TODO', id: todo.id })}
            />
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          ref={newTodoText}
          aria-label="New todo text"
          placeholder="What needs to be done?"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </form>
    </div>
  )
}
