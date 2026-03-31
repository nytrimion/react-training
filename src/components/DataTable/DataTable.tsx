import { Suspense, use, useCallback, useMemo, useState } from 'react'
import { DataTableError, ErrorBoundary } from './DataTableError'
import { DataTableSkeleton } from './DataTableSkeleton'
import { DataTableBodyProps, DataTableProps, SortConfig, SortDirection } from './types'

const defaultPageSize = 20
const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}
const sortDirectionClues = {
  asc: '↓',
  desc: '↑',
}

function getSortDirectionClue(direction: SortDirection) {
  return sortDirectionClues[direction]
}

function DataTableBody<T>({
  dataPromise,
  columns,
  rowKey,
  pageSize = defaultPageSize,
  sortConfig,
}: DataTableBodyProps<T>) {
  const data = use(dataPromise)
  const [currentPage, setCurrentPage] = useState(1)
  const [prevSortConfig, setPrevSortConfig] = useState(sortConfig)

  if (
    sortConfig?.key !== prevSortConfig?.key ||
    sortConfig?.direction !== prevSortConfig?.direction
  ) {
    setPrevSortConfig(sortConfig)
    setCurrentPage(1)
  }

  const sorted = useMemo(() => {
    if (sortConfig === null) return data

    return data.toSorted((item1, item2) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1
      const value1 = item1[sortConfig.key]
      const value2 = item2[sortConfig.key]

      return value1 < value2 ? -direction : value1 > value2 ? direction : 0
    })
  }, [data, sortConfig])

  const items = useMemo(
    () => sorted.slice(pageSize * (currentPage - 1), pageSize * currentPage),
    [currentPage, pageSize, sorted]
  )

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize))

  return (
    <>
      <tbody>
        {items.map((item: T) => (
          <tr
            key={`${item[rowKey]}`}
            className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {columns.map((column) => (
              <td
                key={`${item[rowKey]}-${String(column.key)}`}
                className={`px-4 py-2 text-sm ${alignClass[column.align || 'left']}`}
              >
                {column.render ? column.render(item[column.key], item) : `${item[column.key]}`}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={columns.length} className="px-4 py-3 text-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="rounded px-3 py-1 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="mx-3 text-sm text-zinc-600 dark:text-zinc-400">
              {currentPage} / {pageCount}
            </span>
            <button
              disabled={currentPage >= pageCount}
              onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
              className="rounded px-3 py-1 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </td>
        </tr>
      </tfoot>
    </>
  )
}

export function DataTable<T>({ dataFactory, columns, rowKey, pageSize }: DataTableProps<T>) {
  const [dataPromise, setDataPromise] = useState(() => dataFactory())
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null)
  const [retryKey, setRetryKey] = useState(crypto.randomUUID())

  const retry = useCallback(() => {
    setDataPromise(dataFactory())
    setRetryKey(crypto.randomUUID())
  }, [dataFactory])

  const toggleSort = useCallback(
    (key: keyof T) => {
      const column = columns.find((c) => c.key === key)
      // Abort if column not sortable
      if (!column?.sortable) return
      // Sort column : none or other column -> asc -> desc -> none
      if (!sortConfig || sortConfig.key !== key) {
        setSortConfig({ key, direction: 'asc' })
      } else if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' })
      } else if (sortConfig.direction === 'desc') {
        setSortConfig(null)
      }
    },
    [columns, sortConfig]
  )

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-zinc-300 dark:border-zinc-700">
          {columns.map((column) => (
            <th
              key={column.key as string}
              onClick={() => toggleSort(column.key)}
              className={`px-4 py-2 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300 ${column.sortable ? 'select-none cursor-pointer' : ''}`}
            >
              {column.header}
              {sortConfig && sortConfig.key === column.key ? (
                <span className="ml-1 text-xs">{getSortDirectionClue(sortConfig.direction)}</span>
              ) : (
                ''
              )}
            </th>
          ))}
        </tr>
      </thead>
      <ErrorBoundary
        key={retryKey}
        fallback={<DataTableError columnCount={columns.length} onRetry={retry} />}
      >
        <Suspense fallback={<DataTableSkeleton columns={columns} pageSize={pageSize} />}>
          <DataTableBody
            dataPromise={dataPromise}
            columns={columns}
            rowKey={rowKey}
            pageSize={pageSize}
            sortConfig={sortConfig}
          />
        </Suspense>
      </ErrorBoundary>
    </table>
  )
}
