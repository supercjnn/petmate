/**
 * 成就系统完整实现
 * 进度追踪、成就解锁、奖励机制
 */

// ============ 成就定义 ============

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'progress' | 'social' | 'health' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  condition: (state: AchievementState) => boolean
  reward?: {
    type: 'badge' | 'title' | 'feature'
    value: string
  }
  rarity: number // 0-100, 100最稀有
}

export interface AchievementState {
  currentDay: number
  totalDaysCompleted: number
  streakDays: number
  postsCount: number
  commentsCount: number
  likesReceived: number
  followersCount: number
  healthRecordsCount: number
  achievementsUnlocked: string[]
  history?: Record<number, string[]>
  notes?: Record<number, any[]>
}

// ============ 成就列表 ============

export const ACHIEVEMENTS: Achievement[] = [
  // 进度成就
  {
    id: 'first_day',
    name: '初来乍到',
    description: '完成第一天的养护任务',
    icon: '🌱',
    category: 'progress',
    tier: 'bronze',
    condition: (state) => state.currentDay >= 1,
    rarity: 100
  },
  {
    id: 'week_1',
    name: '一周达人',
    description: '连续打卡7天',
    icon: '📅',
    category: 'progress',
    tier: 'bronze',
    condition: (state) => state.streakDays >= 7,
    rarity: 80
  },
  {
    id: 'month_1',
    name: '满月守护',
    description: '完成30天养护计划',
    icon: '🌙',
    category: 'progress',
    tier: 'silver',
    condition: (state) => state.totalDaysCompleted >= 30,
    rarity: 50
  },
  {
    id: 'month_3',
    name: '季度之星',
    description: '完成90天全程计划',
    icon: '⭐',
    category: 'progress',
    tier: 'gold',
    condition: (state) => state.totalDaysCompleted >= 90,
    reward: { type: 'title', value: '资深铲屎官' },
    rarity: 20
  },
  {
    id: 'streak_30',
    name: '坚持就是胜利',
    description: '连续打卡30天',
    icon: '🔥',
    category: 'progress',
    tier: 'gold',
    condition: (state) => state.streakDays >= 30,
    rarity: 15
  },

  // 社交成就
  {
    id: 'first_post',
    name: '初次分享',
    description: '发布第一篇帖子',
    icon: '📝',
    category: 'social',
    tier: 'bronze',
    condition: (state) => state.postsCount >= 1,
    rarity: 90
  },
  {
    id: 'storyteller',
    name: '故事讲述者',
    description: '发布10篇帖子',
    icon: '📚',
    category: 'social',
    tier: 'silver',
    condition: (state) => state.postsCount >= 10,
    rarity: 40
  },
  {
    id: 'helpful',
    name: '热心肠',
    description: '评论数达到50条',
    icon: '💬',
    category: 'social',
    tier: 'silver',
    condition: (state) => state.commentsCount >= 50,
    rarity: 35
  },
  {
    id: 'popular',
    name: '人气王',
    description: '获得100个点赞',
    icon: '❤️',
    category: 'social',
    tier: 'gold',
    condition: (state) => state.likesReceived >= 100,
    rarity: 25
  },
  {
    id: 'influencer',
    name: '铲屎官KOL',
    description: '获得50个粉丝',
    icon: '👑',
    category: 'social',
    tier: 'platinum',
    condition: (state) => state.followersCount >= 50,
    reward: { type: 'feature', value: 'custom_profile_badge' },
    rarity: 5
  },

  // 健康成就
  {
    id: 'first_record',
    name: '记录开始',
    description: '创建第一条健康记录',
    icon: '📋',
    category: 'health',
    tier: 'bronze',
    condition: (state) => state.healthRecordsCount >= 1,
    rarity: 85
  },
  {
    id: 'health_master',
    name: '健康管家',
    description: '创建20条健康记录',
    icon: '🏥',
    category: 'health',
    tier: 'silver',
    condition: (state) => state.healthRecordsCount >= 20,
    rarity: 30
  },
  {
    id: 'vaccine_complete',
    name: '疫苗卫士',
    description: '完成所有基础疫苗接种记录',
    icon: '💉',
    category: 'health',
    tier: 'gold',
    condition: (state) => state.achievementsUnlocked.includes('vaccine_done'),
    rarity: 25
  },

  // 特殊成就
  {
    id: 'early_bird',
    name: '早起的鸟儿',
    description: '连续7天在早上8点前完成任务',
    icon: '🌅',
    category: 'special',
    tier: 'silver',
    condition: (state) => state.achievementsUnlocked.includes('early_streak_7'),
    rarity: 20
  },
  {
    id: 'cat_whisperer',
    name: '猫咪语者',
    description: '使用AI助手50次',
    icon: '🎭',
    category: 'special',
    tier: 'gold',
    condition: (state) => state.achievementsUnlocked.includes('ai_50'),
    rarity: 15
  },
  {
    id: 'founder',
    name: '创始成员',
    description: '在产品上线首月加入',
    icon: '🏆',
    category: 'special',
    tier: 'platinum',
    condition: () => true, // 时间检查
    reward: { type: 'badge', value: 'founder_badge' },
    rarity: 1
  }
]

// ============ 成就检查 ============

/**
 * 检查所有成就
 */
export function checkAllAchievements(state: AchievementState): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => 
    !state.achievementsUnlocked.includes(achievement.id) && 
    achievement.condition(state)
  )
}

/**
 * 获取成就进度
 */
export function getAchievementProgress(achievementId: string, state: AchievementState): {
  current: number
  target: number
  percentage: number
} {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) return { current: 0, target: 1, percentage: 0 }

  // 简化进度计算
  const progressMap: Record<string, { current: number; target: number }> = {
    'week_1': { current: state.streakDays, target: 7 },
    'month_1': { current: state.totalDaysCompleted, target: 30 },
    'month_3': { current: state.totalDaysCompleted, target: 90 },
    'streak_30': { current: state.streakDays, target: 30 },
    'storyteller': { current: state.postsCount, target: 10 },
    'helpful': { current: state.commentsCount, target: 50 },
    'popular': { current: state.likesReceived, target: 100 },
    'influencer': { current: state.followersCount, target: 50 },
    'health_master': { current: state.healthRecordsCount, target: 20 }
  }

  const progress = progressMap[achievementId] || { current: 0, target: 1 }
  return {
    ...progress,
    percentage: Math.min(100, Math.floor((progress.current / progress.target) * 100))
  }
}

/**
 * 显示成就通知
 */
export function showAchievementNotification(achievement: Achievement): {
  title: string
  message: string
  icon: string
} {
  const tierNames = {
    bronze: '铜牌成就',
    silver: '银牌成就',
    gold: '金牌成就',
    platinum: '白金成就'
  }

  return {
    title: `🎉 解锁${tierNames[achievement.tier]}！`,
    message: `${achievement.name}: ${achievement.description}`,
    icon: achievement.icon
  }
}

// ============ 成就统计 ============

/**
 * 获取成就统计
 */
export function getAchievementStats(state: AchievementState): {
  total: number
  unlocked: number
  byCategory: Record<string, number>
  byTier: Record<string, number>
  completionRate: number
} {
  const unlocked = state.achievementsUnlocked.length
  const total = ACHIEVEMENTS.length

  const byCategory: Record<string, number> = {
    progress: 0,
    social: 0,
    health: 0,
    special: 0
  }

  const byTier: Record<string, number> = {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0
  }

  ACHIEVEMENTS.forEach(a => {
    if (state.achievementsUnlocked.includes(a.id)) {
      byCategory[a.category]++
      byTier[a.tier]++
    }
  })

  return {
    total,
    unlocked,
    byCategory,
    byTier,
    completionRate: Math.floor((unlocked / total) * 100)
  }
}

/**
 * 获取下一个推荐成就
 */
export function getNextAchievement(state: AchievementState): Achievement | null {
  // 找到进度最高但未解锁的成就
  let bestProgress = 0
  let nextAchievement: Achievement | null = null

  ACHIEVEMENTS
    .filter(a => !state.achievementsUnlocked.includes(a.id))
    .forEach(achievement => {
      const progress = getAchievementProgress(achievement.id, state)
      if (progress.percentage > bestProgress) {
        bestProgress = progress.percentage
        nextAchievement = achievement
      }
    })

  return nextAchievement
}

/**
 * 获取已解锁成就数量
 */
export function getUnlockedCount(progressList: AchievementProgress[]): number {
  return progressList.filter(p => p.unlocked).length
}

/**
 * 解锁成就
 */
export function unlockAchievement(achievementId: string, state: AchievementState): boolean {
  if (!state.achievementsUnlocked.includes(achievementId)) {
    state.achievementsUnlocked.push(achievementId)
    return true
  }
  return false
}

/**
 * 获取已解锁成就列表
 */
export function getUnlockedAchievements(state: AchievementState): Achievement[] {
  return ACHIEVEMENTS.filter(a => state.achievementsUnlocked.includes(a.id))
}

/**
 * 成就进度接口
 */
export interface AchievementProgress {
  achievement: Achievement
  unlocked: boolean
  progress: number
  current: number
  target: number
  unlockedAt?: string
}

/**
 * 获取所有成就进度
 */
export function getAllAchievementProgress(state: AchievementState): AchievementProgress[] {
  return ACHIEVEMENTS.map(achievement => {
    const progress = getAchievementProgress(achievement.id, state)
    const unlocked = state.achievementsUnlocked.includes(achievement.id)
    
    return {
      achievement,
      unlocked,
      progress: progress.percentage,
      current: progress.current,
      target: progress.target,
      unlockedAt: unlocked ? new Date().toISOString() : undefined
    }
  })
}

// ============ 导出 ============

export default ACHIEVEMENTS