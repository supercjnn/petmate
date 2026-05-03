/**
 * 用户API测试
 */

import { POST, GET } from '@/app/api/user/route'
import { NextRequest } from 'next/server'

// Mock NextRequest
function createRequest(body: any = {}, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/user', {
    method: 'POST',
    headers: new Headers(headers),
    body: JSON.stringify(body)
  })
}

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/user', () => {
    it('should register new user with phone', async () => {
      const req = createRequest({
        action: 'register',
        phone: '13800138000',
        nickname: '测试用户'
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.user).toBeDefined()
      expect(data.data.user.phone).toBe('13800138000')
      expect(data.data.user.nickname).toBe('测试用户')
      expect(data.data.token).toBeDefined()
    })

    it('should register new user with email', async () => {
      const req = createRequest({
        action: 'register',
        email: 'test@example.com',
        nickname: '邮箱用户'
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('test@example.com')
    })

    it('should fail without phone or email', async () => {
      const req = createRequest({
        action: 'register',
        nickname: '无联系方式'
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(response.status).toBe(400)
    })

    it('should login existing user', async () => {
      // 先注册
      const registerReq = createRequest({
        action: 'register',
        phone: '13900139000'
      })
      await POST(registerReq)

      // 再登录
      const loginReq = createRequest({
        action: 'login',
        phone: '13900139000'
      })

      const response = await POST(loginReq)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.token).toBeDefined()
    })

    it('should fail login for non-existent user', async () => {
      const req = createRequest({
        action: 'login',
        phone: '99999999999'
      })

      const response = await POST(req)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/user', () => {
    it('should return user with valid token', async () => {
      // 先注册获取token
      const registerReq = createRequest({
        action: 'register',
        phone: '13800138001'
      })
      const registerResponse = await POST(registerReq)
      const registerData = await registerResponse.json()
      const token = registerData.data.token

      // 用token获取用户
      const getReq = createRequest({}, {
        'Authorization': `Bearer ${token}`
      })
      getReq.method = 'GET'

      const response = await GET(getReq as NextRequest)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.user).toBeDefined()
    })

    it('should fail without token', async () => {
      const req = createRequest({})
      req.method = 'GET'

      const response = await GET(req as NextRequest)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(response.status).toBe(401)
    })

    it('should fail with invalid token', async () => {
      const req = createRequest({}, {
        'Authorization': 'Bearer invalid_token'
      })
      req.method = 'GET'

      const response = await GET(req as NextRequest)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(response.status).toBe(401)
    })
  })
})