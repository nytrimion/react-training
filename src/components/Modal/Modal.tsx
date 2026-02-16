import { MouseEvent, ReactNode, useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from './useFocusTrap'
import { useScrollLock } from './useScrollLock'

const subscribe = () => () => {}

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const backdrop = useRef<HTMLDivElement>(null)

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (e.target === e.currentTarget) return onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
    }
    window?.addEventListener('keydown', handleKeyDown)

    return () => window?.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useFocusTrap(backdrop, isOpen)
  useScrollLock(isOpen)

  if (!useIsClient() || !isOpen) {
    return null
  }

  return createPortal(
    <div
      ref={backdrop}
      className="flex items-center justify-center fixed left-0 bottom-0 w-full h-full bg-gray-800/50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        className="bg-white rounded-lg w-1/2"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex flex-col items-start p-4">
          <div className="flex justify-between w-full mb-4">
            <div id="modal-title" className="text-2xl font-bold tracking-tight text-heading">
              {title}
            </div>
            <button
              onClick={onClose}
              className="text-2xl font-bold cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="mb-6 w-full font-normal">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
