'use client'

import { useState, useEffect } from 'react'

interface PerformanceMetrics {
  fps: number
  memory?: number
  loadTime: number
  renderTime?: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    loadTime: 0,
  })

  useEffect(() => {
    // 页面加载时间
    const loadTime = performance.now()
    setMetrics(prev => ({ ...prev, loadTime }))

    // FPS监控
    let lastTime = performance.now()
    let frames = 0

    const measureFPS = () => {
      frames++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, fps: frames }))
        frames = 0
        lastTime = now
      }
      requestAnimationFrame(measureFPS)
    }

    const rafId = requestAnimationFrame(measureFPS)

    return () => cancelAnimationFrame(rafId)
  }, [])

  return metrics
}

// 组件渲染时间测量
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const start = performance.now()
    return () => {
      const end = performance.now()
      console.log(`${componentName} render time: ${end - start}ms`)
    }
  })
}

// 网络请求性能
export function measureNetworkPerformance() {
  if (typeof window === 'undefined') return null

  const perfEntries = performance.getEntriesByType('resource')
  const apiCalls = perfEntries.filter(e => e.name.includes('/api/'))

  return apiCalls.map(call => ({
    url: call.name,
    duration: call.duration,
    size: (call as any).transferSize || 0,
  }))
}

// 性能报告组件
export function PerformanceReport() {
  const metrics = usePerformance()

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>FPS: {metrics.fps}</div>
      <div>Load: {Math.round(metrics.loadTime)}ms</div>
      {metrics.memory && <div>Memory: {Math.round(metrics.memory)}MB</div>}
    </div>
  )
}