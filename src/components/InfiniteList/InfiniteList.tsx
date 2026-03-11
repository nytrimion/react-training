import { ReactNode } from 'react'
import { PageFetcher, useInfiniteScroll } from './useInfiniteScroll'

type ListItem = {
  id: string
}

interface InfiniteListProps<T> {
  fetchPage: PageFetcher<T>
  renderItem: (item: T) => ReactNode
}

export function InfiniteList<T extends ListItem>({ fetchPage, renderItem }: InfiniteListProps<T>) {
  const { items, sentinelRef, loading, error, handleRetry } = useInfiniteScroll<T, HTMLLIElement>(
    fetchPage
  )

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
      <li ref={sentinelRef} />
      {loading && <li>Loading...</li>}
      {error && (
        <li>
          Failed to load next items <button onClick={handleRetry}>Retry</button>
        </li>
      )}
    </ul>
  )
}
