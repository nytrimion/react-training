import { useEffect, useReducer, useState } from 'react'

interface State<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

type Action<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: T }
  | { type: 'FETCH_ERROR'; error: Error }

function fetchReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { data: null, error: null, loading: true }
    case 'FETCH_SUCCESS':
      return { data: action.data, error: null, loading: false }
    case 'FETCH_ERROR':
      return { data: null, error: action.error, loading: false }
    default:
      const _exhaustiveCheck: never = action
      return state
  }
}

interface UseFetchResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
  refetch: () => void
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [state, dispatch] = useReducer(fetchReducer<T>, {
    data: null,
    error: null,
    loading: true,
  })
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    dispatch({ type: 'FETCH_START' })
    fetch(url, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then((json) => dispatch({ type: 'FETCH_SUCCESS', data: json }))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          dispatch({ type: 'FETCH_ERROR', error: err })
        }
      })

    return () => controller.abort()
  }, [url, counter])

  return {
    ...state,
    refetch: () => setCounter((prev) => prev + 1),
  }
}
