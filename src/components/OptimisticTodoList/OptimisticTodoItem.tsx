import { useTransition } from 'react'
import { OptimisticTodo } from './types'

type OptimisticTodoItemProps = {
  todo: OptimisticTodo
  toggleOptimistic: (todo: OptimisticTodo) => Promise<void>
  deleteOptimistic: (todo: OptimisticTodo) => Promise<void>
}

export function OptimisticTodoItem({
  todo,
  toggleOptimistic,
  deleteOptimistic,
}: OptimisticTodoItemProps) {
  const [isTransitionPending, startTransition] = useTransition()

  const isPending = todo.pending || isTransitionPending

  const handleToggle = () => {
    if (isPending) return

    startTransition(() => toggleOptimistic(todo))
  }
  const handleDelete = () => {
    if (isPending) return

    startTransition(() => deleteOptimistic(todo))
  }

  return (
    <div
      className={`flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 ${isPending ? 'opacity-50' : ''}`}
    >
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={isPending}
          onChange={handleToggle}
          className="w-5 h-5 accent-blue-500"
        />
        <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}>
          {todo.text}
        </span>
      </label>
      <button
        onClick={handleDelete}
        disabled={isPending}
        aria-label={`Delete ${todo.text}`}
        className="text-red-500 hover:text-red-700 text-sm ml-2"
      >
        Delete
      </button>
    </div>
  )
}
