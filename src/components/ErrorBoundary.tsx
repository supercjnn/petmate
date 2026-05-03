'use client'

import { Component, type ReactNode } from 'react'
import { Errors } from '@/lib/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误
    console.error('[ErrorBoundary]', error, errorInfo)
    
    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // 发送错误到监控服务（可选）
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const error = this.state.error
      const isNetworkError = error?.message?.includes('network') || error?.message?.includes('fetch')
      const isTimeout = error?.message?.includes('timeout')

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              {isNetworkError ? (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isNetworkError ? '网络连接失败' : isTimeout ? '请求超时' : '出错了'}
            </h2>

            <p className="text-gray-600 mb-4">
              {isNetworkError 
                ? '请检查网络连接后重试' 
                : isTimeout 
                  ? '请求处理时间过长，请稍后重试'
                  : error?.message || '发生了未知错误，请刷新页面重试'}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// API错误边界（用于API调用）
export function ApiErrorFallback({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const appError = error as any
  
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
        <div>
          <p className="text-red-800 font-medium">{appError.userMessage || error.message}</p>
          {onRetry && (
            <button onClick={onRetry} className="text-red-600 underline text-sm mt-1">
              点击重试
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 全局错误处理Hook
export function useErrorHandler() {
  const handleError = (error: Error | unknown, context?: string) => {
    // 标准化错误
    let appError: Error
    if (error instanceof Error) {
      appError = error
    } else if (typeof error === 'string') {
      appError = new Error(error)
    } else {
      appError = Errors.internal()
    }

    // 记录错误
    console.error(`[${context || 'App'}]`, appError)

    // 发送到监控服务
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(appError, {
        tags: { context: context || 'unknown' },
      })
    }

    return appError
  }

  return { handleError }
}