import { Todo } from '@/components/OptimisticTodoList/types'

const serverDelay = 2000
const serverErrorRate = 0.2
const todos: Todo[] = []

export function resetServer() {
  todos.length = 0
}

function findTodoIndex(id: string): number {
  return todos.findIndex((todo) => id === todo.id)
}

function simulateServerEndpoint<T>(
  processor: () => T,
  delay = serverDelay,
  errorRate = serverErrorRate
): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Error('Server error: Random issue'))
        return
      }
      try {
        resolve(processor())
      } catch (e: unknown) {
        reject(new Error(`Server error: ${e}`))
      }
    }, delay)
  )
}

export async function serverAddTodo(text: string): Promise<Todo> {
  return simulateServerEndpoint(() => {
    const todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    }
    if (findTodoIndex(todo.id) !== -1) throw new Error(`Duplicate Todo "${todo.id}"`)
    todos.push(todo)
    return todo
  })
}

export async function serverToggleTodo(id: string): Promise<Todo> {
  return simulateServerEndpoint(() => {
    const index = findTodoIndex(id)
    const todo = todos[index]

    if (todo === undefined) throw new Error(`Todo "${id}" not found`)

    todos[index] = {
      ...todo,
      completed: !todo.completed,
    }
    return todos[index]
  })
}

export async function serverDeleteTodo(id: string): Promise<void> {
  return simulateServerEndpoint(() => {
    const index = findTodoIndex(id)

    if (index === -1) throw new Error(`Todo "${id}" not found`)

    todos.splice(index, 1)
  })
}
