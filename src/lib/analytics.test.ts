/**
 * 数据分析单元测试
 */

import {
  trackEvent,
  calculateFunnel,
  calculateRetention,
  getUserAnalytics
} from '@/lib/analytics'

describe('Analytics Module', () => {
  const testUserId = `user_analytics_${Date.now()}`

  describe('trackEvent', () => {
    it('should track event with properties', () => {
      const event = trackEvent('page_view', { page: '/dashboard' }, testUserId)
      
      expect(event.id).toBeDefined()
      expect(event.eventType).toBe('page_view')
      expect(event.userId).toBe(testUserId)
      expect(event.properties.page).toBe('/dashboard')
      expect(event.timestamp).toBeDefined()
    })

    it('should track event without user', () => {
      const event = trackEvent('action_complete', { action: 'test' })
      
      expect(event.userId).toBeUndefined()
      expect(event.eventType).toBe('action_complete')
    })
  })

  describe('calculateFunnel', () => {
    it('should return funnel definition', () => {
      const result = calculateFunnel('onboarding')
      
      expect(result.funnel).toBeDefined()
      expect(result.funnel.id).toBe('onboarding')
      expect(result.steps.length).toBeGreaterThan(0)
    })

    it('should throw for unknown funnel', () => {
      expect(() => calculateFunnel('unknown_funnel')).toThrow()
    })
  })

  describe('calculateRetention', () => {
    it('should return retention data structure', () => {
      const date = new Date().toISOString().split('T')[0]
      const result = calculateRetention(date)
      
      expect(result).toHaveProperty('day1')
      expect(result).toHaveProperty('day7')
      expect(result).toHaveProperty('day30')
      expect(result).toHaveProperty('data')
      expect(typeof result.day1).toBe('number')
      expect(typeof result.day7).toBe('number')
      expect(typeof result.day30).toBe('number')
    })
  })

  describe('getUserAnalytics', () => {
    it('should return user analytics', () => {
      const userId = `analytics_user_${Date.now()}`
      trackEvent('page_view', { page: '/test' }, userId)
      trackEvent('action_complete', { action: 'test' }, userId)
      
      const analytics = getUserAnalytics(userId)
      
      expect(analytics.totalEvents).toBeGreaterThan(0)
      expect(analytics.lastActive).toBeDefined()
      expect(analytics.mostUsedFeatures.length).toBeGreaterThan(0)
      expect(analytics.engagementScore).toBeGreaterThanOrEqual(0)
    })

    it('should return empty analytics for unknown user', () => {
      const analytics = getUserAnalytics('unknown_user_unique')
      
      expect(analytics.totalEvents).toBe(0)
      expect(analytics.engagementScore).toBe(0)
    })
  })
})