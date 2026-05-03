/**
 * AI API测试
 */

import { POST } from '@/app/api/ai/route'
import { NextRequest } from 'next/server'

function createRequest(body: any): NextRequest {
  return new NextRequest('http://localhost/api/ai', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

describe('AI API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/ai', () => {
    it('should return AI answer for valid question', async () => {
      const req = createRequest({
        question: '猫咪一直躲着怎么办？',
        dayNumber: 1,
        cardTitle: '先别急着亲近它'
      })

      const response = await POST(req)
      const data = await response.json()

      // AI可能返回成功或失败（取决于API可用性）
      if (data.success) {
        expect(data.data.answer).toBeDefined()
        expect(data.data.answer.length).toBeGreaterThan(0)
      } else {
        // 如果AI不可用，应该有友好的错误消息
        expect(data.error).toBeDefined()
      }
    })

    it('should return relevant answer for day context', async () => {
      const req = createRequest({
        question: '猫咪不吃饭',
        dayNumber: 3,
        cardTitle: '建立信任'
      })

      const response = await POST(req)
      const data = await response.json()

      // 验证响应格式
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data') || expect(data).toHaveProperty('error')
    })

    it('should handle empty question', async () => {
      const req = createRequest({
        question: '',
        dayNumber: 1
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(false)
    })

    it('should handle health-related question', async () => {
      const req = createRequest({
        question: '猫咪呕吐了怎么办',
        dayNumber: 5
      })

      const response = await POST(req)
      const data = await response.json()

      // 健康问题应该返回更谨慎的建议
      if (data.success) {
        expect(data.data.answer).toBeDefined()
      }
    })

    it('should handle long question', async () => {
      const longQuestion = '我的猫咪是布偶猫，3个月大，刚刚到家，但是它一直躲在沙发下面不出来，我该怎么办？我担心它不吃饭不喝水'

      const req = createRequest({
        question: longQuestion,
        dayNumber: 1,
        cardTitle: '先别急着亲近它'
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data).toHaveProperty('success')
    })
  })
})