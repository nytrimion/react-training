import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount((prev) => prev + 1)
  }
  const handleDecrement = () => {
    setCount((prev) => Math.max(0, prev - 1))
  }
  const handleReset = () => {
    setCount(0)
  }
  const handleDouble = () => {
    setCount((prev) => prev * 2)
  }

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleDecrement}>Decrement</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleDouble}>Double</button>
    </>
  )
}
