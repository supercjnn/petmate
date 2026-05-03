/**
 * 成就系统核心逻辑
 * 定义成就、解锁条件、通知、分享卡片
 */

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: 'progress' | 'social' | 'knowledge' | 'special'
  condition: {
    type: 'days' | 'actions' | 'notes' | 'ai_calls' | 'shares' | 'streak' | 'hidden'
    threshold: number
  }
  reward?: {
    points?: number
    badge?: string
    unlockContent?: string
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  hidden?: boolean
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ===== 进度类 =====
  {
    id: 'first_day',
    title: '初来乍到',
    description: '完成第一天的行动卡',
    icon: '🌟',
    category: 'progress',
    condition: { type: 'days', threshold: 1 },
    rarity: 'common'
  },
  {
    id: 'week_one',
    title: '一周坚持',
    description: '连续完成7天行动卡',
    icon: '📅',
    category: 'progress',
    condition: { type: 'days', threshold: 7 },
    reward: { points: 50 },
    rarity: 'common'
  },
  {
    id: 'month_one',
    title: '月度达人',
    description: '完成30天行动卡',
    icon: '🏆',
    category: 'progress',
    condition: { type: 'days', threshold: 30 },
    reward: { points: 100, badge: '月度达人' },
    rarity: 'rare'
  },
  {
    id: 'two_months',
    title: '两个月坚持',
    description: '完成60天行动卡',
    icon: '🎖️',
    category: 'progress',
    condition: { type: 'days', threshold: 60 },
    reward: { points: 200 },
    rarity: 'rare'
  },
  {
    id: 'full_journey',
    title: '90天达人',
    description: '完成全部90天计划',
    icon: '👑',
    category: 'progress',
    condition: { type: 'days', threshold: 90 },
    reward: { points: 500, badge: '90天达人', unlockContent: '高级护理指南' },
    rarity: 'legendary'
  },
  {
    id: 'streak_7',
    title: '连续打卡',
    description: '连续7天每天完成所有行动',
    icon: '🔥',
    category: 'progress',
    condition: { type: 'streak', threshold: 7 },
    reward: { points: 30 },
    rarity: 'common'
  },
  {
    id: 'streak_30',
    title: '坚持之星',
    description: '连续30天每天完成所有行动',
    icon: '💫',
    category: 'progress',
    condition: { type: 'streak', threshold: 30 },
    reward: { points: 150, badge: '坚持之星' },
    rarity: 'epic'
  },

  // ===== 社交类 =====
  {
    id: 'first_share',
    title: '分享达人',
    description: '首次分享养猫经验',
    icon: '🔗',
    category: 'social',
    condition: { type: 'shares', threshold: 1 },
    rarity: 'common'
  },
  {
    id: 'share_master',
    title: '传播大使',
    description: '分享10次养猫经验',
    icon: '📢',
    category: 'social',
    condition: { type: 'shares', threshold: 10 },
    reward: { points: 100 },
    rarity: 'rare'
  },
  {
    id: 'inviter',
    title: '邀请达人',
    description: '成功邀请3位朋友加入',
    icon: '👥',
    category: 'social',
    condition: { type: 'shares', threshold: 3 }, // 用invites替代
    reward: { points: 200, badge: '邀请达人' },
    rarity: 'epic'
  },

  // ===== 知识类 =====
  {
    id: 'first_note',
    title: '观察家',
    description: '记录第一篇养猫笔记',
    icon: '📝',
    category: 'knowledge',
    condition: { type: 'notes', threshold: 1 },
    rarity: 'common'
  },
  {
    id: 'note_keeper',
    title: '笔记达人',
    description: '记录10篇养猫笔记',
    icon: '📒',
    category: 'knowledge',
    condition: { type: 'notes', threshold: 10 },
    reward: { points: 50 },
    rarity: 'common'
  },
  {
    id: 'cat_whisperer',
    title: '猫咪语者',
    description: '记录50次猫咪行为观察',
    icon: '🐱',
    category: 'knowledge',
    condition: { type: 'notes', threshold: 50 },
    reward: { points: 200, badge: '猫咪语者' },
    rarity: 'epic'
  },
  {
    id: 'ai_asker',
    title: '好学好问',
    description: '使用AI问答10次',
    icon: '🤖',
    category: 'knowledge',
    condition: { type: 'ai_calls', threshold: 10 },
    reward: { points: 30 },
    rarity: 'common'
  },
  {
    id: 'ai_master',
    title: 'AI达人',
    description: '使用AI问答50次',
    icon: '🧠',
    category: 'knowledge',
    condition: { type: 'ai_calls', threshold: 50 },
    reward: { points: 100 },
    rarity: 'rare'
  },

  // ===== 特殊/隐藏类 =====
  {
    id: 'night_owl',
    title: '夜猫子',
    description: '在凌晨0-4点完成行动卡',
    icon: '🌙',
    category: 'special',
    condition: { type: 'hidden', threshold: 1 },
    hidden: true,
    rarity: 'rare'
  },
  {
    id: 'early_bird',
    title: '早起鸟',
    description: '在早上5-7点完成行动卡',
    icon: '🌅',
    category: 'special',
    condition: { type: 'hidden', threshold: 1 },
    hidden: true,
    rarity: 'rare'
  },
  {
    id: 'lucky_day',
    title: '幸运日',
    description: '在猫咪生日或纪念日完成行动',
    icon: '🍀',
    category: 'special',
    condition: { type: 'hidden', threshold: 1 },
    hidden: true,
    rarity: 'epic'
  },
  {
    id: 'perfectionist',
    title: '完美主义者',
    description: '连续5天100%完成所有行动',
    icon: '💎',
    category: 'special',
    condition: { type: 'streak', threshold: 5 }, // 特殊streak条件
    rarity: 'legendary'
  }
]

// 检查成就解锁
export interface UserStats {
  daysCompleted: number
  actionsCompleted: number
  notesCount: number
  aiCallsCount: number
  sharesCount: number
  streakDays: number
  unlockedAchievements: string[]
}

export function checkAchievementUnlock(
  achievement: AchievementDefinition,
  stats: UserStats
): boolean {
  if (stats.unlockedAchievements.includes(achievement.id)) return false

  const { type, threshold } = achievement.condition

  switch (type) {
    case 'days':
      return stats.daysCompleted >= threshold
    case 'actions':
      return stats.actionsCompleted >= threshold
    case 'notes':
      return stats.notesCount >= threshold
    case 'ai_calls':
      return stats.aiCallsCount >= threshold
    case 'shares':
      return stats.sharesCount >= threshold
    case 'streak':
      return stats.streakDays >= threshold
    case 'hidden':
      // 需要特殊触发，这里返回false
      return false
    default:
      return false
  }
}

// 批量检查解锁
export function checkAllAchievements(stats: UserStats): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => checkAchievementUnlock(a, stats))
}

// 获取成就进度
export function getAchievementProgress(
  achievement: AchievementDefinition,
  stats: UserStats
): { current: number; target: number; percentage: number } {
  const { type, threshold } = achievement.condition

  let current = 0
  switch (type) {
    case 'days':
      current = stats.daysCompleted
      break
    case 'notes':
      current = stats.notesCount
      break
    case 'ai_calls':
      current = stats.aiCallsCount
      break
    case 'shares':
      current = stats.sharesCount
      break
    case 'streak':
      current = stats.streakDays
      break
  }

  return {
    current,
    target: threshold,
    percentage: Math.min(100, Math.round((current / threshold) * 100))
  }
}

// 计算总积分
export function calculateTotalPoints(unlockedIds: string[]): number {
  return unlockedIds.reduce((total, id) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id)
    return total + (achievement?.reward?.points || 0)
  }, 0)
}

// 计算用户等级
export function calculateUserLevel(points: number): { level: number; title: string; nextLevel: number } {
  const levels = [
    { level: 1, title: '新手铲屎官', minPoints: 0 },
    { level: 2, title: '初级铲屎官', minPoints: 50 },
    { level: 3, title: '中级铲屎官', minPoints: 150 },
    { level: 4, title: '高级铲屎官', minPoints: 300 },
    { level: 5, title: '资深铲屎官', minPoints: 500 },
    { level: 6, title: '猫咪大师', minPoints: 800 },
    { level: 7, title: '猫咪专家', minPoints: 1200 },
    { level: 8, title: '猫咪传奇', minPoints: 2000 }
  ]

  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) {
      const nextLevel = i < levels.length - 1 ? levels[i + 1].minPoints : levels[i].minPoints
      return { level: levels[i].level, title: levels[i].title, nextLevel }
    }
  }

  return { level: 1, title: '新手铲屎官', nextLevel: 50 }
}

// 成就分享卡片数据
export function generateShareCard(achievement: AchievementDefinition, stats: UserStats): {
  title: string
  message: string
  gradient: string
} {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  }

  return {
    title: `🎉 解锁成就：${achievement.title}`,
    message: `${achievement.description}\n已坚持${stats.daysCompleted}天，获得${calculateTotalPoints(stats.unlockedAchievements)}积分`,
    gradient: rarityColors[achievement.rarity]
  }
}