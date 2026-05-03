'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Progress, Spinner, EmptyState } from '@/components/ui'
import { IconTrophy, IconStar, IconHeart, IconCheck } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  total?: number
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_day', title: '初来乍到', description: '完成第一天的行动卡', icon: '🌟', unlocked: true },
  { id: 'week_one', title: '一周坚持', description: '连续完成7天行动卡', icon: '📅', unlocked: true },
  { id: 'first_note', title: '观察家', description: '记录第一篇养猫笔记', icon: '📝', unlocked: false },
  { id: 'ai_asker', title: '好学好问', description: '使用AI问答10次', icon: '🤖', unlocked: false, progress: 3, total: 10 },
  { id: 'month_one', title: '月度达人', description: '完成30天行动卡', icon: '🏆', unlocked: false },
  { id: 'full_journey', title: '90天达人', description: '完成全部90天计划', icon: '👑', unlocked: false },
  { id: 'share_love', title: '爱心传递', description: '分享你的养猫经验', icon: '❤️', unlocked: false },
  { id: 'cat_whisperer', title: '猫咪语者', description: '记录50次猫咪行为观察', icon: '🐱', unlocked: false, progress: 12, total: 50 },
]

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    // 模拟加载成就数据
    setTimeout(() => {
      const userData = localStorage.getItem('petmate_user')
      const saved = userData ? JSON.parse(userData) : {}
      const unlockedIds = saved.achievements || ['first_day', 'week_one']

      setAchievements(ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: unlockedIds.includes(a.id)
      })))
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <AppLayout title="成就系统">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalProgress = Math.round((unlockedCount / achievements.length) * 100)

  return (
    <AppLayout title="成就系统">
      <FadeIn>
        {/* 总进度 */}
        <Card className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <IconTrophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {unlockedCount} / {achievements.length}
          </h2>
          <p className="text-gray-500 mb-4">成就已解锁</p>
          <Progress value={totalProgress} className="mb-2" />
          <p className="text-sm text-gray-500">总进度 {totalProgress}%</p>
        </Card>

        {/* 成就列表 */}
        <div className="space-y-4">
          {achievements.map((achievement, i) => (
            <SlideIn key={achievement.id} delay={i * 50}>
              <Card
                className={`transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* 图标 */}
                  <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Badge size="sm" variant="success">
                          <IconCheck className="w-3 h-3 mr-1" />
                          已解锁
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>

                    {/* 进度条 */}
                    {achievement.progress !== undefined && (
                      <div className="mt-2">
                        <Progress
                          value={(achievement.progress / (achievement.total || 1)) * 100}
                          className="h-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.progress} / {achievement.total}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* 激励文案 */}
        <Card className="mt-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <IconStar className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">继续加油！</p>
          <p className="text-sm opacity-80">每一步努力都值得被记录</p>
        </Card>
      </FadeIn>
    </AppLayout>
  )
}