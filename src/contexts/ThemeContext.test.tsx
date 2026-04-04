import { renderHook } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'
import { act } from 'react'

describe('ThemeContext', () => {
  const systemMediaQuery = '(prefers-color-scheme: dark)'

  const originalMatchMedia = global.matchMedia

  const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
  const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  afterAll(() => {
    global.matchMedia = originalMatchMedia
  })

  function renderThemeHook(options = {}) {
    return renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
      ...options,
    })
  }

  function mockMatchMedia({ matches = false }: Partial<{ matches: boolean }> = {}) {
    return jest.fn(
      (query: string): MediaQueryList => ({
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      })
    )
  }

  describe('initialization', () => {
    it.each([
      { systemPrefersDark: false, stored: '"light"', theme: 'light' },
      { systemPrefersDark: true, stored: '"dark"', theme: 'dark' },
    ])(
      'defaults to $theme theme and writes to localStorage when localStorage is empty and system prefers $theme',
      ({ systemPrefersDark, stored, theme }) => {
        mockGetItem.mockReturnValue(null)
        global.matchMedia = mockMatchMedia({ matches: systemPrefersDark })

        const { result } = renderThemeHook()

        expect(global.matchMedia).toHaveBeenCalledTimes(1)
        expect(global.matchMedia).toHaveBeenCalledWith(systemMediaQuery)
        expect(mockSetItem).toHaveBeenCalledWith('prefers-color-scheme', stored)
        expect(result.current.theme).toBe(theme)
        expect(document.documentElement.classList.contains('dark')).toBe(systemPrefersDark)
      }
    )

    it.each([
      { systemPrefersDark: false, stored: '"light"', theme: 'light' },
      { systemPrefersDark: true, stored: '"dark"', theme: 'dark' },
    ])(
      'defaults to $theme theme and writes to localStorage when localStorage is invalid and system prefers $theme',
      ({ systemPrefersDark, stored, theme }) => {
        mockGetItem.mockReturnValue('invalid')
        global.matchMedia = mockMatchMedia({ matches: systemPrefersDark })

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
        const { result } = renderThemeHook()
        errorSpy.mockRestore()

        expect(global.matchMedia).toHaveBeenCalledTimes(1)
        expect(global.matchMedia).toHaveBeenCalledWith(systemMediaQuery)
        expect(mockSetItem).toHaveBeenCalledWith('prefers-color-scheme', stored)
        expect(result.current.theme).toBe(theme)
        expect(document.documentElement.classList.contains('dark')).toBe(systemPrefersDark)
      }
    )

    it('defaults to light theme, ignores system preference and writes to localStorage when localStorage is unexpected', () => {
      mockGetItem.mockReturnValue('"unexpected"')

      const { result } = renderThemeHook()

      expect(global.matchMedia).not.toHaveBeenCalled()
      expect(mockSetItem).toHaveBeenCalledWith('prefers-color-scheme', '"light"')
      expect(result.current.theme).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it.each([
      { stored: '"light"', theme: 'light', hasDarkClass: false },
      { stored: '"dark"', theme: 'dark', hasDarkClass: true },
    ])(
      'applies $theme theme and ignores system preference when localStorage is $theme',
      ({ stored, theme, hasDarkClass }) => {
        mockGetItem.mockReturnValue(stored)

        const { result } = renderThemeHook()

        expect(global.matchMedia).not.toHaveBeenCalled()
        expect(result.current.theme).toBe(theme)
        expect(document.documentElement.classList.contains('dark')).toBe(hasDarkClass)
      }
    )
  })

  describe('toggle', () => {
    it.each([
      { stored: '"light"', updated: '"dark"', theme: 'dark', hasDarkClass: true },
      { stored: '"dark"', updated: '"light"', theme: 'light', hasDarkClass: false },
    ])(
      'toggles to $theme theme and writes to localStorage',
      async ({ stored, updated, theme, hasDarkClass }) => {
        mockGetItem.mockReturnValue(stored)

        const { result } = renderThemeHook()

        await act(async () => result.current.toggleTheme())

        expect(mockSetItem).toHaveBeenCalledWith('prefers-color-scheme', updated)
        expect(result.current.theme).toBe(theme)
        expect(document.documentElement.classList.contains('dark')).toBe(hasDarkClass)
      }
    )

    it.each([
      { stored: '"light"', theme: 'light', hasDarkClass: false },
      { stored: '"dark"', theme: 'dark', hasDarkClass: true },
    ])(
      'switches back to initial $theme theme and writes to localStorage when toggled twice',
      async ({ stored, theme, hasDarkClass }) => {
        mockGetItem.mockReturnValue(stored)

        const { result } = renderThemeHook()

        await act(async () => {
          result.current.toggleTheme()
        })
        await act(async () => {
          result.current.toggleTheme()
        })

        expect(mockSetItem).toHaveBeenLastCalledWith('prefers-color-scheme', stored)
        expect(result.current.theme).toBe(theme)
        expect(document.documentElement.classList.contains('dark')).toBe(hasDarkClass)
      }
    )
  })

  describe('error handling', () => {
    it('throws an error outside of provider', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => renderThemeHook({ wrapper: undefined })).toThrow(
        'useTheme must be used within ThemeProvider'
      )
      errorSpy.mockRestore()
    })
  })
})
