import { useEffect, useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>((): T => {
    try {
      const saved = localStorage?.getItem(key)

      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to read from local storage', e)
    }

    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Failed to write to local storage', e)
    }
  }, [key, value])

  return [value, setValue]
}
