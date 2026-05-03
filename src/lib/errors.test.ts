/**
 * Lib模块单元测试
 */

import { ErrorCode, Errors, AppError, errorResponse, successResponse } from '@/lib/errors'

describe('Errors Module', () => {
  describe('ErrorCode', () => {
    it('should have all error codes defined', () => {
      expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
    })
  })

  describe('Errors Factory', () => {
    it('should create network error', () => {
      const error = Errors.network('Connection failed')
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR)
      expect(error.userMessage).toBe('Connection failed')
    })

    it('should create validation error', () => {
      const error = Errors.validation('Invalid input')
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(error.userMessage).toBe('Invalid input')
    })

    it('should create unauthorized error', () => {
      const error = Errors.unauthorized()
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED)
    })

    it('should create internal error', () => {
      const error = Errors.internal()
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR)
    })
  })

  describe('errorResponse', () => {
    it('should format error response', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Test error')
      const response = errorResponse(error)
      
      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })
  })

  describe('successResponse', () => {
    it('should format success response', () => {
      const response = successResponse({ id: 1, name: 'test' })
      
      expect(response.success).toBe(true)
      expect(response.data).toEqual({ id: 1, name: 'test' })
    })
  })
})