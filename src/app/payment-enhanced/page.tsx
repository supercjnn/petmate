'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconCheck, IconShield, IconArrowLeft, IconStar } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import { PAYMENT_PLANS, createOrder, processPayment, calculatePrice, PaymentPlan } from '@/lib/payment'
import { LimitedOfferBanner, FeatureComparison, ValueProposition } from '@/components/Paywall'

function PaymentContent() {
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string>('quarterly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const planId = searchParams.get('plan')
    if (planId && PAYMENT_PLANS.find(p => p.id === planId)) {
      setSelectedPlan(planId)
    }
  }, [searchParams])

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // 创建订单
      const userId = JSON.parse(localStorage.getItem('petmate_user') || '{}').id || 'guest'
      const order = createOrder(userId, selectedPlan, 'wechat')

      // 处理支付（沙箱）
      const result = await processPayment(order)

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || '支付失败')
      }
    } catch (err) {
      setError('支付异常，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AppLayout title="支付成功">
        <FadeIn>
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <IconCheck className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">🎉 支付成功</h2>
            <p className="text-gray-500 mb-6">感谢您的支持，已解锁全部功能</p>
            <Link href="/dashboard">
              <Button size="lg">
                开始使用
              </Button>
            </Link>
          </Card>
        </FadeIn>
      </AppLayout>
    )
  }

  const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)
  const priceInfo = plan ? calculatePrice(plan) : null

  return (
    <AppLayout title="升级会员">
      <FadeIn>
        {/* 返回按钮 */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4">
          <IconArrowLeft className="w-4 h-4" />
          返回
        </Link>

        {/* 限时优惠 */}
        <SlideIn direction="down">
          <LimitedOfferBanner discount={25} />
        </SlideIn>

        {/* 价值展示 */}
        <SlideIn direction="up" delay={50}>
          <ValueProposition />
        </SlideIn>

        {/* 套餐选择 */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-3">选择套餐</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PAYMENT_PLANS.slice(1).map((p, i) => {
              const price = calculatePrice(p)
              return (
                <SlideIn key={p.id} delay={i * 50}>
                  <Card
                    hover
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-4 relative ${selectedPlan === p.id ? 'ring-2 ring-orange-500' : ''}`}
                  >
                    {p.recommended && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="success">
                        推荐
                      </Badge>
                    )}
                    <div className="text-center">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-3xl font-bold text-orange-500 my-2">
                        ¥{price.finalPrice}
                      </p>
                      {price.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          ¥{price.originalPrice}
                        </p>
                      )}
                      {p.duration === 'month' && (
                        <p className="text-xs text-gray-500 mt-1">¥{Math.round(price.finalPrice / 30)}/天</p>
                      )}
                      {p.duration === 'quarter' && (
                        <p className="text-xs text-gray-500 mt-1">¥{Math.round(price.finalPrice / 90)}/天</p>
                      )}
                    </div>
                  </Card>
                </SlideIn>
              )
            })}
          </div>
        </div>

        {/* 功能对比 */}
        <SlideIn direction="up" delay={100}>
          <FeatureComparison />
        </SlideIn>

        {/* 支付按钮 */}
        {plan && (
          <Card className="mt-6 sticky bottom-20 bg-white border-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{plan.name}</p>
                <p className="text-2xl font-bold text-orange-500">¥{priceInfo?.finalPrice || plan.price}</p>
              </div>
              <Button
                size="lg"
                onClick={handlePayment}
                isLoading={loading}
                disabled={loading}
              >
                {loading ? '支付中...' : '立即支付'}
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </Card>
        )}

        {/* 信任标识 */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="flex items-center gap-1"><IconShield className="w-4 h-4" /> 安全支付</span>
            <span className="flex items-center gap-1"><IconCheck className="w-4 h-4" /> 随时取消</span>
          </div>
          <p>支付即表示同意《用户协议》</p>
        </div>
      </FadeIn>
    </AppLayout>
  )
}

import Link from 'next/link'

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><Spinner size="lg" /></div>}>
      <PaymentContent />
    </Suspense>
  )
}