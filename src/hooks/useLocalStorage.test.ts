import { act } from 'react'
import { renderHook } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
  const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it.each([
    { type: 'string', initialValue: 'foo', stored: '"foo"' },
    { type: 'number', initialValue: 17.42, stored: '17.42' },
    { type: 'object', initialValue: { a: 'foo' }, stored: '{"a":"foo"}' },
    { type: 'array', initialValue: ['foo'], stored: '["foo"]' },
  ])('should initialize $type value and write to localStorage', ({ initialValue, stored }) => {
    mockGetItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('key', initialValue))

    expect(result.current[0]).toEqual(initialValue)
    expect(mockSetItem).toHaveBeenCalledWith('key', stored)
  })

  it.each([
    { type: 'string', initialValue: 'foo', stored: '"foo"' },
    { type: 'number', initialValue: 17.42, stored: '17.42' },
    { type: 'object', initialValue: { a: 'foo' }, stored: '{"a":"foo"}' },
    { type: 'array', initialValue: ['foo'], stored: '["foo"]' },
  ])(
    'should support lazy initialization of $type value and write to localStorage',
    ({ initialValue, stored }) => {
      mockGetItem.mockReturnValue(null)
      const init = jest.fn(() => initialValue)

      const { result } = renderHook(() => useLocalStorage('key', init))

      expect(init).toHaveBeenCalledTimes(1)
      expect(result.current[0]).toEqual(initialValue)
      expect(mockSetItem).toHaveBeenCalledWith('key', stored)
    }
  )

  it.each([
    { type: 'string', stored: '"foo"', expected: 'foo' },
    { type: 'number', stored: '17.42', expected: 17.42 },
    { type: 'object', stored: '{"a":"foo"}', expected: { a: 'foo' } },
    { type: 'array', stored: '["foo"]', expected: ['foo'] },
  ])('should parse $type value from localStorage', ({ stored, expected }) => {
    mockGetItem.mockReturnValue(stored)

    const { result } = renderHook(() => useLocalStorage('key', null))

    expect(result.current[0]).toEqual(expected)
    expect(mockGetItem).toHaveBeenCalledWith('key')
  })

  it('should fallback to initial value and log error when invalid JSON is fetched from localStorage', () => {
    const errorSpy = jest.spyOn(global.console, 'error').mockImplementation()

    mockGetItem.mockReturnValue('invalid json')

    const { result } = renderHook(() => useLocalStorage('key', 'fallback'))

    expect(result.current[0]).toEqual('fallback')
    expect(mockSetItem).toHaveBeenCalledWith('key', '"fallback"')
    expect(errorSpy).toHaveBeenCalledWith('Failed to read from local storage', expect.anything())
    errorSpy.mockRestore()
  })

  it('should fallback to initial value and log error when localStorage is unavailable', () => {
    const errorSpy = jest.spyOn(global.console, 'error').mockImplementation()
    const error = new Error('localStorage is not available')
    mockGetItem.mockImplementation(() => {
      throw error
    })

    const { result } = renderHook(() => useLocalStorage('key', 'fallback'))

    expect(result.current[0]).toEqual('fallback')
    expect(mockSetItem).toHaveBeenCalledWith('key', '"fallback"')
    expect(errorSpy).toHaveBeenCalledWith('Failed to read from local storage', error)
    errorSpy.mockRestore()
  })

  it('should handle setItem failure gracefully', () => {
    const errorSpy = jest.spyOn(global.console, 'error').mockImplementation()
    const error = new Error('localStorage is not available')
    mockSetItem.mockImplementation(() => {
      throw error
    })

    const { result } = renderHook(() => useLocalStorage('key', 'value'))

    expect(result.current[0]).toBe('value')
    expect(errorSpy).toHaveBeenCalledWith('Failed to write to local storage', error)
    errorSpy.mockRestore()
  })

  it.each([
    { type: 'string', initialValue: 'foo', newValue: 'bar' },
    { type: 'number', initialValue: 17.42, newValue: 23.42 },
    {
      type: 'object',
      initialValue: { a: 'foo' },
      newValue: { a: 'bar' },
    },
    { type: 'array', initialValue: ['foo'], newValue: ['bar'] },
  ])(
    'should update $type value in localStorage with direct value',
    ({ initialValue, newValue }) => {
      mockGetItem.mockReturnValue(null)

      const { result } = renderHook(() => useLocalStorage('key', initialValue))

      act(() => {
        result.current[1](newValue)
      })
      expect(result.current[0]).toEqual(newValue)
      expect(mockSetItem).toHaveBeenCalledWith('key', JSON.stringify(newValue))
    }
  )

  it('should update string value in localStorage with updater function', () => {
    mockGetItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('key', 'foo'))

    act(() => {
      result.current[1]((prev) => `${prev} bar`)
    })
    expect(result.current[0]).toEqual('foo bar')
    expect(mockSetItem).toHaveBeenCalledWith('key', '"foo bar"')
  })

  it('should update number value in localStorage with updater function', () => {
    mockGetItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('key', 17.42))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })
    expect(result.current[0]).toEqual(18.42)
    expect(mockSetItem).toHaveBeenCalledWith('key', '18.42')
  })

  it('should update object value in localStorage with updater function', () => {
    mockGetItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('key', { a: 'foo' }))

    act(() => {
      result.current[1]((prev) => ({ ...prev, b: 'bar' }))
    })
    expect(result.current[0]).toEqual({ a: 'foo', b: 'bar' })
    expect(mockSetItem).toHaveBeenCalledWith('key', '{"a":"foo","b":"bar"}')
  })

  it('should update array value in localStorage with updater function', () => {
    mockGetItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('key', ['foo']))

    act(() => {
      result.current[1]((prev) => [...prev, 'bar'])
    })
    expect(result.current[0]).toEqual(['foo', 'bar'])
    expect(mockSetItem).toHaveBeenCalledWith('key', '["foo","bar"]')
  })
})
