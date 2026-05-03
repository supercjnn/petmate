'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { IconHome, IconDashboard, IconAI, IconUser, IconSettings, IconCat, IconCalendar, IconHeart } from '@/components/icons'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  hideNav?: boolean
}

export function AppLayout({ children, title, hideNav = false }: AppLayoutProps) {
  const pathname = usePathname()
  const [showSettings, setShowSettings] = useState(false)

  const navItems = [
    { href: '/dashboard', label: '今日', icon: IconHome },
    { href: '/health', label: '猫咪', icon: IconCat },
    { href: '/diary', label: '日记', icon: IconCalendar },
    { href: '/profile', label: '我的', icon: IconUser },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      {!hideNav && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <IconCat className="w-6 h-6 text-orange-500" />
              <span className="font-bold text-lg">宠伴</span>
            </Link>

            {/* 标题 */}
            {title && (
              <h1 className="text-base font-medium text-gray-900">{title}</h1>
            )}

            {/* 设置按钮 */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <IconSettings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>
      )}

      {/* 主内容 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* 底部导航 */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-around">
            {navItems.map(({ href, label, icon }) => {
              const active = isActive(href)
              const IconComponent = icon
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    active
                      ? 'text-orange-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${active ? 'text-orange-500' : ''}`} />
                  <span className="text-xs">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-80 max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold">设置</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Link href="/profile" className="block p-3 rounded-lg hover:bg-gray-50">
                个人设置
              </Link>
              <Link href="/notes" className="block p-3 rounded-lg hover:bg-gray-50">
                我的笔记
              </Link>
              <Link href="/achievements" className="block p-3 rounded-lg hover:bg-gray-50">
                成就系统
              </Link>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 text-center">
                  PetMate v1.9.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部间距（为底部导航留空间） */}
      {!hideNav && <div className="h-14" />}
    </div>
  )
}