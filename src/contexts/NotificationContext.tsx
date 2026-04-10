'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef } from 'react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number // ms, default 5000
}

interface NotificationState {
  notifications: Notification[]
}

type NotificationAction =
  | { type: 'ADD'; payload: Notification }
  | { type: 'REMOVE'; payload: string }

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'ADD':
      return {
        notifications: [...state.notifications, action.payload],
      }
    case 'REMOVE':
      return {
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      }
    default:
      action satisfies never
      return state
  }
}

interface NotificationDispatchContextType {
  addNotification: (type: NotificationType, message: string, duration?: number) => void
  removeNotification: (id: string) => void
}

const NotificationDispatchContext = createContext<NotificationDispatchContextType | null>(null)
const NotificationStateContext = createContext<NotificationState | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] })
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const commands = useMemo(
    () => ({
      addNotification: (type: NotificationType, message: string, duration = 5000) => {
        const id = crypto.randomUUID()
        dispatch({ type: 'ADD', payload: { id, type, message, duration } })

        const timerId = setTimeout(() => {
          dispatch({ type: 'REMOVE', payload: id })
          timers.current.delete(id)
        }, duration)
        timers.current.set(id, timerId)
      },
      removeNotification: (id: string) => {
        const timerId = timers.current.get(id)
        if (timerId) {
          clearTimeout(timerId)
          timers.current.delete(id)
        }
        dispatch({ type: 'REMOVE', payload: id })
      },
    }),
    [dispatch]
  )

  useEffect(() => {
    const cleanupTimers = timers.current
    return () => {
      cleanupTimers.forEach((timerId) => clearTimeout(timerId))
    }
  }, [])

  return (
    <NotificationStateContext.Provider value={state}>
      <NotificationDispatchContext.Provider value={commands}>
        {children}
      </NotificationDispatchContext.Provider>
    </NotificationStateContext.Provider>
  )
}

export function useNotificationDispatch() {
  const context = useContext(NotificationDispatchContext)

  if (!context) {
    throw new Error('useNotificationDispatch must be used within NotificationProvider')
  }
  return context
}

export function useNotificationState() {
  const context = useContext(NotificationStateContext)

  if (!context) {
    throw new Error('useNotificationState must be used within NotificationProvider')
  }
  return context
}
