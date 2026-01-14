import type { ReactNode } from 'react'

interface DataListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
  header?: ReactNode
  footer?: ReactNode
}

export function DataList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage,
  header,
  footer,
}: DataListProps<T>) {
  return (
    <div className="data-list">
      {header}
      {items.length === 0 ? (
        emptyMessage
      ) : (
        <ul>
          {items.map((item, index) => (
            <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
          ))}
        </ul>
      )}
      {footer}
    </div>
  )
}
