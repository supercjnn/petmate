/**
 * 支付系统核心
 * 支持微信支付沙箱、订单管理、订阅模式
 */

export interface PaymentPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  duration: '3days' | 'week' | 'month' | 'quarter' | 'year' | 'lifetime'
  features: string[]
  recommended?: boolean
  discount?: {
    type: 'percent' | 'fixed'
    value: number
    expiresAt?: string
  }
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'trial',
    name: '免费体验',
    price: 0,
    duration: '3days',
    features: [
      '前3天行动卡',
      '基础AI问答',
      '笔记记录功能'
    ]
  },
  {
    id: 'monthly',
    name: '月度会员',
    price: 29,
    originalPrice: 39,
    duration: 'month',
    features: [
      '全部90天行动卡',
      '无限AI问答',
      '品种专属内容',
      '健康档案管理',
      '成就系统完整解锁'
    ],
    discount: {
      type: 'percent',
      value: 25,
      expiresAt: '2026-06-30'
    }
  },
  {
    id: 'quarterly',
    name: '季度会员',
    price: 69,
    originalPrice: 117,
    duration: 'quarter',
    recommended: true,
    features: [
      '全部90天行动卡',
      '无限AI问答',
      '品种专属内容',
      '健康档案管理',
      '成就系统完整解锁',
      '优先客服支持'
    ],
    discount: {
      type: 'percent',
      value: 41
    }
  },
  {
    id: 'lifetime',
    name: '永久会员',
    price: 199,
    originalPrice: 299,
    duration: 'lifetime',
    features: [
      '永久使用权限',
      '全部功能无限制',
      '未来更新免费',
      '1对1养猫咨询',
      'VIP专属社群',
      '终身客服支持'
    ],
    discount: {
      type: 'fixed',
      value: 100
    }
  }
]

export interface Order {
  id: string
  userId: string
  planId: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'wechat' | 'alipay'
  transactionId?: string
  createdAt: string
  paidAt?: string
  metadata?: Record<string, any>
}

// 创建订单
export function createOrder(
  userId: string,
  planId: string,
  paymentMethod: 'wechat' | 'alipay'
): Order {
  const plan = PAYMENT_PLANS.find(p => p.id === planId)
  if (!plan) {
    throw new Error('无效的套餐')
  }

  const order: Order = {
    id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    planId,
    amount: plan.price,
    status: 'pending',
    paymentMethod,
    createdAt: new Date().toISOString()
  }

  // 保存到localStorage（演示用）
  const orders = JSON.parse(localStorage.getItem('petmate_orders') || '[]')
  orders.push(order)
  localStorage.setItem('petmate_orders', JSON.stringify(orders))

  return order
}

// 模拟支付（沙箱）
export async function processPayment(order: Order): Promise<{
  success: boolean
  transactionId?: string
  error?: string
}> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 沙箱模式：90%成功率
  const success = Math.random() < 0.9

  if (success) {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    
    // 更新订单状态
    updateOrderStatus(order.id, 'paid', transactionId)
    
    // 更新用户权益
    updateUserMembership(order.userId, order.planId)

    return { success: true, transactionId }
  } else {
    updateOrderStatus(order.id, 'failed')
    return { success: false, error: '支付失败，请重试' }
  }
}

// 更新订单状态
function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  transactionId?: string
) {
  const orders = JSON.parse(localStorage.getItem('petmate_orders') || '[]')
  const orderIndex = orders.findIndex((o: Order) => o.id === orderId)
  
  if (orderIndex >= 0) {
    orders[orderIndex].status = status
    if (transactionId) {
      orders[orderIndex].transactionId = transactionId
    }
    if (status === 'paid') {
      orders[orderIndex].paidAt = new Date().toISOString()
    }
    localStorage.setItem('petmate_orders', JSON.stringify(orders))
  }
}

// 更新用户会员权益
function updateUserMembership(userId: string, planId: string) {
  const plan = PAYMENT_PLANS.find(p => p.id === planId)
  if (!plan) return

  const userData = localStorage.getItem('petmate_user')
  if (userData) {
    const user = JSON.parse(userData)
    
    // 计算会员到期时间
    let expiresAt: string
    const now = new Date()
    
    switch (plan.duration) {
      case '3days':
        expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'week':
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'month':
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'quarter':
        expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'year':
        expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'lifetime':
        expiresAt = new Date('2099-12-31').toISOString()
        break
    }

    user.isPaid = true
    user.plan = planId
    user.paidAt = new Date().toISOString()
    user.expiresAt = expiresAt
    
    localStorage.setItem('petmate_user', JSON.stringify(user))
  }
}

// 检查会员状态
export function checkMembership(): {
  isPaid: boolean
  plan?: string
  expiresAt?: string
  daysLeft?: number
} {
  const userData = localStorage.getItem('petmate_user')
  if (!userData) {
    return { isPaid: false }
  }

  const user = JSON.parse(userData)
  
  if (!user.isPaid || !user.expiresAt) {
    return { isPaid: false }
  }

  const expiresAt = new Date(user.expiresAt)
  const now = new Date()
  
  if (expiresAt <= now) {
    // 会员已过期
    user.isPaid = false
    localStorage.setItem('petmate_user', JSON.stringify(user))
    return { isPaid: false }
  }

  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

  return {
    isPaid: true,
    plan: user.plan,
    expiresAt: user.expiresAt,
    daysLeft
  }
}

// 计算价格（含折扣）
export function calculatePrice(plan: PaymentPlan): {
  originalPrice: number
  discount: number
  finalPrice: number
} {
  let discount = 0

  if (plan.discount) {
    if (plan.discount.type === 'percent') {
      discount = Math.round(plan.price * (plan.discount.value / 100))
    } else {
      discount = plan.discount.value
    }
  }

  return {
    originalPrice: plan.originalPrice || plan.price,
    discount,
    finalPrice: plan.price - discount
  }
}

// 支付追踪
export function trackPayment(
  event: 'initiate' | 'success' | 'fail' | 'refund',
  order: Order
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `payment_${event}`, {
      order_id: order.id,
      plan_id: order.planId,
      amount: order.amount,
      payment_method: order.paymentMethod
    })
  }
}