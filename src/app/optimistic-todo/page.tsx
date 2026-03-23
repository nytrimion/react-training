'use client'

import {
  OptimisticTodoList,
  serverAddTodo,
  serverDeleteTodo,
  serverToggleTodo,
  Todo,
} from '@/components/OptimisticTodoList'

const initialTodos: Todo[] = []

export default function TodoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <OptimisticTodoList
          initialTodos={initialTodos}
          addTodo={serverAddTodo}
          deleteTodo={serverDeleteTodo}
          toggleTodo={serverToggleTodo}
        />
      </main>
    </div>
  )
}
