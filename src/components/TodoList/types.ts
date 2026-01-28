export type Todo = Readonly<{
  id: string
  text: string
  completed: boolean
}>

export type TodoListFilter = 'all' | 'active' | 'completed'

export type TodoListState = Readonly<{
  todos: readonly Todo[]
  filter: TodoListFilter
}>

export type TodoListAction =
  | Readonly<{ type: 'ADD_TODO'; text: string }>
  | Readonly<{ type: 'TOGGLE_TODO'; id: string }>
  | Readonly<{ type: 'DELETE_TODO'; id: string }>
  | Readonly<{ type: 'SET_FILTER'; filter: TodoListFilter }>
  | Readonly<{ type: 'CLEAR_COMPLETED' }>
