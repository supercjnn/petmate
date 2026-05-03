'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconArrowLeft, IconUser, IconTrophy, IconCalendar, IconHeart, IconSettings } from '@/components/icons'
import { FadeIn, SlideIn, CountUp } from '@/components/animations'
import { getAllCats, getWeightRecords } from '@/lib/health-records'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [cats, setCats] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const userStr = localStorage.getItem('petmate-user-store')
    if (userStr) {
      try {
        const data = JSON.parse(userStr)
        setUser(data.state?.user || null)
      } catch {}
    }

    setCats(getAllCats())

    const achievementsStr = localStorage.getItem('petmate_achievements')
    if (achievementsStr) {
      try {
        setAchievements(JSON.parse(achievementsStr))
      } catch {}
    }

    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('petmate_user')
    localStorage.removeItem('petmate-user-store')
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
          <h1 className="font-bold">我的</h1>
          <button onClick={() => router.push('/settings')} className="p-2 -mr-2">
            <IconSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 用户信息卡片 */}
        <FadeIn>
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                {user?.avatar || '👤'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.name || '新晋铲屎官'}</h2>
                <p className="text-white/80 text-sm">
                  {user?.dayNumber ? `Day ${user.dayNumber}` : '刚开始'}
                </p>
              </div>
              <Badge variant="info" size="sm">
                Lv.{Math.floor((user?.dayNumber || 1) / 10) + 1}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold">{user?.dayNumber || 1}</p>
                <p className="text-xs text-white/70">天数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{cats.length}</p>
                <p className="text-xs text-white/70">猫咪</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-xs text-white/70">成就</p>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* 我的猫咪 */}
        <FadeIn delay={50}>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2">
                <IconHeart className="w-5 h-5 text-red-500" />
                我的猫咪
              </h3>
              <Button size="sm" variant="ghost" onClick={() => router.push('/health')}>
                管理
              </Button>
            </div>

            {cats.length > 0 ? (
              <div className="space-y-3">
                {cats.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-2xl">
                      {cat.avatar || '🐱'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-gray-500">
                        {cat.breed || '未知品种'}
                        {cat.gender && ` · ${cat.gender === 'male' ? '公' : '母'}`}
                      </p>
                    </div>
                    <IconArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">还没有添加猫咪</p>
                <Button size="sm" onClick={() => router.push('/health')}>
                  添加猫咪
                </Button>
              </div>
            )}
          </Card>
        </FadeIn>

        {/* 功能菜单 */}
        <FadeIn delay={100}>
          <Card>
            <div className="divide-y">
              <MenuItem
                icon={<IconTrophy className="w-5 h-5 text-yellow-500" />}
                title="成就系统"
                description={`已解锁 ${achievements.length} 个成就`}
                onClick={() => router.push('/achievements')}
              />
              <MenuItem
                icon={<IconCalendar className="w-5 h-5 text-blue-500" />}
                title="每日打卡"
                description="记录你的养猫日常"
                onClick={() => router.push('/diary')}
              />
              <MenuItem
                icon={<IconHeart className="w-5 h-5 text-red-500" />}
                title="健康档案"
                description="体重、疫苗、驱虫记录"
                onClick={() => router.push('/health')}
              />
              <MenuItem
                icon={<IconSettings className="w-5 h-5 text-gray-500" />}
                title="设置"
                description="账号、通知、数据管理"
                onClick={() => router.push('/settings')}
              />
            </div>
          </Card>
        </FadeIn>

        {/* 退出登录 */}
        <FadeIn delay={150}>
          <Button variant="ghost" fullWidth onClick={handleLogout}>
            <IconLogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </FadeIn>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  title,
  description,
  onClick
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full py-3 text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <IconArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
    </button>
  )
}

function IconLogOut({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}