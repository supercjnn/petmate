'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          phone: phone || undefined,
          email: email || undefined,
          nickname: mode === 'register' ? nickname : undefined
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        // 保存token和用户信息
        localStorage.setItem('petmate_token', data.data.token)
        localStorage.setItem('petmate_user', JSON.stringify(data.data.user))
        
        // 跳转到dashboard
        router.push('/dashboard')
      } else {
        setError(data.error || '操作失败')
      }
    } catch (err) {
      setError('网络错误，请稍后再试')
    } finally {
      setLoading(false)
    }
  }
  
  // 游客模式
  const handleGuest = () => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      nickname: '游客',
      currentDay: 1,
      startDate: new Date().toISOString(),
      isPaid: false,
      history: {},
      settings: {
        reminderEnabled: true,
        reminderTime: '09:00',
        reminderMethod: 'browser'
      }
    }
    localStorage.setItem('petmate_user', JSON.stringify(guestUser))
    router.push('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐱</div>
          <h1 className="text-xl font-bold">宠伴 PetMate</h1>
          <p className="text-sm text-gray-500 mt-2">守护90天，安心养猫</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md">
          {/* Tab切换 */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'login' ? 'text-petmate-primary border-b-2 border-petmate-primary' : 'text-gray-400'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'register' ? 'text-petmate-primary border-b-2 border-petmate-primary' : 'text-gray-400'
              }`}
            >
              注册
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 手机号 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="输入手机号"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            {/* 邮箱（可选） */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">邮箱（可选）</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            
            {/* 昵称（注册时） */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="给猫咪取个名字？"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading || (!phone && !email)}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>
          
          {/* 游客模式 */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleGuest}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              游客模式体验
            </button>
          </div>
          
          {/* 功能说明 */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            <p>登录后可保存进度、解锁付费内容</p>
          </div>
        </div>
        
        {/* 功能预览 */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-lg">📋</p>
            <p className="text-xs text-gray-600">每日行动卡</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-lg">🤖</p>
            <p className="text-xs text-gray-600">AI助手</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <p className="text-lg">📊</p>
            <p className="text-xs text-gray-600">进度追踪</p>
          </div>
        </div>
      </div>
    </div>
  )
}