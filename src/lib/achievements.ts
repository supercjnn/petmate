// PetMate 成就系统

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string  // emoji
  unlockedAt?: string
  type: 'milestone' | 'streak' | 'special'
}

// 所有成就定义
export const ACHIEVEMENTS: Achievement[] = [
  // 里程碑成就
  {
    id: 'milestone_7',
    name: '第一周守护者',
    description: '完成 Day 7 的所有任务',
    icon: '🌟',
    type: 'milestone'
  },
  {
    id: 'milestone_15',
    name: '半月陪伴者',
    description: '完成 Day 15 的所有任务',
    icon: '🌙',
    type: 'milestone'
  },
  {
    id: 'milestone_30',
    name: '满月守护者',
    description: '完成 Day 30 的所有任务',
    icon: '🎉',
    type: 'milestone'
  },
  {
    id: 'milestone_60',
    name: '双月陪伴者',
    description: '完成 Day 60 的所有任务',
    icon: '💪',
    type: 'milestone'
  },
  {
    id: 'milestone_90',
    name: '90天守护神',
    description: '完成 Day 90 的所有任务',
    icon: '👑',
    type: 'milestone'
  },
  
  // 连续成就
  {
    id: 'streak_7',
    name: '坚持就是胜利',
    description: '连续打卡 7 天',
    icon: '🔥',
    type: 'streak'
  },
  {
    id: 'perfect_day',
    name: '完美主义者',
    description: '单日完成所有行动项目',
    icon: '✨',
    type: 'streak'
  },
  
  // 特殊成就
  {
    id: 'first_interaction',
    name: '第一步',
    description: '首次完成一个行动项目',
    icon: '👣',
    type: 'special'
  },
  {
    id: 'first_note',
    name: '观察家',
    description: '记录第一篇笔记',
    icon: '📝',
    type: 'special'
  }
]

// 成就进度计算
export interface AchievementProgress {
  achievement: Achievement
  unlocked: boolean
  progress: number  // 0-100
  progressText?: string
}

// 检查成就是否解锁
export function checkAchievement(
  achievement: Achievement,
  userData: {
    currentDay: number
    history: Record<number, string[]>
    notes: Record<number, any[]>
  }
): AchievementProgress {
  const { currentDay, history, notes } = userData
  
  switch (achievement.id) {
    // 里程碑成就
    case 'milestone_7':
      return {
        achievement,
        unlocked: currentDay > 7,
        progress: Math.min(100, Math.round((currentDay / 7) * 100)),
        progressText: `${Math.min(currentDay, 7)}/7 天`
      }
    case 'milestone_15':
      return {
        achievement,
        unlocked: currentDay > 15,
        progress: Math.min(100, Math.round((currentDay / 15) * 100)),
        progressText: `${Math.min(currentDay, 15)}/15 天`
      }
    case 'milestone_30':
      return {
        achievement,
        unlocked: currentDay > 30,
        progress: Math.min(100, Math.round((currentDay / 30) * 100)),
        progressText: `${Math.min(currentDay, 30)}/30 天`
      }
    case 'milestone_60':
      return {
        achievement,
        unlocked: currentDay > 60,
        progress: Math.min(100, Math.round((currentDay / 60) * 100)),
        progressText: `${Math.min(currentDay, 60)}/60 天`
      }
    case 'milestone_90':
      return {
        achievement,
        unlocked: currentDay > 90,
        progress: Math.min(100, Math.round((currentDay / 90) * 100)),
        progressText: `${Math.min(currentDay, 90)}/90 天`
      }
      
    // 连续成就
    case 'streak_7': {
      // 检查连续打卡天数
      let streak = 0
      for (let i = 1; i <= currentDay; i++) {
        if (history[i] && history[i].length > 0) {
          streak++
        } else {
          break
        }
      }
      return {
        achievement,
        unlocked: streak >= 7,
        progress: Math.min(100, Math.round((streak / 7) * 100)),
        progressText: `${Math.min(streak, 7)}/7 天连续`
      }
    }
    case 'perfect_day': {
      // 检查是否有完美完成的一天
      const hasPerfectDay = Object.values(history).some(actions => actions.length > 0)
      return {
        achievement,
        unlocked: hasPerfectDay,
        progress: hasPerfectDay ? 100 : 0,
        progressText: hasPerfectDay ? '已达成' : '未达成'
      }
    }
    
    // 特殊成就
    case 'first_interaction': {
      const hasInteraction = Object.values(history).some(actions => actions.length > 0)
      return {
        achievement,
        unlocked: hasInteraction,
        progress: hasInteraction ? 100 : 0,
        progressText: hasInteraction ? '已达成' : '未达成'
      }
    }
    case 'first_note': {
      const hasNote = Object.values(notes).some(dayNotes => dayNotes && dayNotes.length > 0)
      return {
        achievement,
        unlocked: hasNote,
        progress: hasNote ? 100 : 0,
        progressText: hasNote ? '已达成' : '未达成'
      }
    }
    
    default:
      return {
        achievement,
        unlocked: false,
        progress: 0
      }
  }
}

// 获取所有成就进度
export function getAllAchievementProgress(userData: {
  currentDay: number
  history: Record<number, string[]>
  notes: Record<number, any[]>
}): AchievementProgress[] {
  return ACHIEVEMENTS.map(achievement => checkAchievement(achievement, userData))
}

// 获取已解锁成就数量
export function getUnlockedCount(progressList: AchievementProgress[]): number {
  return progressList.filter(p => p.unlocked).length
}

// 获取成就解锁时间（从本地存储）
export function getUnlockedAchievements(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const saved = localStorage.getItem('petmate_achievements')
  return saved ? JSON.parse(saved) : {}
}

// 保存成就解锁时间
export function saveUnlockedAchievement(achievementId: string): void {
  if (typeof window === 'undefined') return
  const unlocked = getUnlockedAchievements()
  if (!unlocked[achievementId]) {
    unlocked[achievementId] = new Date().toISOString()
    localStorage.setItem('petmate_achievements', JSON.stringify(unlocked))
  }
}

// 检查并解锁新成就
export function checkAndUnlockNewAchievements(
  userData: {
    currentDay: number
    history: Record<number, string[]>
    notes: Record<number, any[]>
  }
): Achievement[] {
  const progressList = getAllAchievementProgress(userData)
  const unlocked = getUnlockedAchievements()
  const newUnlocks: Achievement[] = []
  
  progressList.forEach(({ achievement, unlocked: isUnlocked }) => {
    if (isUnlocked && !unlocked[achievement.id]) {
      saveUnlockedAchievement(achievement.id)
      newUnlocks.push(achievement)
    }
  })
  
  return newUnlocks
}