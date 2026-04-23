'use client'

import { useNotificationDispatch } from '@/contexts/NotificationContext'

interface NotificationToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const ICON_MAP = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
} as const

const STYLE_MAP = {
  success: 'bg-green-100 border-green-500 text-green-800',
  error: 'bg-red-100 border-red-500 text-red-800',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  info: 'bg-blue-100 border-blue-500 text-blue-800',
} as const

export function NotificationToast({ id, type, message }: NotificationToastProps) {
  const { removeNotification } = useNotificationDispatch()

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded border-l-4 px-4 py-3 shadow-md ${STYLE_MAP[type]}`}
    >
      <span className="text-lg">{ICON_MAP[type]}</span>
      <p className="flex-1 text-sm">{message}</p>
      <button
        type="button"
        onClick={() => removeNotification(id)}
        className="opacity-60 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}
