import { act } from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import {
  NotificationProvider,
  useNotificationDispatch,
  useNotificationState,
} from './NotificationContext'
import userEvent from '@testing-library/user-event'

describe('NotificationContext', () => {
  function renderNotificationHooks() {
    return renderHook(
      () => ({
        ...useNotificationDispatch(),
        ...useNotificationState(),
      }),
      { wrapper: NotificationProvider }
    )
  }

  describe('state', () => {
    it('initializes as empty', () => {
      const { result } = renderNotificationHooks()

      expect(result.current.notifications).toHaveLength(0)
    })

    it('adds notification with default duration', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('success', 'message')
      })

      expect(result.current.notifications[0]).toEqual(
        expect.objectContaining({ type: 'success', message: 'message', duration: 5000 })
      )
    })

    it('adds notification with custom duration', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('success', 'message', 1234)
      })

      expect(result.current.notifications[0]).toEqual(
        expect.objectContaining({ type: 'success', message: 'message', duration: 1234 })
      )
    })

    it.each<{ type: 'success' | 'error' | 'warning' | 'info' }>([
      { type: 'success' },
      { type: 'error' },
      { type: 'warning' },
      { type: 'info' },
    ])('propagates "$type" type to notification', ({ type }) => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification(type, 'message')
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0]).toEqual(
        expect.objectContaining({ type, message: 'message', duration: 5000 })
      )
      expect(result.current.notifications[0]?.id).toBeTruthy()
    })

    it('adds multiple notifications', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('success', 'foo', 1234)
        result.current.addNotification('info', 'bar', 5678)
      })

      expect(result.current.notifications).toHaveLength(2)
      expect(result.current.notifications[0]).toEqual(
        expect.objectContaining({ type: 'success', message: 'foo', duration: 1234 })
      )
      expect(result.current.notifications[1]).toEqual(
        expect.objectContaining({ type: 'info', message: 'bar', duration: 5678 })
      )
    })

    it('removes notification', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('success', 'message')
      })
      expect(result.current.notifications).toHaveLength(1)

      act(() => {
        result.current.removeNotification(result.current.notifications[0]!.id)
      })
      expect(result.current.notifications).toHaveLength(0)
    })

    it('ignores removal of non-existent notification', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('success', 'message')
        result.current.removeNotification('whatever')
      })
      expect(result.current.notifications).toHaveLength(1)
    })
  })

  describe('timers handling', () => {
    jest.useFakeTimers()

    afterAll(() => {
      jest.useRealTimers()
    })

    it('removes notification after default delay', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('info', 'message')
      })
      expect(result.current.notifications).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(5000)
      })
      expect(result.current.notifications).toHaveLength(0)
    })

    it('removes notification after custom delay', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('info', 'message', 2000)
      })
      expect(result.current.notifications).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(result.current.notifications).toHaveLength(0)
    })

    it('removes expired notification only', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('info', 'message', 2000)
        result.current.addNotification('info', 'message', 5000)
      })
      expect(result.current.notifications).toHaveLength(2)

      act(() => {
        jest.advanceTimersByTime(2000)
      })
      expect(result.current.notifications).toHaveLength(1)
    })

    it('cancels timer when notification is manually removed', () => {
      const { result } = renderNotificationHooks()

      act(() => {
        result.current.addNotification('info', 'message')
      })
      expect(jest.getTimerCount()).toBe(1)

      act(() => {
        result.current.removeNotification(result.current.notifications[0]!.id)
      })
      expect(jest.getTimerCount()).toBe(0)
    })
  })

  describe('rendering', () => {
    function DispatchConsumer({ onRender }: { onRender: () => void }) {
      const { addNotification } = useNotificationDispatch()
      onRender()

      const handleAdd = () => addNotification('info', 'message')

      return (
        <button type="button" onClick={handleAdd}>
          Add
        </button>
      )
    }

    function StateConsumer({ onRender }: { onRender: () => void }) {
      const { notifications } = useNotificationState()
      onRender()

      return (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>{notification.message}</li>
          ))}
        </ul>
      )
    }

    function renderConsumers() {
      const onDispatchRender = jest.fn()
      const onStateRender = jest.fn()

      render(
        <NotificationProvider>
          <DispatchConsumer onRender={onDispatchRender} />
          <StateConsumer onRender={onStateRender} />
        </NotificationProvider>
      )

      return {
        onDispatchRender,
        onStateRender,
      }
    }

    it('re-renders only the state consumer when notification is added', async () => {
      const user = userEvent.setup()
      const { onDispatchRender, onStateRender } = renderConsumers()

      expect(onDispatchRender).toHaveBeenCalledTimes(1)
      expect(onStateRender).toHaveBeenCalledTimes(1)

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Add' }))
      })

      expect(onDispatchRender).toHaveBeenCalledTimes(1)
      expect(onStateRender).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('throws an error when notification dispatch context is used outside of provider', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => renderHook(() => useNotificationDispatch())).toThrow(
        'useNotificationDispatch must be used within NotificationProvider'
      )
      errorSpy.mockRestore()
    })

    it('throws an error when notification state context is used outside of provider', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => renderHook(() => useNotificationState())).toThrow(
        'useNotificationState must be used within NotificationProvider'
      )
      errorSpy.mockRestore()
    })
  })
})
