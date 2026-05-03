'use client'

import { type ReactNode, useEffect, useState } from 'react'

// ============ 淡入淡出 ============

interface FadeInProps {
  children: ReactNode
  duration?: number
  delay?: number
  className?: string
}

export function FadeIn({ children, duration = 300, delay = 0, className = '' }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ============ 滑动进入 ============

interface SlideInProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  delay?: number
  distance?: number
  className?: string
}

export function SlideIn({
  children,
  direction = 'up',
  duration = 300,
  delay = 0,
  distance = 20,
  className = '',
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return `translateY(${distance}px)`
        case 'down': return `translateY(-${distance}px)`
        case 'left': return `translateX(${distance}px)`
        case 'right': return `translateX(-${distance}px)`
      }
    }
    return 'translate(0)'
  }

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'ease-out',
      }}
    >
      {children}
    </div>
  )
}

// ============ 缩放 ============

interface ScaleInProps {
  children: ReactNode
  duration?: number
  delay?: number
  className?: string
}

export function ScaleIn({ children, duration = 300, delay = 0, className = '' }: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ============ 打字机效果 ============

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, currentIndex === 0 ? delay : speed)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, delay, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

// ============ 数字滚动 ============

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  delay?: number
  className?: string
}

export function CountUp({
  end,
  start = 0,
  duration = 1000,
  delay = 0,
  className = '',
}: CountUpProps) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp + delay
      const elapsed = timestamp - startTime

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = start + (end - start) * easeOutQuart

      setCount(Math.round(current))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [start, end, duration, delay])

  return <span className={className}>{count}</span>
}

// ============ 进度条动画 ============

interface AnimatedProgressProps {
  value: number
  max?: number
  duration?: number
  className?: string
  barClassName?: string
}

export function AnimatedProgress({
  value,
  max = 100,
  duration = 500,
  className = '',
  barClassName = '',
}: AnimatedProgressProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth((value / max) * 100)
    }, 100)
    return () => clearTimeout(timer)
  }, [value, max])

  return (
    <div className={`bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`bg-orange-500 h-full rounded-full transition-all ${barClassName}`}
        style={{
          width: `${width}%`,
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'ease-out',
        }}
      />
    </div>
  )
}

// ============ 脉冲效果 ============

interface PulseProps {
  children: ReactNode
  className?: string
}

export function Pulse({ children, className = '' }: PulseProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  )
}

// ============ 弹跳效果 ============

interface BounceProps {
  children: ReactNode
  className?: string
}

export function Bounce({ children, className = '' }: BounceProps) {
  return (
    <div
      className={`animate-bounce ${className}`}
      style={{
        animation: 'bounce 1s infinite',
      }}
    >
      {children}
    </div>
  )
}

// ============ 摇晃效果 ============

interface ShakeProps {
  children: ReactNode
  trigger?: boolean
  className?: string
}

export function Shake({ children, trigger, className = '' }: ShakeProps) {
  return (
    <div
      className={className}
      style={{
        animation: trigger ? 'shake 0.5s ease-in-out' : undefined,
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}