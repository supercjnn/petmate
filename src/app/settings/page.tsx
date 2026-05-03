'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconArrowLeft, IconBell, IconUser, IconDownload, IconTrash, IconInfo, IconMoon, IconGlobe, IconShield, IconHelpCircle, IconMail } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import { checkNotificationPermission, requestNotificationPermission } from '@/lib/notifications'
import { getStorageStats, clearAllData } from '@/lib/data-export'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null)
  const [stats, setStats] = useState(getStorageStats())
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [language, setLanguage] = useState('zh-CN')

  useEffect(() => {
    const userStr = localStorage.getItem('petmate-user-store')
    if (userStr) {
      try {
        const data = JSON.parse(userStr)
        setUser(data.state?.user || null)
      } catch {}
    }
    setNotifPermission(checkNotificationPermission())
    setLoading(false)
  }, [])

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission()
    setNotifPermission(checkNotificationPermission())
  }

  const handleClearData = () => {
    clearAllData()
    setShowClearConfirm(false)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">设置</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 用户信息 */}
        {user && (
          <FadeIn>
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{user.name || '未设置昵称'}</p>
                  <p className="text-sm text-gray-500">{user.email || '游客模式'}</p>
                  {user.dayNumber && (
                    <Badge variant="info" size="sm" className="mt-1">Day {user.dayNumber}</Badge>
                  )}
                </div>
                <Button size="sm" variant="ghost">
                  编辑
                </Button>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* 通知设置 */}
        <FadeIn delay={50}>
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <IconBell className="w-5 h-5 text-blue-500" />
              通知设置
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">浏览器通知</p>
                  <p className="text-sm text-gray-500">接收健康提醒、里程碑通知</p>
                </div>
                <Badge variant={
                  notifPermission === 'granted' ? 'success' :
                  notifPermission === 'denied' ? 'error' :
                  'info'
                }>
                  {notifPermission === 'granted' ? '已开启' :
                   notifPermission === 'denied' ? '已拒绝' :
                   '未开启'}
                </Badge>
              </div>
              
              {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                <Button size="sm" onClick={handleRequestNotif}>
                  开启通知
                </Button>
              )}
              
              {notifPermission === 'denied' && (
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  请在浏览器设置中允许通知权限
                </p>
              )}
            </div>
          </Card>
        </FadeIn>

        {/* 外观设置 */}
        <FadeIn delay={100}>
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <IconMoon className="w-5 h-5 text-purple-500" />
              外观设置
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">主题</p>
                <div className="flex gap-2">
                  {[
                    { value: 'light', label: '浅色' },
                    { value: 'dark', label: '深色' },
                    { value: 'system', label: '跟随系统' }
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as any)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        theme === t.value ? 'bg-orange-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="font-medium">语言</p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="zh-TW">繁體中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* 数据管理 */}
        <FadeIn delay={150}>
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <IconDownload className="w-5 h-5 text-green-500" />
              数据管理
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">本地存储</p>
                  <p className="text-sm text-gray-500">{stats.totalKeys}种数据，共{stats.totalSize}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => router.push('/data')}>
                  管理
                </Button>
              </div>
              
              <Link href="/data" className="block">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconDownload className="w-4 h-4 text-blue-500" />
                    <p className="font-medium text-blue-700">导出数据</p>
                  </div>
                  <span className="text-blue-500">{'>'}</span>
                </div>
              </Link>
            </div>
          </Card>
        </FadeIn>

        {/* 关于 */}
        <FadeIn delay={200}>
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <IconInfo className="w-5 h-5 text-gray-500" />
              关于
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">版本</span>
                <span className="font-medium">2.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">构建时间</span>
                <span className="font-medium">2025-05-03</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t flex gap-3">
              <a href="https://github.com/supercjnn/petmate" target="_blank" className="flex-1">
                <Button variant="outline" fullWidth size="sm">
                  <IconHelpCircle className="w-4 h-4 mr-1" />
                  GitHub
                </Button>
              </a>
              <Button variant="outline" fullWidth size="sm">
                <IconMail className="w-4 h-4 mr-1" />
                反馈
              </Button>
            </div>
          </Card>
        </FadeIn>

        {/* 危险操作 */}
        <FadeIn delay={250}>
          <Card className="border border-red-100">
            <h3 className="font-bold mb-3 text-red-600 flex items-center gap-2">
              <IconTrash className="w-5 h-5" />
              危险操作
            </h3>
            
            <p className="text-sm text-gray-500 mb-3">
              以下操作不可恢复，请谨慎操作
            </p>
            
            <Button 
              variant="danger" 
              onClick={() => setShowClearConfirm(true)}
              size="sm"
            >
              清除所有数据
            </Button>
          </Card>
        </FadeIn>
      </div>

      {/* 清除确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <SlideIn direction="up">
            <Card className="w-full max-w-sm">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                  <IconTrash className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-lg">确认清除数据？</h3>
                <p className="text-gray-500 text-sm mt-2">
                  此操作将删除所有数据，且无法恢复
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowClearConfirm(false)} fullWidth>
                  取消
                </Button>
                <Button variant="danger" onClick={handleClearData} fullWidth>
                  确认清除
                </Button>
              </div>
            </Card>
          </SlideIn>
        </div>
      )}
    </div>
  )
}

function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const router = useRouter()
  return (
    <span onClick={() => router.push(href)} className={className}>
      {children}
    </span>
  )
}