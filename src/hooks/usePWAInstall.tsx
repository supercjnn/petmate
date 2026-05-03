'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // 检查是否已安装
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    
    // 检查是否支持PWA
    if (!('serviceWorker' in navigator)) {
      return
    }
    
    // 监听安装提示
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }
    
    // 监听安装完成
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const promptInstall = async (): Promise<boolean> => {
    if (!installPrompt) return false
    
    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Install prompt error:', error)
      return false
    } finally {
      setInstallPrompt(null)
    }
  }
  
  return {
    isInstalled,
    isInstallable,
    promptInstall,
  }
}

export function PWAInstallButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()
  const [isClicked, setIsClicked] = useState(false)
  
  if (!isInstallable || isInstalled) return null
  
  const handleInstall = async () => {
    setIsClicked(true)
    const accepted = await promptInstall()
    if (!accepted) {
      setIsClicked(false)
    }
  }
  
  return (
    <button
      onClick={handleInstall}
      disabled={isClicked}
      className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {isClicked ? '安装中...' : '安装应用'}
    </button>
  )
}