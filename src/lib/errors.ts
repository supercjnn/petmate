/**
 * 全局错误处理
 */

// ============ 错误类型定义 ============

export enum ErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // 数据错误
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_DATA = 'DUPLICATE_DATA',

  // 业务错误
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  AI_UNAVAILABLE = 'AI_UNAVAILABLE',
  FEATURE_LOCKED = 'FEATURE_LOCKED',

  // 系统错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

export class AppError extends Error {
  code: ErrorCode
  statusCode: number
  userMessage: string
  details?: any

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.userMessage = userMessage
    this.details = details
  }
}

// ============ 错误工厂 ============

export const Errors = {
  network: (message = '网络连接失败') =>
    new AppError(ErrorCode.NETWORK_ERROR, 'Network error', message, 503),

  timeout: (message = '请求超时，请重试') =>
    new AppError(ErrorCode.TIMEOUT, 'Request timeout', message, 408),

  unauthorized: (message = '请先登录') =>
    new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized', message, 401),

  tokenExpired: (message = '登录已过期，请重新登录') =>
    new AppError(ErrorCode.TOKEN_EXPIRED, 'Token expired', message, 401),

  invalidToken: (message = '无效的登录凭证') =>
    new AppError(ErrorCode.INVALID_TOKEN, 'Invalid token', message, 401),

  notFound: (resource = '数据') =>
    new AppError(ErrorCode.DATA_NOT_FOUND, 'Not found', `${resource}不存在`, 404),

  validation: (message: string, details?: any) =>
    new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', message, 400, details),

  duplicate: (message = '数据已存在') =>
    new AppError(ErrorCode.DUPLICATE_DATA, 'Duplicate data', message, 409),

  paymentFailed: (message = '支付失败，请重试') =>
    new AppError(ErrorCode.PAYMENT_FAILED, 'Payment failed', message, 402),

  aiUnavailable: (message = 'AI服务暂时不可用') =>
    new AppError(ErrorCode.AI_UNAVAILABLE, 'AI unavailable', message, 503),

  featureLocked: (message = '此功能需要付费解锁') =>
    new AppError(ErrorCode.FEATURE_LOCKED, 'Feature locked', message, 403),

  internal: (message = '服务器内部错误') =>
    new AppError(ErrorCode.INTERNAL_ERROR, 'Internal error', message, 500),

  database: (message = '数据库错误') =>
    new AppError(ErrorCode.DATABASE_ERROR, 'Database error', message, 500),

  storage: (message = '存储空间不足') =>
    new AppError(ErrorCode.STORAGE_ERROR, 'Storage error', message, 500)
}

// ============ 错误处理函数 ============

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return Errors.network()
    }

    // 超时
    if (error.message.includes('timeout') || error.message.includes('abort')) {
      return Errors.timeout()
    }

    // 默认内部错误
    return Errors.internal(error.message)
  }

  return Errors.internal()
}

// ============ API响应标准化 ============

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: ErrorCode
    message: string
    details?: any
  }
  message?: string
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

export function errorResponse(error: AppError): ApiResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.userMessage,
      details: error.details
    }
  }
}

// ============ 重试机制 ============

export interface RetryOptions {
  maxAttempts: number
  delayMs: number
  backoff?: boolean
  onRetry?: (attempt: number, error: Error) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, delayMs, backoff = true, onRetry } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs

        if (onRetry) {
          onRetry(attempt, lastError)
        }

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || Errors.internal()
}

// ============ API调用封装 ============

export async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  retryOptions?: Partial<RetryOptions>
): Promise<ApiResponse<T>> {
  const defaultRetry: RetryOptions = {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: true,
    ...retryOptions
  }

  try {
    const response = await withRetry(
      () => fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }),
      defaultRetry
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw Errors.internal(error.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return errorResponse(handleError(error))
  }
}
