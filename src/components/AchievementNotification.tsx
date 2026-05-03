'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { SlideIn } from '@/components/animations'
import { Button, Card } from '@/components/ui'
import { IconTrophy, IconX } from '@/components/icons'
import {
  AchievementDefinition,
  ACHIEVEMENTS,
  checkAllAchievements,
  UserStats,
  calculateUserLevel
} from '@/lib/achievements'

interface AchievementNotification {
  id: string
  achievement: AchievementDefinition
  timestamp: string
}

interface AchievementContextType {
  notifications: AchievementNotification[]
  showNotification: (achievement: AchievementDefinition) => void
  dismissNotification: (id: string) => void
  stats: UserStats
  updateStats: (updates: Partial<UserStats>) => void
  checkAndUnlock: () => AchievementDefinition[]
}

const AchievementContext = createContext<AchievementContextType | null>(null)

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider')
  }
  return context
}

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([])
  const [stats, setStats] = useState<UserStats>({
    daysCompleted: 0,
    actionsCompleted: 0,
    notesCount: 0,
    aiCallsCount: 0,
    sharesCount: 0,
    streakDays: 0,
    unlockedAchievements: []
  })

  useEffect(() => {
    // 加载用户数据
    const userData = localStorage.getItem('petmate_user')
    if (userData) {
      const saved = JSON.parse(userData)
      setStats({
        daysCompleted: saved.daysCompleted || saved.dayNumber || 0,
        actionsCompleted: saved.actionsCompleted || 0,
        notesCount: saved.notes?.length || 0,
        aiCallsCount: saved.aiCallsCount || 0,
        sharesCount: saved.sharesCount || 0,
        streakDays: saved.streakDays || 0,
        unlockedAchievements: saved.achievements || []
      })
    }
  }, [])

  const showNotification = (achievement: AchievementDefinition) => {
    const notification: AchievementNotification = {
      id: `notif_${Date.now()}`,
      achievement,
      timestamp: new Date().toISOString()
    }
    setNotifications(prev => [...prev, notification])

    // 自动消失（15秒后）
    setTimeout(() => {
      dismissNotification(notification.id)
    }, 15000)
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const updateStats = (updates: Partial<UserStats>) => {
    setStats(prev => {
      const newStats = { ...prev, ...updates }
      
      // 保存到localStorage
      const userData = localStorage.getItem('petmate_user')
      if (userData) {
        const saved = JSON.parse(userData)
        saved.achievements = newStats.unlockedAchievements
        saved.aiCallsCount = newStats.aiCallsCount
        saved.sharesCount = newStats.sharesCount
        saved.streakDays = newStats.streakDays
        localStorage.setItem('petmate_user', JSON.stringify(saved))
      }

      return newStats
    })
  }

  const checkAndUnlock = (): AchievementDefinition[] => {
    const newlyUnlocked = checkAllAchievements(stats)
    
    newlyUnlocked.forEach(achievement => {
      // 添加到已解锁列表
      setStats(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, achievement.id]
      }))

      // 显示通知
      showNotification(achievement)
    })

    return newlyUnlocked
  }

  return (
    <AchievementContext.Provider value={{
      notifications,
      showNotification,
      dismissNotification,
      stats,
      updateStats,
      checkAndUnlock
    }}>
      {children}
      
      {/* 通知渲染 */}
      <AchievementNotifications 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />
    </AchievementContext.Provider>
  )
}

// 成就通知组件
function AchievementNotifications({
  notifications,
  onDismiss
}: {
  notifications: AchievementNotification[]
  onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notif, i) => (
        <SlideIn key={notif.id} direction="right" delay={i * 100}>
          <AchievementCard
            achievement={notif.achievement}
            onDismiss={() => onDismiss(notif.id)}
          />
        </SlideIn>
      ))}
    </div>
  )
}

function AchievementCard({
  achievement,
  onDismiss
}: {
  achievement: AchievementDefinition
  onDismiss: () => void
}) {
  const rarityColors = {
    common: 'from-gray-100 to-gray-200 border-gray-300',
    rare: 'from-blue-50 to-blue-100 border-blue-300',
    epic: 'from-purple-50 to-purple-100 border-purple-300',
    legendary: 'from-yellow-50 to-orange-100 border-orange-300'
  }

  return (
    <Card className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} border-2 animate-bounce-subtle`}>
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className="text-3xl">{achievement.icon}</div>

        {/* 内容 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <IconTrophy className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">成就解锁！</span>
          </div>
          <h4 className="font-bold">{achievement.title}</h4>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          
          {/* 奖励 */}
          {achievement.reward && (
            <div className="mt-2 flex gap-2">
              {achievement.reward.points && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                  +{achievement.reward.points}积分
                </span>
              )}
              {achievement.reward.badge && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  徽章：{achievement.reward.badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-white/50"
        >
          <IconX className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* 分享按钮 */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <Button
          size="sm"
          variant="outline"
          fullWidth
          onClick={() => {
            // 跳转分享
            window.location.href = `/share?achievement=${achievement.id}`
          }}
        >
          分享我的成就
        </Button>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}