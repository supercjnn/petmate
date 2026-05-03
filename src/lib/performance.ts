/**
 * 性能优化工具
 */

// ============ 懒加载工具 ============

/**
 * 动态导入组件，带加载状态
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean
    loading?: React.ComponentType
  }
) {
  return require('next/dynamic').default(importFn, {
    ssr: options?.ssr ?? false,
    loading: options?.loading || (() => null),
  })
}

// ============ 图片优化 ============

/**
 * 获取优化后的图片URL
 */
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality: number = 75
): string {
  // 如果是本地图片，使用Next.js Image组件自动优化
  if (src.startsWith('/') || src.startsWith('.')) {
    return src
  }

  // 如果是外部图片，返回原URL（需要配置remotePatterns）
  return src
}

/**
 * 图片占位符生成
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f0fdf4')
    gradient.addColorStop(1, '#dcfce7')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  return canvas.toDataURL('image/jpeg', 0.1)
}

// ============ 缓存工具 ============

/**
 * 内存缓存
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>()
  private defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl || this.defaultTTL),
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// 全局API缓存实例
export const apiCache = new MemoryCache<any>(60 * 1000) // 1分钟

// ============ 防抖和节流 ============

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============ 性能监控 ============

/**
 * 性能指标收集
 */
export function collectPerformanceMetrics() {
  if (typeof window === 'undefined') return null

  const perf = window.performance
  if (!perf) return null

  const navigation = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return null

  return {
    // 页面加载时间
    loadTime: navigation.loadEventEnd - navigation.startTime,
    // DOM解析时间
    domParseTime: navigation.domContentLoadedEventEnd - navigation.startTime,
    // 首字节时间
    ttfb: navigation.responseStart - navigation.requestStart,
    // 资源加载时间
    resourceLoadTime: navigation.loadEventEnd - navigation.domContentLoadedEventEnd,
  }
}

/**
 * 发送性能指标到服务器
 */
export async function reportPerformanceMetrics(metrics: any) {
  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to report performance metrics:', error)
  }
}

// ============ 代码分割提示 ============

/**
 * 预加载路由组件
 */
export function prefetchRoute(route: string) {
  if (typeof window !== 'undefined') {
    import(/* webpackPrefetch: true */ `@/app${route}/page`)
      .catch(() => {
        // 路由可能不存在，忽略错误
      })
  }
}
