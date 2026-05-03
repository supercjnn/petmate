/**
 * API 中间件
 * 统一的错误处理、日志、认证
 */

import { NextRequest, NextResponse } from 'next/server'
import { Errors, AppError, ErrorCode, errorResponse, successResponse } from './errors'

// ============ 日志中间件 ============

export function withLogging(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const start = Date.now()
    const method = req.method
    const url = req.url

    try {
      const result = await handler(req, ...args)
      const duration = Date.now() - start

      console.log(`[API] ${method} ${url} - ${duration}ms`)

      return result
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[API] ${method} ${url} - ${duration}ms - ERROR:`, error)
      throw error
    }
  }
}

// ============ 认证中间件 ============

const tokenStore = new Map<string, { userId: string; expiresAt: number }>()

export function generateToken(userId: string): string {
  const token = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`
  tokenStore.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天有效期
  })
  return token
}

export function verifyToken(token: string): string | null {
  const data = tokenStore.get(token)
  if (!data) return null

  if (Date.now() > data.expiresAt) {
    tokenStore.delete(token)
    return null
  }

  return data.userId
}

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(errorResponse(Errors.unauthorized()), { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json(errorResponse(Errors.tokenExpired()), { status: 401 })
    }

    // 将userId注入到请求中
    (req as any).userId = userId

    return handler(req, ...args)
  }
}

// ============ 请求验证中间件 ============

export function validateBody(schema: Record<string, { required: boolean; type: string }>) {
  return function (handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        const body = await req.json()

        for (const [key, rule] of Object.entries(schema)) {
          if (rule.required && !(key in body)) {
            return NextResponse.json(
              errorResponse(Errors.validation(`缺少必填字段: ${key}`)),
              { status: 400 }
            )
          }

          if (key in body && typeof body[key] !== rule.type) {
            return NextResponse.json(
              errorResponse(Errors.validation(`字段 ${key} 类型错误，期望 ${rule.type}`)),
              { status: 400 }
            )
          }
        }

        (req as any).body = body
        return handler(req, ...args)
      } catch (error) {
        return NextResponse.json(
          errorResponse(Errors.validation('请求体解析失败')),
          { status: 400 }
        )
      }
    }
  }
}

// ============ 速率限制中间件 ============

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function withRateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return function (handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      const key = `rate_limit_${ip}`

      const now = Date.now()
      const record = rateLimitStore.get(key)

      if (record && now < record.resetAt) {
        if (record.count >= maxRequests) {
          return NextResponse.json(
            errorResponse(Errors.validation('请求过于频繁，请稍后再试')),
            { status: 429 }
          )
        }
        record.count++
      } else {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
      }

      return handler(req, ...args)
    }
  }
}

// ============ CORS 中间件 ============

export function withCors(allowedOrigins: string[] = ['*']) {
  return function (handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      // 处理预检请求
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigins.includes('*')
              ? '*'
              : req.headers.get('origin') || '',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        })
      }

      const response = await handler(req, ...args)

      // 添加CORS头
      if (response instanceof NextResponse) {
        response.headers.set(
          'Access-Control-Allow-Origin',
          allowedOrigins.includes('*') ? '*' : req.headers.get('origin') || ''
        )
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      }

      return response
    }
  }
}

// ============ 组合中间件 ============

export function withMiddleware(
  handler: Function,
  options: {
    auth?: boolean
    logging?: boolean
    rateLimit?: { max: number; window: number }
    cors?: boolean
    validation?: Record<string, { required: boolean; type: string }>
  } = {}
) {
  let wrappedHandler = handler

  // 应用中间件（注意顺序）
  if (options.validation) {
    wrappedHandler = validateBody(options.validation)(wrappedHandler)
  }

  if (options.auth) {
    wrappedHandler = withAuth(wrappedHandler)
  }

  if (options.rateLimit) {
    wrappedHandler = withRateLimit(options.rateLimit.max, options.rateLimit.window)(wrappedHandler)
  }

  if (options.cors) {
    wrappedHandler = withCors()(wrappedHandler)
  }

  if (options.logging) {
    wrappedHandler = withLogging(wrappedHandler)
  }

  return wrappedHandler
}
