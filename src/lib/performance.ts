/**
 * 性能优化工具
 */

// 预加载关键资源
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return
  
  const criticalResources = [
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
  ]
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.type) link.type = resource.type
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// 预连接外部域名
export function preconnectOrigins(): void {
  if (typeof window === 'undefined') return
  
  const origins = [
    'https://hunyuan.tencent.com',
    'https://cdn.jsdelivr.net',
  ]
  
  origins.forEach(origin => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
    
    // DNS预解析
    const dnsLink = document.createElement('link')
    dnsLink.rel = 'dns-prefetch'
    dnsLink.href = origin
    document.head.appendChild(dnsLink)
  })
}

// 节流函数
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

// 防抖函数
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

// 请求Idle回调polyfill
export function requestIdleCallback(callback: () => void): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 1)
  }
}

// 检测慢连接
export function detectSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false
  
  const connection = (navigator as any).connection
  if (!connection) return false
  
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData === true
  )
}

// 获取连接类型
export function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  
  const connection = (navigator as any).connection
  return connection?.effectiveType || 'unknown'
}

// 性能指标收集
export function collectPerformanceMetrics(): {
  fcp: number
  lcp: number
  fid: number
  cls: number
  ttfb: number
} {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0 }
  }
  
  const paintEntries = performance.getEntriesByType('paint')
  const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
  
  // TTFB
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const ttfb = navEntry?.responseStart || 0
  
  // 其他指标需要通过PerformanceObserver收集
  return { fcp, lcp: 0, fid: 0, cls: 0, ttfb }
}

// 代码分割辅助
export function lazyWithPreload<T extends () => Promise<any>>(
  importFn: T
): T & { preload: () => Promise<void> } {
  const preload = async () => {
    await importFn()
  }
  
  return Object.assign(importFn, { preload }) as T & { preload: () => Promise<void> }
}

// 批量DOM更新
export function batchUpdate(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}