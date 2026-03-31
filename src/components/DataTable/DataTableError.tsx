import { Component, ErrorInfo } from 'react'
import { ErrorBoundaryProps, ErrorBoundaryState } from '@/components/DataTable/types'

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

export function DataTableError({
  columnCount,
  onRetry,
}: {
  columnCount: number
  onRetry: () => void
}) {
  return (
    <>
      <tbody>
        <tr>
          <td colSpan={columnCount} className="text-center">
            <span className="text-sm text-red-600 dark:text-red-400">
              An unexpected error occurred
            </span>
            <button
              onClick={onRetry}
              className="rounded px-3 py-1 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Try again
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={columnCount}></td>
        </tr>
      </tfoot>
    </>
  )
}
