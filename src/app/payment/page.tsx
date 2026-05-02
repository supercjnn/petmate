'use client'

import { useState, useEffect } from 'react'

export default function PaymentPage() {
  const [method, setMethod] = useState<'wechat' | 'alipay'>('wechat')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const userData = localStorage.getItem('petmate_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])
  
  const handlePay = async () => {
    if (!user) {
      alert('请先登录')
      return
    }
    
    setLoading(true)
    
    try {
      // 创建订单
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          method
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setOrderId(data.data.orderId)
        
        // MVP模拟：直接调用成功
        const simulateRes = await fetch(`/api/payment?orderId=${data.data.orderId}&simulate=success`)
        const simulateData = await simulateRes.json()
        
        if (simulateData.success) {
          setPaid(true)
          // 更新用户状态
          const updatedUser = { ...user, isPaid: true, paidAt: new Date().toISOString() }
          localStorage.setItem('petmate_user', JSON.stringify(updatedUser))
        }
      }
    } catch (error) {
      alert('支付失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }
  
  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-xl font-bold mb-2">支付成功！</h1>
            <p className="text-sm text-gray-600 mb-4">
              已解锁完整90天内容，所有功能均可使用
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-green-600">✓ 91天行动卡</p>
              <p className="text-sm text-green-600">✓ 无限AI问答</p>
              <p className="text-sm text-green-600">✓ 数据云同步</p>
              <p className="text-sm text-green-600">✓ 笔记导出</p>
            </div>
            <a href="/dashboard" className="btn-primary py-3 block">
              开始使用
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h1 className="text-lg font-bold mb-4 text-center">解锁完整90天</h1>
          
          {/* 价格 */}
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-petmate-primary">¥29</p>
            <p className="text-xs text-gray-500">一次性付费，永久使用</p>
          </div>
          
          {/* 功能对比 */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">免费版</p>
                <p className="text-xs text-gray-400">Day 1-3</p>
              </div>
              <div className="p-2 bg-petmate-primary/10 rounded">
                <p className="font-medium">完整版</p>
                <p className="text-xs text-petmate-primary">Day 1-90</p>
              </div>
            </div>
          </div>
          
          {/* 支付方式 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">选择支付方式</p>
            <div className="flex gap-3">
              <button
                onClick={() => setMethod('wechat')}
                className={`flex-1 py-3 rounded-lg border-2 ${
                  method === 'wechat' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <span className="text-2xl">💚</span>
                <p className="text-sm mt-1">微信</p>
              </button>
              <button
                onClick={() => setMethod('alipay')}
                className={`flex-1 py-3 rounded-lg border-2 ${
                  method === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <span className="text-2xl">💙</span>
                <p className="text-sm mt-1">支付宝</p>
              </button>
            </div>
          </div>
          
          {/* MVP提示 */}
          <div className="bg-yellow-50 rounded p-2 text-xs text-yellow-700 mb-4">
            ⚠️ MVP测试模式：点击支付将直接成功（无需真实支付）
          </div>
          
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? '处理中...' : '立即支付 ¥29'}
          </button>
          
          {/* 安全说明 */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            <p>支付安全 · 数据加密 · 退款保障</p>
          </div>
        </div>
      </div>
    </div>
  )
}