import { Todo } from './types'

type TodoItemProps = {
  todo: Todo
  onToggle: () => void
  onDelete: () => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          className={`w-5 h-5 accent-blue-500 ${todo.text}`}
        />
        <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}>
          {todo.text}
        </span>
      </label>
      <button
        onClick={onDelete}
        aria-label={`Delete ${todo.text}`}
        className="text-red-500 hover:text-red-700 text-sm ml-2"
      >
        Delete
      </button>
    </div>
  )
}
