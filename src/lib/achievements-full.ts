/**
 * 成就系统 - 完整激活版
 * 定义所有成就、解锁条件和奖励
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'progress' | 'social' | 'health' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  unlockedAt?: string
  progress?: number
  target: number
  reward?: {
    type: 'badge' | 'content' | 'feature'
    value: string
  }
}

// ============ 成就定义 ============

export const ACHIEVEMENTS: Achievement[] = [
  // 进度成就
  {
    id: 'first_day',
    name: '新手上路',
    description: '完成第一天行动卡',
    icon: '🐾',
    category: 'progress',
    tier: 'bronze',
    target: 1,
    reward: { type: 'badge', value: 'first_day' }
  },
  {
    id: 'week_one',
    name: '一周达人',
    description: '完成前7天所有行动',
    icon: '📅',
    category: 'progress',
    tier: 'bronze',
    target: 7,
    reward: { type: 'content', value: 'week_one_tips' }
  },
  {
    id: 'month_one',
    name: '月度冠军',
    description: '完成前30天所有行动',
    icon: '🏆',
    category: 'progress',
    tier: 'silver',
    target: 30,
    reward: { type: 'content', value: 'month_one_guide' }
  },
  {
    id: 'halfway',
    name: '半程英雄',
    description: '完成前45天所有行动',
    icon: '⭐',
    category: 'progress',
    tier: 'silver',
    target: 45,
    reward: { type: 'badge', value: 'halfway' }
  },
  {
    id: 'ninety_days',
    name: '守护大师',
    description: '完成全部90天行动',
    icon: '👑',
    category: 'progress',
    tier: 'gold',
    target: 90,
    reward: { type: 'content', value: 'graduation_certificate' }
  },

  // 社交成就
  {
    id: 'first_note',
    name: '观察家',
    description: '记录第一条笔记',
    icon: '📝',
    category: 'social',
    tier: 'bronze',
    target: 1,
    reward: { type: 'badge', value: 'observer' }
  },
  {
    id: 'note_master',
    name: '笔记达人',
    description: '累计记录20条笔记',
    icon: '📓',
    category: 'social',
    tier: 'silver',
    target: 20,
    reward: { type: 'content', value: 'note_template_pack' }
  },
  {
    id: 'first_share',
    name: '分享达人',
    description: '首次分享养猫日记',
    icon: '📤',
    category: 'social',
    tier: 'bronze',
    target: 1,
    reward: { type: 'badge', value: 'sharer' }
  },
  {
    id: 'share_master',
    name: '传播大使',
    description: '分享10次养猫日记',
    icon: '🌟',
    category: 'social',
    tier: 'gold',
    target: 10,
    reward: { type: 'badge', value: 'ambassador' }
  },

  // 健康成就
  {
    id: 'weight_tracker',
    name: '体重守护者',
    description: '记录5次体重数据',
    icon: '⚖️',
    category: 'health',
    tier: 'bronze',
    target: 5,
    reward: { type: 'content', value: 'weight_analysis' }
  },
  {
    id: 'vaccine_complete',
    name: '疫苗卫士',
    description: '完成基础疫苗接种记录',
    icon: '💉',
    category: 'health',
    tier: 'silver',
    target: 3,
    reward: { type: 'badge', value: 'vaccine_guardian' }
  },
  {
    id: 'health_monitor',
    name: '健康管家',
    description: '创建完整健康档案',
    icon: '🏥',
    category: 'health',
    tier: 'gold',
    target: 1,
    reward: { type: 'content', value: 'health_report' }
  },

  // 特殊成就
  {
    id: 'early_bird',
    name: '早起打卡',
    description: '在早上8点前完成行动卡',
    icon: '🌅',
    category: 'special',
    tier: 'bronze',
    target: 1,
    reward: { type: 'badge', value: 'early_bird' }
  },
  {
    id: 'streak_7',
    name: '连续7天',
    description: '连续7天每天完成至少一项行动',
    icon: '🔥',
    category: 'special',
    tier: 'silver',
    target: 7,
    reward: { type: 'badge', value: 'streak_master' }
  },
  {
    id: 'streak_30',
    name: '坚持30天',
    description: '连续30天每天完成至少一项行动',
    icon: '💎',
    category: 'special',
    tier: 'gold',
    target: 30,
    reward: { type: 'badge', value: 'dedication' }
  },
  {
    id: 'perfect_day',
    name: '完美一天',
    description: '单日完成所有行动项',
    icon: '✨',
    category: 'special',
    tier: 'bronze',
    target: 1,
    reward: { type: 'badge', value: 'perfect' }
  },
  {
    id: 'beta_tester',
    name: '内测先锋',
    description: '在Beta阶段使用产品',
    icon: '🧪',
    category: 'special',
    tier: 'diamond',
    target: 1,
    reward: { type: 'badge', value: 'beta_tester' }
  }
]

// ============ 成就状态管理 ============

export interface AchievementState {
  unlockedIds: string[]
  progress: Record<string, number>
  stats: {
    totalDaysCompleted: number
    totalNotes: number
    totalShares: number
    currentStreak: number
    longestStreak: number
    weightRecords: number
    vaccineRecords: number
    perfectDays: number
  }
}

export const defaultAchievementState: AchievementState = {
  unlockedIds: [],
  progress: {},
  stats: {
    totalDaysCompleted: 0,
    totalNotes: 0,
    totalShares: 0,
    currentStreak: 0,
    longestStreak: 0,
    weightRecords: 0,
    vaccineRecords: 0,
    perfectDays: 0
  }
}

// ============ 成就检查函数 ============

export function checkAchievement(
  achievement: Achievement,
  state: AchievementState
): { unlocked: boolean; progress: number } {
  const { id, target } = achievement

  // 已解锁
  if (state.unlockedIds.includes(id)) {
    return { unlocked: true, progress: target }
  }

  // 计算进度
  let progress = 0

  switch (id) {
    // 进度成就
    case 'first_day':
    case 'week_one':
    case 'month_one':
    case 'halfway':
    case 'ninety_days':
      progress = state.stats.totalDaysCompleted
      break

    // 社交成就
    case 'first_note':
    case 'note_master':
      progress = state.stats.totalNotes
      break
    case 'first_share':
    case 'share_master':
      progress = state.stats.totalShares
      break

    // 健康成就
    case 'weight_tracker':
      progress = state.stats.weightRecords
      break
    case 'vaccine_complete':
      progress = state.stats.vaccineRecords
      break
    case 'health_monitor':
      progress = Math.min(1,
        (state.stats.weightRecords > 0 ? 1 : 0) +
        (state.stats.vaccineRecords >= 3 ? 1 : 0)
      )
      break

    // 特殊成就
    case 'streak_7':
    case 'streak_30':
      progress = state.stats.longestStreak
      break
    case 'perfect_day':
      progress = state.stats.perfectDays
      break
    case 'early_bird':
    case 'beta_tester':
      progress = state.progress[id] || 0
      break
  }

  const unlocked = progress >= target

  return { unlocked, progress: Math.min(progress, target) }
}

// ============ 成就批量检查 ============

export function checkAllAchievements(state: AchievementState): {
  newlyUnlocked: Achievement[]
  allAchievements: Achievement[]
} {
  const newlyUnlocked: Achievement[] = []
  const allAchievements: Achievement[] = []

  ACHIEVEMENTS.forEach(achievement => {
    const { unlocked, progress } = checkAchievement(achievement, state)

    const updatedAchievement: Achievement = {
      ...achievement,
      progress,
      unlockedAt: unlocked ? (achievement.unlockedAt || new Date().toISOString()) : undefined
    }

    allAchievements.push(updatedAchievement)

    if (unlocked && !state.unlockedIds.includes(achievement.id)) {
      newlyUnlocked.push(updatedAchievement)
    }
  })

  return { newlyUnlocked, allAchievements }
}

// ============ 成就展示组件数据 ============

export function getAchievementDisplayData(achievement: Achievement): {
  bgColor: string
  textColor: string
  borderColor: string
  glowEffect: string
} {
  switch (achievement.tier) {
    case 'diamond':
      return {
        bgColor: 'bg-gradient-to-br from-blue-100 to-purple-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
        glowEffect: 'shadow-[0_0_15px_rgba(147,51,234,0.3)]'
      }
    case 'gold':
      return {
        bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
        glowEffect: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]'
      }
    case 'silver':
      return {
        bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        glowEffect: 'shadow-[0_0_8px_rgba(156,163,175,0.3)]'
      }
    default: // bronze
      return {
        bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        glowEffect: ''
      }
  }
}

// ============ 成就通知 ============

export function showAchievementNotification(achievement: Achievement): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification(`恭喜解锁成就: ${achievement.name} 🎉`, {
      body: achievement.description,
      icon: '/favicon.ico',
      tag: `achievement_${achievement.id}`
    })
  }
}
