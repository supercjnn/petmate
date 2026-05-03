/**
 * 分享功能单元测试
 */

import {
  createShareLink,
  getShareLink,
  likeShare,
  generateProgressShare,
  generateAchievementShare,
  ShareContent
} from '@/lib/share'

describe('Share Module', () => {
  beforeEach(() => {
    // Clear any state if needed
  })

  describe('createShareLink', () => {
    it('should create a share link', () => {
      const content: ShareContent = {
        type: 'progress',
        title: 'Test Share',
        description: 'Test description',
        data: { day: 10 }
      }
      
      const link = createShareLink('user_123', content)
      
      expect(link.id).toBeDefined()
      expect(link.userId).toBe('user_123')
      expect(link.content).toEqual(content)
      expect(link.viewCount).toBe(0)
      expect(link.likeCount).toBe(0)
    })
  })

  describe('getShareLink', () => {
    it('should return share link and increment view count', () => {
      const content: ShareContent = {
        type: 'achievement',
        title: 'Test',
        description: 'Test',
        data: {}
      }
      const created = createShareLink('user_123', content)
      
      const retrieved = getShareLink(created.id)
      
      expect(retrieved).toBeDefined()
      expect(retrieved!.viewCount).toBe(1)
    })

    it('should return null for non-existent link', () => {
      const link = getShareLink('non_existent_id')
      expect(link).toBeNull()
    })
  })

  describe('likeShare', () => {
    it('should increment like count', () => {
      const content: ShareContent = {
        type: 'post',
        title: 'Test',
        description: 'Test',
        data: {}
      }
      const created = createShareLink('user_123', content)
      
      const result = likeShare(created.id)
      
      expect(result).toBe(true)
      const updated = getShareLink(created.id)
      expect(updated!.likeCount).toBe(1)
    })

    it('should return false for non-existent link', () => {
      const result = likeShare('non_existent_id')
      expect(result).toBe(false)
    })
  })

  describe('generateProgressShare', () => {
    it('should generate progress share content', () => {
      const content = generateProgressShare({
        currentDay: 30,
        streakDays: 30,
        catName: '小橘',
        achievements: ['week_1', 'month_1']
      })
      
      expect(content.type).toBe('progress')
      expect(content.title).toContain('小橘')
      expect(content.title).toContain('30')
      expect(content.data.currentDay).toBe(30)
    })
  })

  describe('generateAchievementShare', () => {
    it('should generate achievement share content', () => {
      const content = generateAchievementShare({
        achievementName: '第一周守护者',
        achievementIcon: '🏆',
        achievementDescription: '连续打卡7天',
        catName: '小橘'
      })
      
      expect(content.type).toBe('achievement')
      expect(content.title).toContain('第一周守护者')
      expect(content.title).toContain('🏆')
    })
  })
})