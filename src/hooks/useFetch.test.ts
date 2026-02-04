import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from '@/hooks/useFetch'
import { act } from 'react'

describe('useFetch', () => {
  function mockFetch(
    data: unknown,
    options: { delay?: number; status?: number; error?: Error } = {}
  ) {
    const { delay = 0, status = 200, error } = options

    return jest.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) =>
          setTimeout(() => {
            if (error) {
              return reject(error)
            }
            const ok = status >= 200 && status < 300
            resolve({
              ok,
              status,
              statusText: ok ? 'OK' : 'Error',
              json: () => Promise.resolve(data),
            })
          }, delay)
        )
    )
  }

  const originalFetch = global.fetch
  const originalAbortController = global.AbortController

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    global.AbortController = originalAbortController
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('should initialize with expected state', () => {
    global.fetch = mockFetch(null)

    const { result } = renderHook(() => useFetch('/url'))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it.each([
    { type: 'string', value: 'foo' },
    { type: 'number', value: 17.42 },
    { type: 'object', value: { a: 'foo' } },
    { type: 'array', value: ['foo'] },
  ])('should return $type data when fetch succeeds', async ({ value }) => {
    global.fetch = mockFetch(value, { delay: 50 })

    const { result } = renderHook(() => useFetch('/url'))

    await waitFor(() => {
      expect(result.current.data).toEqual(value)
      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  it.each([{ status: 301 }, { status: 404 }, { status: 500 }])(
    'should return error when fetch fails with response status $status',
    async ({ status }) => {
      global.fetch = mockFetch(null, { delay: 50, status })

      const { result } = renderHook(() => useFetch('/url'))

      await waitFor(() => {
        expect(result.current.data).toBeNull()
        expect(result.current.error?.message).toBe(`HTTP ${status}: Error`)
        expect(result.current.loading).toBe(false)
      })
    }
  )

  it('should return error when fetch fails with internal error', async () => {
    global.fetch = mockFetch(null, { error: new Error('Timeout') })

    const { result } = renderHook(() => useFetch('/url'))

    await waitFor(() => {
      expect(result.current.data).toBeNull()
      expect(result.current.error?.message).toBe('Timeout')
      expect(result.current.loading).toBe(false)
    })
  })

  it('should cancel fetch when component is unmounted', async () => {
    const abortSpy = jest.fn()
    const abortSignal = {}

    global.AbortController = jest.fn().mockImplementation(() => ({
      signal: abortSignal,
      abort: abortSpy,
    }))
    global.fetch = mockFetch(null, { delay: 100 })

    const { unmount } = renderHook(() => useFetch('/url'))

    expect(global.fetch).toHaveBeenCalledWith('/url', {
      signal: abortSignal,
    })
    expect(abortSpy).not.toHaveBeenCalled()
    unmount()
    expect(abortSpy).toHaveBeenCalledTimes(1)
  })

  it('should support race conditions', async () => {
    global.fetch = mockFetch('long', { delay: 100 })

    const { rerender, result } = renderHook(({ url }) => useFetch(url), {
      initialProps: { url: '/long' },
    })

    global.fetch = mockFetch('short', { delay: 0 })

    rerender({ url: '/short' })

    expect(result.current.loading).toBe(true)
    await waitFor(() => {
      expect(result.current.data).not.toBe('long')
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBe('short')
  })

  it('should refetch when refetch is called', async () => {
    global.fetch = mockFetch('initial')

    const { result } = renderHook(() => useFetch('/url'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBe('initial')

    global.fetch = mockFetch('refreshed')

    act(() => result.current.refetch())

    expect(result.current.loading).toBe(true)
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBe('refreshed')
  })
})
