'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// 跳转链接（Skip Link）
export function SkipLink({ targetId = 'main-content', label = '跳转到主要内容' }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-orange-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
    >
      {label}
    </a>
  )
}

// 无障碍标签包装器
interface A11yWrapperProps {
  children: ReactNode
  label: string
  describedBy?: string
  role?: string
}

export function A11yWrapper({ children, label, describedBy, role }: A11yWrapperProps) {
  return (
    <div
      role={role}
      aria-label={label}
      aria-describedby={describedBy}
    >
      {children}
    </div>
  )
}

// 无障碍按钮
interface A11yButtonProps {
  children: ReactNode
  onClick: () => void
  label: string
  disabled?: boolean
  pressed?: boolean
  expanded?: boolean
  className?: string
}

export function A11yButton({
  children,
  onClick,
  label,
  disabled = false,
  pressed,
  expanded,
  className = '',
}: A11yButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

// 无障碍对话框
interface A11yDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  describedBy?: string
}

export function A11yDialog({
  isOpen,
  onClose,
  title,
  children,
  describedBy,
}: A11yDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = 'dialog-title'

  useEffect(() => {
    if (isOpen) {
      // 焦点移到对话框
      dialogRef.current?.focus()
      // 禁止背景滚动
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-xl max-w-md w-full m-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="关闭对话框"
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// 屏幕阅读器专用文本
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// 实时区域（Live Region）
interface LiveRegionProps {
  children: ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  )
}

// 焦点陷阱
interface FocusTrapProps {
  children: ReactNode
  active: boolean
}

export function FocusTrap({ children, active }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return <div ref={containerRef}>{children}</div>
}

// 键盘导航助手
export function useKeyboardNav(items: string[], onSelect: (item: string) => void) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setCurrentIndex(prev => (prev + 1) % items.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setCurrentIndex(prev => (prev - 1 + items.length) % items.length)
          break
        case 'Enter':
          e.preventDefault()
          onSelect(items[currentIndex])
          break
        case 'Escape':
          setCurrentIndex(0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, currentIndex, onSelect])

  return currentIndex
}

// 高对比度模式检测
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)')
    setIsHighContrast(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isHighContrast
}

// 减少动效模式检测
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}