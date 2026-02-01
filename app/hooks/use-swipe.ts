import { useCallback, useRef } from 'react'

type SwipeHandlers = {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

type SwipeOptions = {
  threshold?: number // minimum distance to trigger swipe (default: 50px)
  allowedTime?: number // maximum time for swipe gesture (default: 300ms)
}

type TouchHandlers = {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export function useSwipe(handlers: SwipeHandlers, options: SwipeOptions = {}): TouchHandlers {
  const { threshold = 50, allowedTime = 300 } = options

  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchStartTime.current = Date.now()
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX.current
      const deltaY = touch.clientY - touchStartY.current
      const elapsedTime = Date.now() - touchStartTime.current

      // Check if it's a valid horizontal swipe
      // - Must be within time limit
      // - Horizontal distance must exceed threshold
      // - Horizontal distance must be greater than vertical (to avoid triggering on scroll)
      if (elapsedTime <= allowedTime && Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight()
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft()
        }
      }
    },
    [handlers, threshold, allowedTime],
  )

  return { onTouchStart, onTouchEnd }
}
