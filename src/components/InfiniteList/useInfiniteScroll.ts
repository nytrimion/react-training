import { useCallback, useEffect, useRef, useState } from 'react'

export type PageFetcher<T> = (page: number) => Promise<{ data: T[]; hasMore: boolean }>

export function useInfiniteScroll<T, E extends HTMLElement>(fetchPage: PageFetcher<T>) {
  const fetchPageRef = useRef(fetchPage)
  const nextPage = useRef(1)
  const isCompleted = useRef(false)
  const isLoading = useRef(false)
  const sentinelRef = useRef<E>(null)
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = useCallback(async () => {
    if (isLoading.current || isCompleted.current) return

    setError(null)
    isLoading.current = true
    setLoading(true)

    try {
      const { data, hasMore } = await fetchPageRef.current(nextPage.current)
      nextPage.current++
      isCompleted.current = !hasMore
      setItems((prev) => [...prev, ...data])
    } catch (e: unknown) {
      setError(
        new Error(`Failed to fetch items of page ${nextPage.current}`, {
          cause: e,
        })
      )
    } finally {
      isLoading.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sentinelRef.current === null) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) fetchItems().catch((reason) => console.error(reason))
    })
    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [fetchItems])

  fetchPageRef.current = fetchPage

  return {
    sentinelRef,
    items,
    loading,
    error,
    handleRetry: fetchItems,
  }
}
