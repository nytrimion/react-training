import { FormEvent, useOptimistic, useRef, useState, useTransition } from 'react'
import { OptimisticTodoItem } from './OptimisticTodoItem'
import { OptimisticTodo, OptimisticTodoListAction, Todo } from './types'

type OptimisticTodoListProps = {
  initialTodos: Todo[]
  addTodo: (text: string) => Promise<Todo>
  toggleTodo: (id: string) => Promise<Todo>
  deleteTodo: (id: string) => Promise<void>
}

export function OptimisticTodoList({
  initialTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
}: OptimisticTodoListProps) {
  const addForm = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [todos, setTodos] = useState(initialTodos)
  const [optimisticTodos, dispatchOptimisticTodo] = useOptimistic(
    todos,
    (current, action: OptimisticTodoListAction) => {
      switch (action.type) {
        case 'ADD':
          return [...current, { ...action.todo, pending: true }]
        case 'TOGGLE':
          return current.map((todo) => {
            if (todo.id !== action.todo.id) return todo
            return {
              ...todo,
              completed: !todo.completed,
              pending: true,
            }
          })
        case 'DELETE':
          return current.filter((todo) => todo.id !== action.todo.id)
        default:
          const _exhaustiveCheck: never = action
          return current
      }
    }
  )

  const wrapOptimisticCallback =
    (callback: (todo: OptimisticTodo) => Promise<void>) =>
    async (todo: OptimisticTodo): Promise<void> => {
      try {
        await callback(todo)
        setError(null)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred')
      }
    }
  const addOptimisticTodo = wrapOptimisticCallback(async (todo: OptimisticTodo) => {
    dispatchOptimisticTodo({ type: 'ADD', todo })
    const confirmed = await addTodo(todo.text)
    setTodos((prev) => [...prev, confirmed])
  })
  const toggleOptimisticTodo = wrapOptimisticCallback(async (todo: OptimisticTodo) => {
    dispatchOptimisticTodo({ type: 'TOGGLE', todo })
    const confirmed = await toggleTodo(todo.id)
    setTodos((prev) => prev.map((t) => (t.id === confirmed.id ? confirmed : t)))
  })
  const deleteOptimisticTodo = wrapOptimisticCallback(async (todo: OptimisticTodo) => {
    dispatchOptimisticTodo({ type: 'DELETE', todo })
    await deleteTodo(todo.id)
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
  })

  const [isAddPending, startAddTransition] = useTransition()
  const handleAddTodo = (event: FormEvent) => {
    event.preventDefault()

    if (!addForm.current) return

    const formData = new FormData(addForm.current)
    const text = (formData.get('text') as string).trim()

    if (!text) return

    startAddTransition(async () => {
      await addOptimisticTodo({
        id: crypto.randomUUID(),
        text,
        completed: false,
      })
      addForm.current?.reset()
    })
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form ref={addForm} onSubmit={handleAddTodo} className="flex gap-2">
        <input
          type="text"
          name="text"
          aria-label="New todo text"
          placeholder="What needs to be done?"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isAddPending}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isAddPending ? 'Adding...' : 'Add'}
        </button>
      </form>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <ul className="space-y-2 mb-4">
        {optimisticTodos.map((todo) => (
          <li key={todo.id}>
            <OptimisticTodoItem
              todo={todo}
              toggleOptimistic={toggleOptimisticTodo}
              deleteOptimistic={deleteOptimisticTodo}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
