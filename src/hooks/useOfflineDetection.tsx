'use client'

import { useState, useEffect } from 'react'

interface OfflineState {
  isOnline: boolean
  isOffline: boolean
}

export function useOfflineDetection(): OfflineState {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }
    
    // 初始状态
    setIsOnline(navigator.onLine)
    
    // 监听网络状态变化
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])
  
  return {
    isOnline,
    isOffline: !isOnline,
  }
}

export function OfflineIndicator() {
  const { isOffline } = useOfflineDetection()
  
  if (!isOffline) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm z-50">
      当前处于离线状态，部分功能可能不可用
    </div>
  )
}