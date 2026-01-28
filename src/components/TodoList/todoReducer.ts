import { TodoListAction, TodoListState } from './types'

export function todoReducer(state: TodoListState, action: TodoListAction): TodoListState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: crypto.randomUUID(), text: action.text, completed: false }],
      }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        ),
      }
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.id),
      }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      }
    default:
      const _exhaustiveCheck: never = action
      return state
  }
}
