'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Progress, Spinner } from '@/components/ui'
import { IconTrophy, IconStar, IconHeart, IconCalendar, IconCat } from '@/components/icons'
import { FadeIn, SlideIn, CountUp, AnimatedProgress } from '@/components/animations'
import { 
  ACHIEVEMENTS, 
  calculateUserLevel, 
  calculateTotalPoints,
  UserStats,
  AchievementDefinition
} from '@/lib/achievements'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [levelInfo, setLevelInfo] = useState<{ level: number; title: string; nextLevel: number } | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem('petmate_user')
    if (userData) {
      const saved = JSON.parse(userData)
      const userStats: UserStats = {
        daysCompleted: saved.dayNumber || 0,
        actionsCompleted: saved.actionsCompleted || 0,
        notesCount: saved.notes?.length || 0,
        aiCallsCount: saved.aiCallsCount || 0,
        sharesCount: saved.sharesCount || 0,
        streakDays: saved.streakDays || 0,
        unlockedAchievements: saved.achievements || ['first_day']
      }
      setStats(userStats)
      
      const points = calculateTotalPoints(userStats.unlockedAchievements)
      setTotalPoints(points)
      
      const level = calculateUserLevel(points)
      setLevelInfo(level)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <AppLayout title="个人中心">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  const unlockedAchievements = ACHIEVEMENTS.filter(a => 
    stats?.unlockedAchievements.includes(a.id)
  )

  const inProgressAchievements = ACHIEVEMENTS.filter(a => 
    !stats?.unlockedAchievements.includes(a.id) && !a.hidden
  ).slice(0, 5)

  const getProgress = (achievement: AchievementDefinition) => {
    if (!stats) return { current: 0, target: achievement.condition.threshold, percentage: 0 }
    
    const { type, threshold } = achievement.condition
    let current = 0
    switch (type) {
      case 'days': current = stats.daysCompleted; break
      case 'notes': current = stats.notesCount; break
      case 'ai_calls': current = stats.aiCallsCount; break
      case 'shares': current = stats.sharesCount; break
      case 'streak': current = stats.streakDays; break
    }
    
    return {
      current,
      target: threshold,
      percentage: Math.min(100, Math.round((current / threshold) * 100))
    }
  }

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  }

  return (
    <AppLayout title="个人中心">
      <FadeIn>
        {/* 用户卡片 */}
        <SlideIn direction="up">
          <Card className={`bg-gradient-to-r ${rarityColors[(levelInfo?.level || 1) >= 5 ? 'legendary' : (levelInfo?.level || 1) >= 3 ? 'epic' : 'rare']} text-white mb-6`}>
            <div className="text-center">
              {/* 等级图标 */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
                <IconTrophy className="w-10 h-10" />
              </div>
              
              {/* 等级信息 */}
              <p className="text-sm opacity-80">Lv.{levelInfo?.level || 1}</p>
              <h2 className="text-xl font-bold mb-2">{levelInfo?.title || '新手铲屎官'}</h2>
              
              {/* 积分 */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <IconStar className="w-5 h-5" />
                <span className="text-2xl font-bold"><CountUp end={totalPoints} /></span>
                <span className="text-sm opacity-80">积分</span>
              </div>
              
              {/* 升级进度 */}
              <div className="mb-2">
                <Progress value={(totalPoints / (levelInfo?.nextLevel || 50)) * 100} className="bg-white/30" />
              </div>
              <p className="text-sm opacity-80">
                还需 {((levelInfo?.nextLevel || 50) - totalPoints)} 积分升级
              </p>
            </div>
          </Card>
        </SlideIn>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: IconCalendar, label: '坚持天数', value: stats?.daysCompleted || 0, color: 'text-orange-500' },
            { icon: IconCat, label: '养猫笔记', value: stats?.notesCount || 0, color: 'text-purple-500' },
            { icon: IconStar, label: 'AI问答', value: stats?.aiCallsCount || 0, color: 'text-blue-500' },
            { icon: IconHeart, label: '分享次数', value: stats?.sharesCount || 0, color: 'text-pink-500' }
          ].map((stat, i) => (
            <SlideIn key={stat.label} delay={i * 50}>
              <Card className="text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* 已解锁成就 */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <IconTrophy className="w-5 h-5 text-orange-500" />
            已解锁成就 ({unlockedAchievements.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {unlockedAchievements.map((a, i) => (
              <SlideIn key={a.id} delay={i * 30}>
                <Card className={`bg-gradient-to-br ${rarityColors[a.rarity]} text-white text-center p-3`}>
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-xs mt-1 font-medium truncate">{a.title}</p>
                </Card>
              </SlideIn>
            ))}
          </div>
        </div>

        {/* 进行中的成就 */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <IconStar className="w-5 h-5 text-blue-500" />
            正在挑战
          </h3>
          <div className="space-y-3">
            {inProgressAchievements.map((a, i) => {
              const progress = getProgress(a)
              return (
                <SlideIn key={a.id} delay={i * 50}>
                  <Card>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{a.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-gray-500">{a.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <AnimatedProgress value={progress.percentage} className="flex-1 h-2" />
                          <span className="text-sm text-gray-600">{progress.current}/{progress.target}</span>
                        </div>
                      </div>
                      <Badge variant="info">{progress.percentage}%</Badge>
                    </div>
                  </Card>
                </SlideIn>
              )
            })}
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 gap-4">
          <SlideIn delay={100}>
            <Card hover className="text-center">
              <Link href="/achievements">
                <IconTrophy className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="font-medium">成就详情</p>
              </Link>
            </Card>
          </SlideIn>
          <SlideIn delay={150}>
            <Card hover className="text-center">
              <Link href="/share">
                <IconHeart className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                <p className="font-medium">分享我的成绩</p>
              </Link>
            </Card>
          </SlideIn>
        </div>
      </FadeIn>
    </AppLayout>
  )
}

import Link from 'next/link'