/**
 * 认证相关组件
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'
import { signInWithEmail, signUpWithEmail, signInAsGuest } from '@/lib/auth'
import { Errors } from '@/lib/errors'

// ============ 登录表单 ============

export function LoginForm() {
  const router = useRouter()
  const { login } = useUserStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const result = await signUpWithEmail(email, password, nickname)
        if (result.error) {
          setError(result.error.userMessage)
        } else if (result.user) {
          login(result.user, result.session?.access_token || '')
          router.push('/dashboard')
        }
      } else {
        const result = await signInWithEmail(email, password)
        if (result.error) {
          setError(result.error.userMessage)
        } else if (result.user) {
          login(result.user, result.session?.access_token || '')
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('登录失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    try {
      const result = await signInAsGuest()
      if (result.user) {
        login(result.user, '')
        router.push('/dashboard')
      }
    } catch (err) {
      setError('游客登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-center mb-6">
        {mode === 'login' ? '登录' : '注册'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-petmate-primary focus:border-transparent"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-petmate-primary focus:border-transparent"
            placeholder="请输入密码"
            required
            minLength={6}
          />
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-petmate-primary focus:border-transparent"
              placeholder="铲屎官"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-petmate-primary text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-sm text-petmate-primary hover:underline"
        >
          {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-400">或</span>
        </div>
      </div>

      <button
        onClick={handleGuestLogin}
        disabled={loading}
        className="w-full py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
      >
        游客模式体验
      </button>

      <p className="mt-4 text-xs text-center text-gray-400">
        登录即表示同意服务条款和隐私政策
      </p>
    </div>
  )
}

// ============ 认证守卫 ============

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useUserStore()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return <>{children}</>
}
