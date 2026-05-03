/**
 * 数据分析服务
 * 用户行为追踪、漏斗分析、留存分析
 */

// ============ 事件类型 ============

export interface AnalyticsEvent {
  id: string
  userId?: string
  eventType: AnalyticsEventType
  properties: Record<string, any>
  timestamp: string
  sessionId?: string
  platform: 'web' | 'ios' | 'android'
  version: string
}

export type AnalyticsEventType =
  // 页面访问
  | 'page_view'
  | 'page_exit'
  // 用户行为
  | 'action_complete'
  | 'action_skip'
  | 'card_view'
  | 'card_complete'
  // AI交互
  | 'ai_query'
  | 'ai_feedback'
  // 社交行为
  | 'post_create'
  | 'post_view'
  | 'comment_create'
  | 'like'
  | 'share'
  // 支付行为
  | 'payment_initiate'
  | 'payment_complete'
  | 'payment_fail'
  // 其他
  | 'notification_click'
  | 'error'

// ============ 漏斗定义 ============

export interface Funnel {
  id: string
  name: string
  steps: FunnelStep[]
}

export interface FunnelStep {
  id: string
  name: string
  event: AnalyticsEventType
  properties?: Record<string, any>
}

export const CORE_FUNNELS: Funnel[] = [
  {
    id: 'onboarding',
    name: '新手引导漏斗',
    steps: [
      { id: 'landing', name: '访问首页', event: 'page_view' },
      { id: 'signup', name: '开始使用', event: 'action_complete' },
      { id: 'cat_setup', name: '填写猫咪信息', event: 'action_complete' },
      { id: 'first_card', name: '查看第一张卡片', event: 'card_view' },
      { id: 'first_action', name: '完成第一个行动', event: 'action_complete' },
      { id: 'day1_complete', name: '完成第一天', event: 'card_complete' }
    ]
  },
  {
    id: 'conversion',
    name: '付费转化漏斗',
    steps: [
      { id: 'free_start', name: '免费用户', event: 'page_view' },
      { id: 'paywall_view', name: '看到付费墙', event: 'page_view' },
      { id: 'pay_click', name: '点击付费', event: 'payment_initiate' },
      { id: 'pay_success', name: '支付成功', event: 'payment_complete' }
    ]
  },
  {
    id: 'social',
    name: '社交互动漏斗',
    steps: [
      { id: 'community_view', name: '访问社区', event: 'page_view' },
      { id: 'post_view', name: '查看帖子', event: 'post_view' },
      { id: 'like', name: '点赞', event: 'like' },
      { id: 'comment', name: '评论', event: 'comment_create' },
      { id: 'share', name: '分享', event: 'share' }
    ]
  }
]

// ============ 内存存储 ============

const eventsStore: AnalyticsEvent[] = []

// ============ 事件追踪 ============

/**
 * 追踪事件
 */
export function trackEvent(
  eventType: AnalyticsEventType,
  properties: Record<string, any> = {},
  userId?: string
): AnalyticsEvent {
  const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  const event: AnalyticsEvent = {
    id,
    userId,
    eventType,
    properties,
    timestamp: new Date().toISOString(),
    platform: 'web',
    version: '1.9.0'
  }
  
  eventsStore.unshift(event)
  
  // 限制存储数量
  if (eventsStore.length > 10000) {
    eventsStore.pop()
  }
  
  return event
}

/**
 * 批量追踪事件
 */
export function trackBatch(events: Array<{
  eventType: AnalyticsEventType
  properties?: Record<string, any>
  userId?: string
}>): AnalyticsEvent[] {
  return events.map(e => trackEvent(e.eventType, e.properties, e.userId))
}

// ============ 漏斗分析 ============

/**
 * 计算漏斗转化
 */
export function calculateFunnel(
  funnelId: string,
  options?: {
    startDate?: string
    endDate?: string
    userId?: string
  }
): {
  funnel: Funnel
  steps: Array<{
    step: FunnelStep
    count: number
    percentage: number
    dropoff: number
  }>
  totalUsers: number
  conversionRate: number
} {
  const funnel = CORE_FUNNELS.find(f => f.id === funnelId)
  if (!funnel) {
    throw new Error(`Funnel ${funnelId} not found`)
  }
  
  let filteredEvents = [...eventsStore]
  
  if (options?.startDate) {
    filteredEvents = filteredEvents.filter(e => e.timestamp >= options.startDate!)
  }
  if (options?.endDate) {
    filteredEvents = filteredEvents.filter(e => e.timestamp <= options.endDate!)
  }
  if (options?.userId) {
    filteredEvents = filteredEvents.filter(e => e.userId === options.userId)
  }
  
  // 先计算所有步骤的计数
  const counts = funnel.steps.map((step) => {
    return filteredEvents.filter(e => 
      e.eventType === step.event &&
      (!step.properties || Object.entries(step.properties).every(([k, v]) => e.properties[k] === v))
    ).length
  })
  
  // 再构建步骤数据
  const stepsData: Array<{ step: FunnelStep; count: number; percentage: number; dropoff: number }> = funnel.steps.map((step, index) => {
    const count = counts[index]
    const prevCount = index === 0 ? count : counts[index - 1]
    const percentage = index === 0 ? 100 : (prevCount > 0 ? Math.round((count / prevCount) * 100) : 0)
    const dropoff = index === 0 ? 0 : prevCount - count
    
    return { step, count, percentage, dropoff }
  })
  
  const totalUsers = stepsData[0]?.count || 0
  const lastStep = stepsData[stepsData.length - 1]
  const conversionRate = totalUsers > 0 ? Math.round((lastStep.count / totalUsers) * 100) : 0
  
  return {
    funnel,
    steps: stepsData,
    totalUsers,
    conversionRate
  }
}

// ============ 留存分析 ============

/**
 * 计算留存率
 */
export function calculateRetention(cohortDate: string): {
  day1: number
  day7: number
  day30: number
  data: Array<{ day: number; rate: number }>
} {
  const cohortUsers = eventsStore
    .filter(e => e.timestamp.startsWith(cohortDate) && e.eventType === 'action_complete')
    .map(e => e.userId)
    .filter(Boolean)
  
  const uniqueUsers = [...new Set(cohortUsers)]
  
  if (uniqueUsers.length === 0) {
    return { day1: 0, day7: 0, day30: 0, data: [] }
  }
  
  const data = []
  for (let day = 1; day <= 30; day++) {
    const targetDate = new Date(cohortDate)
    targetDate.setDate(targetDate.getDate() + day)
    const dateStr = targetDate.toISOString().split('T')[0]
    
    const activeUsers = eventsStore
      .filter(e => e.timestamp.startsWith(dateStr) && e.eventType === 'action_complete')
      .map(e => e.userId)
      .filter(Boolean)
    
    const retained = uniqueUsers.filter(u => activeUsers.includes(u)).length
    const rate = Math.round((retained / uniqueUsers.length) * 100)
    
    data.push({ day, rate })
  }
  
  return {
    day1: data[0]?.rate || 0,
    day7: data[6]?.rate || 0,
    day30: data[29]?.rate || 0,
    data
  }
}

// ============ 用户行为分析 ============

/**
 * 获取用户行为统计
 */
export function getUserAnalytics(userId: string): {
  totalEvents: number
  lastActive: string
  avgSessionLength: number
  mostUsedFeatures: Array<{ feature: string; count: number }>
  engagementScore: number
} {
  const userEvents = eventsStore.filter(e => e.userId === userId)
  
  if (userEvents.length === 0) {
    return {
      totalEvents: 0,
      lastActive: '',
      avgSessionLength: 0,
      mostUsedFeatures: [],
      engagementScore: 0
    }
  }
  
  const lastActive = userEvents[0].timestamp
  
  // 功能使用统计
  const featureCounts: Record<string, number> = {}
  userEvents.forEach(e => {
    const feature = e.eventType
    featureCounts[feature] = (featureCounts[feature] || 0) + 1
  })
  
  const mostUsedFeatures = Object.entries(featureCounts)
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // 参与度评分（简化）
  const engagementScore = Math.min(100, userEvents.length)
  
  return {
    totalEvents: userEvents.length,
    lastActive,
    avgSessionLength: 5, // 简化
    mostUsedFeatures,
    engagementScore
  }
}

// ============ 导出 ============
