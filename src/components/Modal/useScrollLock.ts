import { useEffect } from 'react'

export function useScrollLock(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return

    const initialBodyOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = initialBodyOverflow
    }
  }, [isActive])
}
