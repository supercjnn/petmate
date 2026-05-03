/**
 * 全局错误边界
 * 捕获React组件错误，显示友好提示
 */

'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // 调用错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 发送错误到监控服务（如Sentry）
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义fallback或默认UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
            <div className="text-4xl mb-4">😿</div>
            <h2 className="text-lg font-semibold mb-2">出错了</h2>
            <p className="text-sm text-gray-600 mb-4">
              页面遇到了一些问题，我们正在修复中
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs text-red-600 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-petmate-primary text-white rounded-lg text-sm"
              >
                重试
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ============ 特定场景错误边界 ============

export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="text-center">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-gray-600 mt-2">行动卡加载失败</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-petmate-primary text-white rounded-lg text-sm"
            >
              刷新页面
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function AIErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="text-center">
            <span className="text-2xl">🤖</span>
            <p className="text-sm text-gray-600 mt-2">AI暂时不可用</p>
            <p className="text-xs text-gray-400 mt-1">请稍后再试</p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// ============ 异步错误处理 Hook ============

export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}