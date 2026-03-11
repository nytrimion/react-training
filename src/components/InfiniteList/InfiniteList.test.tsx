import { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InfiniteList } from './InfiniteList'
import { PageFetcher } from './useInfiniteScroll'

type Item = { id: string; name: string }

// Mock IntersectionObserver — jsdom doesn't support it
let observerCallback: IntersectionObserverCallback
let observerDisconnect: jest.Mock

beforeEach(() => {
  observerDisconnect = jest.fn()
  global.IntersectionObserver = jest.fn((callback) => {
    observerCallback = callback
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: observerDisconnect,
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: jest.fn().mockReturnValue([]),
    }
  })
})

function triggerIntersection(isIntersecting: boolean) {
  observerCallback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
}

function mockFetchPage(
  pages: Item[][],
  options: { delay?: number; failOnPage?: number } = {}
): PageFetcher<Item> {
  const { delay = 0, failOnPage } = options

  return jest.fn(async (page: number) => {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay))
    if (failOnPage === page) throw new Error(`Network error on page ${page}`)

    const data = pages[page - 1] ?? []
    return { data, hasMore: page < pages.length }
  })
}

const page1: Item[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
]

const page2: Item[] = [
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
]

function renderList(fetchPage: PageFetcher<Item>) {
  return render(<InfiniteList<Item> fetchPage={fetchPage} renderItem={(item) => item.name} />)
}

describe('InfiniteList', () => {
  describe('initial render', () => {
    it('should render an empty list before intersection', () => {
      const fetchPage = mockFetchPage([page1])
      renderList(fetchPage)

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.queryAllByRole('listitem')).toHaveLength(1) // sentinel only
      expect(fetchPage).not.toHaveBeenCalled()
    })
  })

  describe('loading items', () => {
    it('should load and display first page when sentinel is visible', async () => {
      const fetchPage = mockFetchPage([page1])
      renderList(fetchPage)

      act(() => {
        triggerIntersection(true)
      })

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
      })
      expect(fetchPage).toHaveBeenCalledWith(1)
    })

    it('should show loading indicator while fetching', async () => {
      const fetchPage = mockFetchPage([page1], { delay: 100 })
      renderList(fetchPage)

      act(() => {
        triggerIntersection(true)
      })

      expect(await screen.findByText('Loading...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
    })

    it('should load multiple pages on successive intersections', async () => {
      const fetchPage = mockFetchPage([page1, page2])
      renderList(fetchPage)

      act(() => {
        triggerIntersection(true)
      })

      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument()
      })

      act(() => {
        triggerIntersection(true)
      })

      await waitFor(() => {
        expect(screen.getByText('Charlie')).toBeInTheDocument()
        expect(screen.getByText('Diana')).toBeInTheDocument()
      })
      expect(fetchPage).toHaveBeenCalledTimes(2)
      expect(fetchPage).toHaveBeenCalledWith(1)
      expect(fetchPage).toHaveBeenCalledWith(2)
    })

    it('should not fetch when sentinel is not intersecting', () => {
      const fetchPage = mockFetchPage([page1])
      renderList(fetchPage)

      triggerIntersection(false)

      expect(fetchPage).not.toHaveBeenCalled()
    })

    it('should stop fetching when all pages are loaded', async () => {
      const fetchPage = mockFetchPage([page1])
      renderList(fetchPage)

      act(() => {
        triggerIntersection(true)
      })

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
      })

      act(() => {
        triggerIntersection(true)
      })
      // Wait a tick to ensure no additional call
      await new Promise((r) => setTimeout(r, 0))
      expect(fetchPage).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should display error message when fetch fails', async () => {
      const fetchPage = mockFetchPage([], { failOnPage: 1 })
      renderList(fetchPage)

      act(() => {
        triggerIntersection(true)
      })

      await waitFor(() => {
        expect(screen.getByText(/Failed to load next items/)).toBeInTheDocument()
      })
    })

    it('should retry on button click after error', async () => {
      const user = userEvent.setup()
      const fetchPage = mockFetchPage([page1], { failOnPage: 1 })
      renderList(fetchPage)

      act(() => {
        triggerIntersection(true)
      })

      await waitFor(() => {
        expect(screen.getByText(/Failed to load next items/)).toBeInTheDocument()
      })

      // Fix the fetch for retry
      ;(fetchPage as jest.Mock).mockImplementation(async () => ({
        data: page1,
        hasMore: false,
      }))

      await user.click(screen.getByRole('button', { name: 'Retry' }))

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument()
      })
    })
  })

  describe('cleanup', () => {
    it('should disconnect observer on unmount', () => {
      const fetchPage = mockFetchPage([page1])
      const { unmount } = renderList(fetchPage)

      unmount()

      expect(observerDisconnect).toHaveBeenCalledTimes(1)
    })
  })
})
