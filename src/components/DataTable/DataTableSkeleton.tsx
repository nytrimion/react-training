import { DataTableSkeletonProps } from '@/components/DataTable/types'

export function DataTableSkeleton<T>({ columns, pageSize }: DataTableSkeletonProps<T>) {
  return (
    <>
      <tbody className="animate-pulse opacity-50">
        {[...Array(pageSize).keys()].map((index) => (
          <tr
            key={`skeleton-${index}`}
            className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {columns.map((column) => (
              <td key={`skeleton-${index}-${String(column.key)}`} className="px-4 py-2">
                <div className="h-4 rounded bg-zinc-200 dark:bg-zinc-700"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot className="opacity-50">
        <tr>
          <td colSpan={columns.length} className="text-center">
            <button disabled={true}>Previous</button>
            <span>1 / ?</span>
            <button disabled={true}>Next</button>
          </td>
        </tr>
      </tfoot>
    </>
  )
}
