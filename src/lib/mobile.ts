/**
 * 移动端适配工具
 */

// 触摸事件检测
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// 移动设备检测
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// iOS检测
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// 安卓检测
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

// 安全区域获取
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const computedStyle = getComputedStyle(document.documentElement)
  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
  }
}

// 视口高度修正（iOS Safari 100vh问题）
export function setViewportHeight() {
  if (typeof window === 'undefined') return

  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// 防止橡皮筋效果
export function preventOverscroll(element: HTMLElement) {
  element.addEventListener('touchstart', (e) => {
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight

    if (scrollTop === 0 && scrollHeight > clientHeight) {
      element.scrollTop = 1
    } else if (scrollTop + clientHeight === scrollHeight) {
      element.scrollTop = scrollTop - 1
    }
  }, { passive: true })
}

// 触摸反馈
export function addTouchFeedback(element: HTMLElement) {
  element.addEventListener('touchstart', () => {
    element.style.opacity = '0.7'
  }, { passive: true })

  element.addEventListener('touchend', () => {
    element.style.opacity = '1'
  }, { passive: true })

  element.addEventListener('touchcancel', () => {
    element.style.opacity = '1'
  }, { passive: true })
}

// 滑动检测
export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function detectSwipe(element: HTMLElement, handlers: SwipeHandlers, threshold = 50) {
  let startX = 0
  let startY = 0

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }, { passive: true })

  element.addEventListener('touchend', (e) => {
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
  }, { passive: true })
}