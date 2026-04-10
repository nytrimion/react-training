'use client'

import { useNotificationState } from '@/contexts/NotificationContext'
import { NotificationToast } from './NotificationToast'

export function NotificationContainer() {
  const { notifications } = useNotificationState()

  if (notifications.length === 0) return null

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-50 flex w-80 flex-col gap-2">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
        />
      ))}
    </div>
  )
}
