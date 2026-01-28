import { ChangeEvent } from 'react'
import { TodoListFilter } from './types'

const filters: Record<TodoListFilter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
}

type TodoFiltersProps = {
  value: TodoListFilter
  onChange: (filter: TodoListFilter) => void
}

export function TodoFilters({ value, onChange }: TodoFiltersProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    onChange(e.target.value as TodoListFilter)
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {Object.entries(filters).map(([filter, label]) => (
        <option key={filter} value={filter}>
          {label}
        </option>
      ))}
    </select>
  )
}
