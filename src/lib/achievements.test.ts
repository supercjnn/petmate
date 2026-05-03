/**
 * 成就系统单元测试
 */

import { 
  ACHIEVEMENTS, 
  AchievementState, 
  checkAllAchievements, 
  getAchievementProgress,
  getUnlockedCount,
  getAllAchievementProgress
} from '@/lib/achievements'

describe('Achievements Module', () => {
  const mockState: AchievementState = {
    currentDay: 15,
    totalDaysCompleted: 15,
    streakDays: 7,
    postsCount: 3,
    commentsCount: 10,
    likesReceived: 20,
    followersCount: 5,
    healthRecordsCount: 5,
    achievementsUnlocked: ['first_day', 'week_1']
  }

  describe('ACHIEVEMENTS', () => {
    it('should have achievements defined', () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThan(0)
    })

    it('should have required properties', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.id).toBeDefined()
        expect(achievement.name).toBeDefined()
        expect(achievement.description).toBeDefined()
        expect(achievement.icon).toBeDefined()
        expect(achievement.category).toBeDefined()
        expect(achievement.tier).toBeDefined()
      })
    })
  })

  describe('checkAllAchievements', () => {
    it('should return newly unlocked achievements', () => {
      const unlocked = checkAllAchievements(mockState)
      
      expect(unlocked.length).toBeGreaterThan(0)
      expect(unlocked.some(a => a.id === 'week_1')).toBe(false) // already unlocked
    })

    it('should not return already unlocked achievements', () => {
      const unlocked = checkAllAchievements(mockState)
      
      expect(unlocked.every(a => !mockState.achievementsUnlocked.includes(a.id))).toBe(true)
    })
  })

  describe('getAchievementProgress', () => {
    it('should return progress for achievement', () => {
      const progress = getAchievementProgress('week_1', mockState)
      
      expect(progress.current).toBe(7)
      expect(progress.target).toBe(7)
      expect(progress.percentage).toBe(100)
    })

    it('should return 0 for unknown achievement', () => {
      const progress = getAchievementProgress('unknown_achievement', mockState)
      
      expect(progress.percentage).toBe(0)
    })
  })

  describe('getUnlockedCount', () => {
    it('should count unlocked achievements', () => {
      const progressList = getAllAchievementProgress(mockState)
      const count = getUnlockedCount(progressList)
      
      expect(count).toBe(2)
    })
  })

  describe('getAllAchievementProgress', () => {
    it('should return progress for all achievements', () => {
      const progressList = getAllAchievementProgress(mockState)
      
      expect(progressList.length).toBe(ACHIEVEMENTS.length)
      progressList.forEach(p => {
        expect(p.achievement).toBeDefined()
        expect(p.unlocked).toBeDefined()
        expect(p.progress).toBeGreaterThanOrEqual(0)
      })
    })
  })
})