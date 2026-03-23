export type Todo = Readonly<{
  id: string
  text: string
  completed: boolean
}>

export type OptimisticTodo = Todo & { pending?: boolean }

export type OptimisticTodoListAction =
  | Readonly<{ type: 'ADD'; todo: Todo }>
  | Readonly<{ type: 'TOGGLE'; todo: Todo }>
  | Readonly<{ type: 'DELETE'; todo: Todo }>
