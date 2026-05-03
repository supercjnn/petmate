/**
 * 支付服务
 * 微信支付、支付宝支付集成
 */

// ============ 支付类型 ============

export interface PaymentOrder {
  id: string
  userId: string
  
  productType: 'premium' | 'consultation' | 'course' | 'subscription'
  productId: string
  productName: string
  
  amount: number // 分为单位
  currency: 'CNY'
  
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  
  paymentMethod?: 'wechat' | 'alipay'
  paidAt?: string
  
  metadata?: Record<string, any>
  
  createdAt: string
  updatedAt: string
}

export interface PaymentProduct {
  id: string
  name: string
  description: string
  price: number // 分
  originalPrice?: number
  type: PaymentOrder['productType']
  features: string[]
  popular?: boolean
}

// ============ 产品定义 ============

export const PRODUCTS: PaymentProduct[] = [
  {
    id: 'premium_monthly',
    name: '高级会员月卡',
    description: '解锁全部高级功能',
    price: 2900,
    originalPrice: 4900,
    type: 'subscription',
    features: ['无限AI问答', '健康档案高级分析', '品种深度指南', '优先客服'],
    popular: true
  },
  {
    id: 'premium_yearly',
    name: '高级会员年卡',
    description: '一年畅享全部功能',
    price: 19900,
    originalPrice: 58800,
    type: 'subscription',
    features: ['无限AI问答', '健康档案高级分析', '品种深度指南', '优先客服', '专属社群']
  },
  {
    id: 'consultation',
    name: '专家咨询',
    description: '一对一专家咨询',
    price: 9900,
    type: 'consultation',
    features: ['30分钟视频咨询', '专业兽医', '健康建议', '后续跟进']
  },
  {
    id: 'newcat_course',
    name: '新手养猫课程',
    description: '系统学习养猫知识',
    price: 4900,
    type: 'course',
    features: ['10节视频课程', '配套练习', '证书颁发', '永久观看']
  }
]

// ============ 内存存储 ============

const ordersStore = new Map<string, PaymentOrder>()

// ============ 订单管理 ============

/**
 * 创建订单
 */
export function createOrder(
  userId: string,
  productId: string
): PaymentOrder | null {
  const product = PRODUCTS.find(p => p.id === productId)
  if (!product) return null
  
  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  const order: PaymentOrder = {
    id,
    userId,
    productType: product.type,
    productId: product.id,
    productName: product.name,
    amount: product.price,
    currency: 'CNY',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  ordersStore.set(id, order)
  return order
}

/**
 * 获取订单
 */
export function getOrder(orderId: string): PaymentOrder | null {
  return ordersStore.get(orderId) || null
}

/**
 * 获取用户订单列表
 */
export function getUserOrders(userId: string): PaymentOrder[] {
  return Array.from(ordersStore.values())
    .filter(o => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * 更新订单状态
 */
export function updateOrderStatus(
  orderId: string,
  status: PaymentOrder['status'],
  paymentMethod?: PaymentOrder['paymentMethod']
): boolean {
  const order = ordersStore.get(orderId)
  if (!order) return false
  
  order.status = status
  order.updatedAt = new Date().toISOString()
  
  if (status === 'paid') {
    order.paidAt = new Date().toISOString()
    order.paymentMethod = paymentMethod
  }
  
  return true
}

// ============ 支付调用 ============

/**
 * 调起微信支付
 */
export async function initiateWechatPay(orderId: string): Promise<{
  success: boolean
  qrCode?: string
  deepLink?: string
  error?: string
}> {
  const order = getOrder(orderId)
  if (!order) {
    return { success: false, error: '订单不存在' }
  }
  
  // 实际需要调用微信支付API
  // 这里返回模拟数据
  
  return {
    success: true,
    qrCode: `weixin://wxpay/bizpayurl?pr=${orderId}`,
    deepLink: `weixin://wxpay/bizpayurl?pr=${orderId}`
  }
}

/**
 * 调起支付宝支付
 */
export async function initiateAlipay(orderId: string): Promise<{
  success: boolean
  form?: string
  qrCode?: string
  error?: string
}> {
  const order = getOrder(orderId)
  if (!order) {
    return { success: false, error: '订单不存在' }
  }
  
  // 实际需要调用支付宝API
  
  return {
    success: true,
    qrCode: `alipay://alipayclient?pr=${orderId}`
  }
}

/**
 * 检查支付状态
 */
export async function checkPaymentStatus(orderId: string): Promise<{
  paid: boolean
  status: PaymentOrder['status']
}> {
  const order = getOrder(orderId)
  if (!order) {
    return { paid: false, status: 'failed' }
  }
  
  // 实际需要查询支付平台
  
  return {
    paid: order.status === 'paid',
    status: order.status
  }
}

// ============ VIP权益 ============

/**
 * 检查用户VIP状态
 */
export function checkVipStatus(userId: string): {
  isVip: boolean
  expireAt?: string
  daysLeft?: number
} {
  const orders = getUserOrders(userId)
  const paidOrders = orders.filter(o => 
    o.status === 'paid' && 
    o.productType === 'subscription'
  )
  
  if (paidOrders.length === 0) {
    return { isVip: false }
  }
  
  // 简化：最后一个付费订阅订单
  const lastOrder = paidOrders[0]
  const paidAt = new Date(lastOrder.paidAt!)
  
  // 月卡30天，年卡365天
  const days = lastOrder.productId.includes('yearly') ? 365 : 30
  const expireAt = new Date(paidAt.getTime() + days * 24 * 60 * 60 * 1000)
  
  return {
    isVip: expireAt > new Date(),
    expireAt: expireAt.toISOString(),
    daysLeft: Math.max(0, Math.ceil((expireAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
  }
}

// ============ 导出 ============
