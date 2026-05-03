'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Card, Badge } from '@/components/ui'
import { IconLock, IconCheck, IconShield, IconStar } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import { PAYMENT_PLANS, calculatePrice, PaymentPlan } from '@/lib/payment'

interface PaywallProps {
  feature?: string
  message?: string
  showPlans?: boolean
}

export function Paywall({ 
  feature = '此功能', 
  message,
  showPlans = true 
}: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <FadeIn>
      <Card className="text-center py-8">
        {/* 锁定图标 */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
          <IconLock className="w-8 h-8 text-orange-500" />
        </div>

        {/* 提示信息 */}
        <h3 className="text-lg font-bold mb-2">
          {message || `${feature}需要会员权限`}
        </h3>
        <p className="text-gray-500 mb-6">
          解锁全部内容，开启科学养猫之旅
        </p>

        {/* 快速解锁按钮 */}
        <Link href="/payment">
          <Button size="lg" className="shadow-lg">
            立即解锁
            <IconStar className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        {/* 信任标识 */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
          <span>✓ 随时取消</span>
          <span>✓ 安全支付</span>
        </div>
      </Card>

      {/* 套餐预览 */}
      {showPlans && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 text-center mb-4">会员套餐</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PAYMENT_PLANS.slice(1).map((plan, i) => {
              const price = calculatePrice(plan)
              return (
                <SlideIn key={plan.id} delay={i * 50}>
                  <Card
                    hover
                    className={`text-center p-4 ${selectedPlan === plan.id ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.recommended && (
                      <Badge className="mb-2" variant="success">推荐</Badge>
                    )}
                    <p className="font-bold">{plan.name}</p>
                    <p className="text-2xl font-bold text-orange-500 my-2">
                      ¥{price.finalPrice}
                    </p>
                    {price.discount > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        ¥{price.originalPrice}
                      </p>
                    )}
                  </Card>
                </SlideIn>
              )
            })}
          </div>

          {/* 确认按钮 */}
          {selectedPlan && (
            <SlideIn direction="up" className="mt-4">
              <Link href={`/payment?plan=${selectedPlan}`}>
                <Button fullWidth size="lg">
                  选择此套餐
                </Button>
              </Link>
            </SlideIn>
          )}
        </div>
      )}
    </FadeIn>
  )
}

// 功能对比组件
export function FeatureComparison() {
  const features = [
    { name: '行动卡数量', free: '前3天', paid: '全部90天' },
    { name: 'AI问答', free: '每日3次', paid: '无限次' },
    { name: '品种专属内容', free: '❌', paid: '✅' },
    { name: '健康档案', free: '❌', paid: '✅' },
    { name: '成就系统', free: '基础', paid: '完整' },
    { name: '导出功能', free: '❌', paid: '✅' },
    { name: '客服支持', free: '工单', paid: '优先响应' },
  ]

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-3 px-4 text-left">功能</th>
            <th className="py-3 px-4 text-center">免费版</th>
            <th className="py-3 px-4 text-center bg-orange-50">
              <span className="text-orange-600 font-bold">会员版</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="py-3 px-4">{f.name}</td>
              <td className="py-3 px-4 text-center text-gray-500">{f.free}</td>
              <td className="py-3 px-4 text-center bg-orange-50/50">
                <span className="text-orange-600 font-medium">{f.paid}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// 限时优惠横幅
export function LimitedOfferBanner({ 
  discount = 25, 
  expiresAt = '2026-06-30' 
}: { 
  discount?: number
  expiresAt?: string 
}) {
  const daysLeft = Math.max(1, Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  ))

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 text-center animate-pulse">
      <p className="font-bold">🔥 限时优惠 -{discount}%</p>
      <p className="text-sm opacity-90">仅剩 {daysLeft} 天</p>
    </div>
  )
}

// 收益展示组件
export function ValueProposition() {
  const values = [
    { icon: '📚', title: '90天完整指导', desc: '价值¥199' },
    { icon: '🤖', title: '无限AI问答', desc: '价值¥99/月' },
    { icon: '📋', title: '健康档案管理', desc: '价值¥49' },
    { icon: '🎯', title: '品种专属内容', desc: '价值¥29' },
  ]

  const totalValue = 199 + 99 + 49 + 29

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-purple-50">
      <p className="text-center text-sm text-gray-500 mb-3">总价值 ¥{totalValue}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {values.map((v, i) => (
          <div key={i} className="text-center">
            <span className="text-2xl">{v.icon}</span>
            <p className="text-sm font-medium mt-1">{v.title}</p>
            <p className="text-xs text-gray-500">{v.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}