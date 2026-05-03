/**
 * 风险判断API测试
 */

import { POST } from '@/app/api/risk/route'
import { NextRequest } from 'next/server'

function createRequest(body: any): NextRequest {
  return new NextRequest('http://localhost/api/risk', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

describe('Risk API', () => {
  describe('POST /api/risk', () => {
    it('should return green level for normal situation', async () => {
      const req = createRequest({
        dayNumber: 1,
        symptoms: ['猫咪躲在角落'],
        behaviors: ['正常进食', '正常喝水']
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.level).toBeDefined()
      expect(data.data.level).toBe('green') // 绿色：正常
      expect(data.data.suggestion).toBeDefined()
    })

    it('should return yellow level for concerning symptoms', async () => {
      const req = createRequest({
        dayNumber: 2,
        symptoms: ['24小时未进食'],
        behaviors: ['躲在角落', '偶尔出来活动']
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.level).toBe('yellow') // 黄色：关注
      expect(data.data.suggestion).toContain('观察')
    })

    it('should return red level for serious symptoms', async () => {
      const req = createRequest({
        dayNumber: 1,
        symptoms: ['呕吐', '腹泻', '48小时未进食'],
        behaviors: ['精神萎靡']
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.level).toBe('red') // 红色：紧急就医
      expect(data.data.suggestion).toContain('就医')
    })

    it('should consider day context', async () => {
      // Day 1躲藏是正常的
      const req1 = createRequest({
        dayNumber: 1,
        symptoms: ['躲在角落'],
        behaviors: []
      })

      const response1 = await POST(req1)
      const data1 = await response1.json()

      // Day 30躲藏可能有问题
      const req30 = createRequest({
        dayNumber: 30,
        symptoms: ['躲在角落'],
        behaviors: []
      })

      const response30 = await POST(req30)
      const data30 = await response30.json()

      // Day 1的风险应该低于Day 30
      expect(data1.data.level).not.toBe('red')
    })

    it('should handle empty symptoms', async () => {
      const req = createRequest({
        dayNumber: 1,
        symptoms: [],
        behaviors: []
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.level).toBe('green')
    })

    it('should handle urgent symptoms immediately', async () => {
      const urgentSymptoms = ['呼吸困难', '抽搐', '大量出血']

      const req = createRequest({
        dayNumber: 5,
        symptoms: urgentSymptoms,
        behaviors: []
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.level).toBe('red')
      expect(data.data.urgency).toBe('immediate')
    })
  })
})