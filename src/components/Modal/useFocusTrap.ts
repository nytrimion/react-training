import { RefObject, useEffect } from 'react'

const focusableSelectors = [
  'a[href]',
  'audio[controls]',
  'button',
  'details',
  'dialog',
  'embed',
  'iframe',
  'input',
  'object',
  'select',
  'summary',
  'textarea',
  'video[controls]',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
]
const focusableSelector = focusableSelectors.join(', ')

function getFocusableElements(container: HTMLElement) {
  const nodes = container.querySelectorAll<HTMLElement>(focusableSelector)

  return [...nodes].filter((element) => {
    if (element.tabIndex < 0) return false
    if (element.hidden) return false
    if (element.ariaDisabled === 'true') return false
    if (element.ariaHidden === 'true') return false
    if (element.hasAttribute('disabled')) return false
    return true
  })
}

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive) return
    const container = containerRef.current
    if (!container) return

    const initialFocus = document.activeElement

    getFocusableElements(container).at(0)?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (!(document.activeElement instanceof HTMLElement)) return

      const currentFocus = document.activeElement
      const focusable = getFocusableElements(container)
      const first = focusable.at(e.shiftKey ? -1 : 0)
      const last = focusable.at(e.shiftKey ? 0 : -1)

      if (currentFocus === last || !container.contains(currentFocus)) {
        e.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (initialFocus instanceof HTMLElement) {
        initialFocus.focus()
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, isActive])
}
