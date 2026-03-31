import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from './DataTable'
import { Column } from './types'

function renderDataTable<T extends { id: string }>({
  columns = [{ key: 'id', header: 'ID' }],
  rowKey = 'id',
  pageSize = 2,
}: Partial<{
  columns: Column<T>[]
  rowKey: keyof T
  pageSize: number
}> = {}) {
  const { promise, resolve, reject } = createDataPromise<T>()
  const dataFactory = jest.fn(() => promise)

  const { container } = render(
    <DataTable<T> dataFactory={dataFactory} columns={columns} rowKey={rowKey} pageSize={pageSize} />
  )

  return {
    resolve,
    reject,
    container,
  }
}

function createDataPromise<T>() {
  let resolve: (value: T[]) => void
  let reject: (reason: unknown) => void
  const promise = new Promise<T[]>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve!, reject: reject! }
}

describe('DataTable', () => {
  describe('headers', () => {
    it('displays column headers', async () => {
      const columns: Column<{ id: string; name: string; birthday: Date }>[] = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'birthday', header: 'Birthday' },
      ]

      await act(async () => {
        renderDataTable({ columns })
      })

      expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Birthday' })).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('displays skeleton rows', async () => {
      const columns: Column<{ id: string; name: string; birthday: Date }>[] = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'birthday', header: 'Birthday' },
      ]
      let containerElement: HTMLElement = null!

      await act(async () => {
        const { container } = renderDataTable({ columns, pageSize: 10 })

        containerElement = container
      })

      const tbody = containerElement.querySelector('tbody')!
      expect(within(tbody).getAllByRole('row')).toHaveLength(10)
      expect(within(tbody).getAllByRole('cell')).toHaveLength(10 * 3)
    })

    it('displays disabled pagination', async () => {
      await act(async () => {
        renderDataTable()
      })

      const paginationCell = screen.getByRole('cell', { name: /1 \/ \?/ })
      expect(within(paginationCell).getByRole('button', { name: 'Previous' })).toBeDisabled()
      expect(within(paginationCell).getByRole('button', { name: 'Next' })).toBeDisabled()
    })
  })

  describe('data display', () => {
    it('displays pagination for empty data', async () => {
      await act(async () => {
        const { resolve } = renderDataTable()
        resolve([])
      })

      expect(screen.getAllByRole('cell')).toHaveLength(1)
      expect(screen.getByRole('cell', { name: /1 \/ 1/ })).toBeInTheDocument()
    })

    it('displays rows with cell values', async () => {
      const columns: Column<{ id: string; name: string }>[] = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
      ]

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: 10 })
        resolve([
          { id: '1', name: 'John' },
          { id: '2', name: 'Jane' },
        ])
      })

      const rows = screen.getAllByRole('row')
      expect(within(rows[1]!).getByRole('cell', { name: '1' })).toBeInTheDocument()
      expect(within(rows[1]!).getByRole('cell', { name: 'John' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: '2' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: 'Jane' })).toBeInTheDocument()
    })

    it('displays data with column rendering', async () => {
      const columns: Column<{ id: string; name: string; birthday: Date }>[] = [
        { key: 'id', header: 'ID' },
        {
          key: 'name',
          header: 'Name',
          render: (value) => (value as string).toUpperCase(),
        },
        {
          key: 'birthday',
          header: 'Birthday',
          render: (_, item) => item.birthday.getFullYear(),
        },
      ]

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: 10 })
        resolve([
          { id: '1', name: 'John', birthday: new Date('1978-11-17') },
          { id: '2', name: 'Jane', birthday: new Date('1985-12-08') },
        ])
      })

      expect(screen.getByRole('cell', { name: 'JOHN' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '1978' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: 'JANE' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '1985' })).toBeInTheDocument()
    })

    it('displays data with column alignment', async () => {
      const columns: Column<{ id: string; name: string; income: number; birthday: Date }>[] = [
        { key: 'id', header: 'ID', align: 'center' },
        { key: 'name', header: 'Name', align: 'left' },
        { key: 'income', header: 'Income', align: 'right' },
        { key: 'birthday', header: 'Birthday' },
      ]

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: 10 })
        resolve([{ id: '1', name: 'John', income: 76543, birthday: new Date('1978-11-17') }])
      })

      expect(screen.getByRole('cell', { name: '1' })).toHaveClass('text-center')
      expect(screen.getByRole('cell', { name: 'John' })).toHaveClass('text-left')
      expect(screen.getByRole('cell', { name: '76543' })).toHaveClass('text-right')
      expect(screen.getByRole('cell', { name: /1978/ })).toHaveClass('text-left')
    })
  })

  describe('pagination', () => {
    it('displays page count', async () => {
      await act(async () => {
        const { resolve } = renderDataTable()
        resolve([{ id: '1' }, { id: '2' }, { id: '3' }])
      })

      expect(screen.getByRole('cell', { name: /1 \/ 2/ })).toBeInTheDocument()
    })

    it('navigates to next page', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable()
        resolve([{ id: '1' }, { id: '2' }, { id: '3' }])
      })
      await user.click(screen.getByRole('button', { name: 'Next' }))

      expect(screen.queryByRole('cell', { name: '1' })).not.toBeInTheDocument()
      expect(screen.queryByRole('cell', { name: '2' })).not.toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '3' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /2 \/ 2/ })).toBeInTheDocument()
    })

    it('navigates to previous page', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable()
        resolve([{ id: '1' }, { id: '2' }, { id: '3' }])
      })
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await user.click(screen.getByRole('button', { name: 'Previous' }))

      expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument()
      expect(screen.queryByRole('cell', { name: '3' })).not.toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /1 \/ 2/ })).toBeInTheDocument()
    })

    it('disables previous button on first page', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable()
        resolve([{ id: '1' }, { id: '2' }, { id: '3' }])
      })
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Previous' }))
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    })

    it('disables next button on last page', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable()
        resolve([{ id: '1' }, { id: '2' }, { id: '3' }])
      })
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Previous' }))
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    })
  })

  describe('sorting', () => {
    const columns: Column<{ id: string; label: string }>[] = [
      { key: 'id', header: 'ID', sortable: true },
      { key: 'label', header: 'Label', sortable: true },
    ]
    const data = [
      { id: '1', label: 'A' },
      { id: '2', label: 'C' },
      { id: '3', label: 'B' },
    ]

    it('sorts ascending on first click', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: data.length })
        resolve(data)
      })
      await user.click(screen.getByRole('columnheader', { name: /Label/ }))

      expect(screen.getByRole('columnheader', { name: /Label/ })).toHaveTextContent('Label↓')

      const rows = screen.getAllByRole('row')
      expect(within(rows[1]!).getByRole('cell', { name: 'A' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: 'B' })).toBeInTheDocument()
      expect(within(rows[3]!).getByRole('cell', { name: 'C' })).toBeInTheDocument()
    })

    it('sorts descending on second click', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: data.length })
        resolve(data)
      })
      await user.click(screen.getByRole('columnheader', { name: /Label/ }))
      await user.click(screen.getByRole('columnheader', { name: /Label/ }))

      expect(screen.getByRole('columnheader', { name: /Label/ })).toHaveTextContent('Label↑')

      const rows = screen.getAllByRole('row')
      expect(within(rows[1]!).getByRole('cell', { name: 'C' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: 'B' })).toBeInTheDocument()
      expect(within(rows[3]!).getByRole('cell', { name: 'A' })).toBeInTheDocument()
    })

    it('resets sorting on third click', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: data.length })
        resolve(data)
      })
      await user.click(screen.getByRole('columnheader', { name: /Label/ }))
      await user.click(screen.getByRole('columnheader', { name: /Label/ }))
      await user.click(screen.getByRole('columnheader', { name: /Label/ }))

      expect(screen.getByRole('columnheader', { name: /Label/ })).toHaveTextContent(/^Label$/)

      const rows = screen.getAllByRole('row')
      expect(within(rows[1]!).getByRole('cell', { name: 'A' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: 'C' })).toBeInTheDocument()
      expect(within(rows[3]!).getByRole('cell', { name: 'B' })).toBeInTheDocument()
    })

    it('switches sorted column', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable({ columns, pageSize: data.length })
        resolve(data)
      })
      await user.click(screen.getByRole('columnheader', { name: /ID/ }))

      expect(screen.getByRole('columnheader', { name: /ID/ })).toHaveTextContent('ID↓')

      await user.click(screen.getByRole('columnheader', { name: /Label/ }))

      expect(screen.getByRole('columnheader', { name: /ID/ })).toHaveTextContent('ID')
      expect(screen.getByRole('columnheader', { name: /Label/ })).toHaveTextContent('Label↓')

      const rows = screen.getAllByRole('row')
      expect(within(rows[1]!).getByRole('cell', { name: 'A' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: 'B' })).toBeInTheDocument()
      expect(within(rows[3]!).getByRole('cell', { name: 'C' })).toBeInTheDocument()
    })

    it('ignores unsortable column click', async () => {
      const user = userEvent.setup()
      // Both columns are non-sortable
      const columns: Column<{ id: string; label: string }>[] = [
        { key: 'id', header: 'ID' },
        { key: 'label', header: 'Label', sortable: false },
      ]

      await act(async () => {
        const { resolve } = renderDataTable({ columns })
        resolve([
          { id: '1', label: 'B' },
          { id: '2', label: 'A' },
        ])
      })
      await user.click(screen.getByRole('columnheader', { name: /ID/ }))

      expect(screen.getByRole('columnheader', { name: /ID/ })).toHaveTextContent('ID')

      await user.click(screen.getByRole('columnheader', { name: /Label/ }))

      expect(screen.getByRole('columnheader', { name: /Label/ })).toHaveTextContent('Label')

      const rows = screen.getAllByRole('row')
      expect(within(rows[1]!).getByRole('cell', { name: 'B' })).toBeInTheDocument()
      expect(within(rows[2]!).getByRole('cell', { name: 'A' })).toBeInTheDocument()
    })

    it('resets pagination on sort change', async () => {
      const user = userEvent.setup()

      await act(async () => {
        const { resolve } = renderDataTable({ columns })
        resolve(data)
      })
      await user.click(screen.getByRole('button', { name: 'Next' }))

      expect(screen.getByRole('cell', { name: /2 \/ 2/ })).toBeInTheDocument()

      await user.click(screen.getByRole('columnheader', { name: /ID/ }))

      expect(screen.getByRole('cell', { name: /1 \/ 2/ })).toBeInTheDocument()
    })
  })

  describe('default values', () => {
    it('applies default page size', async () => {
      const data = Array.from({ length: 25 }, (_, i) => ({ id: `${i}` }))
      const { promise, resolve } = createDataPromise<{ id: string }>()

      await act(async () => {
        resolve(data)
        render(
          <DataTable
            dataFactory={() => promise}
            columns={[{ key: 'id', header: 'ID' }]}
            rowKey="id"
          />
        )
      })

      // defaultPageSize = 20 → 25 items = 2 pages
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('displays error message', async () => {
      await act(async () => {
        const { reject } = renderDataTable()
        reject(new Error('Unexpected error'))
      })

      expect(screen.getByRole('cell', { name: /An unexpected error occurred/ })).toBeInTheDocument()
    })

    it('retries and loads data', async () => {
      const user = userEvent.setup()
      const firstPromise = createDataPromise<{ id: string }>()
      const secondPromise = createDataPromise<{ id: string }>()
      const dataFactory = jest
        .fn()
        .mockReturnValueOnce(firstPromise.promise)
        .mockReturnValueOnce(secondPromise.promise)

      await act(async () => {
        render(
          <DataTable<{ id: string }>
            dataFactory={dataFactory}
            columns={[{ key: 'id', header: 'ID' }]}
            rowKey="id"
            pageSize={2}
          />
        )
        firstPromise.reject(new Error('Unexpected error'))
      })

      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Try again' }))
        secondPromise.resolve([{ id: '1' }])
      })

      expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument()
      expect(dataFactory).toHaveBeenCalledTimes(2)
    })
  })
})
