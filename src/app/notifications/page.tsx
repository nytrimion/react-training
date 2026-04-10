'use client'

import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationContainer } from '@/components/NotificationContainer'
import { useNotificationDispatch } from '@/contexts/NotificationContext'

function NotificationButtons() {
  const { addNotification } = useNotificationDispatch()

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => addNotification('success', 'Operation completed successfully!')}
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Success
      </button>
      <button
        type="button"
        onClick={() => addNotification('error', 'Something went wrong.', 8000)}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Error (8s)
      </button>
      <button
        type="button"
        onClick={() => addNotification('warning', 'Please check your input.')}
        className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
      >
        Warning
      </button>
      <button
        type="button"
        onClick={() => addNotification('info', 'New update available.', 3000)}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Info (3s)
      </button>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <NotificationProvider>
      <NotificationContainer />
      <div className="flex min-h-screen items-center justify-center">
        <main className="flex flex-col items-center gap-8 p-16">
          <h1 className="text-2xl font-bold">Notifications Demo</h1>
          <p className="text-gray-500">Click a button to trigger a toast notification.</p>
          <NotificationButtons />
        </main>
      </div>
    </NotificationProvider>
  )
}
