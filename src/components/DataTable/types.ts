import { ReactNode } from 'react'

export interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  render?: (value: T[keyof T], item: T) => ReactNode
}

export type SortDirection = 'asc' | 'desc'

export interface SortConfig<T> {
  key: keyof T
  direction: SortDirection
}

export interface DataTableProps<T> {
  dataFactory: () => Promise<T[]>
  columns: Column<T>[]
  rowKey: keyof T
  pageSize?: number
}

export interface DataTableBodyProps<T> {
  dataPromise: Promise<T[]>
  columns: Column<T>[]
  rowKey: keyof T
  pageSize?: number
  sortConfig: SortConfig<T> | null
}

export interface DataTableSkeletonProps<T> {
  columns: Column<T>[]
  pageSize?: number
}

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}
