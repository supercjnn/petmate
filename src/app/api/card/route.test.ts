/**
 * 行动卡API测试
 */

import { GET } from '@/app/api/card/route'
import { NextRequest } from 'next/server'

function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/card')
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  return new NextRequest(url)
}

describe('Card API', () => {
  describe('GET /api/card', () => {
    it('should return card for day 0', async () => {
      const req = createRequest({ day: '0' })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.card).toBeDefined()
      expect(data.data.card.day_number).toBe(0)
      expect(data.data.card.stage_name).toBeDefined()
      expect(data.data.card.title).toBeDefined()
      expect(data.data.card.actions).toBeDefined()
      expect(data.data.card.avoids).toBeDefined()
    })

    it('should return card for day 1', async () => {
      const req = createRequest({ day: '1' })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.card.day_number).toBe(1)
      expect(data.data.card.stage_name).toBe('适应期')
    })

    it('should return card for day 90', async () => {
      const req = createRequest({ day: '90' })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.card.day_number).toBe(90)
    })

    it('should return personalized card with breed', async () => {
      const req = createRequest({ day: '1', breed: 'ragdoll' })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.card).toBeDefined()
      // 布偶猫应该有特殊建议
      if (data.data.card.breed_tips) {
        expect(data.data.card.breed_tips.length).toBeGreaterThan(0)
      }
    })

    it('should fail for invalid day number', async () => {
      const req = createRequest({ day: '999' })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(false)
    })

    it('should fail for negative day number', async () => {
      const req = createRequest({ day: '-1' })

      const response = await GET(req)
      const data = await response.json()

      expect(data.success).toBe(false)
    })
  })
})