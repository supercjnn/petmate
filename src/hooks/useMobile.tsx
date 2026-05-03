'use client'

import { useState, useEffect } from 'react'
import { isMobileDevice, isIOS, isAndroid, isTouchDevice } from '@/lib/mobile'

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTouch: false,
  })

  useEffect(() => {
    setDeviceInfo({
      isMobile: isMobileDevice(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isTouch: isTouchDevice(),
    })
  }, [])

  return deviceInfo
}

// 视口尺寸Hook
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isLandscape: false,
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isLandscape: window.innerWidth > window.innerHeight,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return viewport
}

// 网络状态Hook
export function useNetworkStatus() {
  const [status, setStatus] = useState({
    isOnline: true,
    effectiveType: '4g' as string,
    downlink: 10,
  })

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as any).connection
      setStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
      })
    }

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  return status
}

// 滑动手势Hook
export function useSwipeGesture(
  ref: React.RefObject<HTMLElement>,
  handlers: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
  },
  threshold = 50
) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY

      const diffX = endX - startX
      const diffY = endY - startY

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold) {
          handlers.onSwipeRight?.()
        } else if (diffX < -threshold) {
          handlers.onSwipeLeft?.()
        }
      } else {
        if (diffY > threshold) {
          handlers.onSwipeDown?.()
        } else if (diffY < -threshold) {
          handlers.onSwipeUp?.()
        }
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, handlers, threshold])
}